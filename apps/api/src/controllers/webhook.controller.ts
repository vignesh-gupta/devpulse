import type { Context } from "hono";
import { GitHubClient } from "@devpulse/github";
import services from "../services/github.service";
import type { AuthType } from "../auth";
import { createHmac, timingSafeEqual } from "crypto";

// GitHub webhook event types
export interface GitHubWebhookEvent {
  action?: string;
  repository?: {
    id: number;
    name: string;
    full_name: string;
    owner: {
      login: string;
    };
  };
  sender?: {
    login: string;
  };
  commits?: Array<{
    id: string;
    message: string;
    url: string;
    author: {
      name: string;
      email: string;
    };
    timestamp: string;
    added: string[];
    removed: string[];
    modified: string[];
  }>;
  pull_request?: {
    id: number;
    number: number;
    title: string;
    html_url: string;
    state: string;
    merged: boolean;
    merged_at: string | null;
    created_at: string;
    updated_at: string;
  };
  issue?: {
    id: number;
    number: number;
    title: string;
    html_url: string;
    state: string;
    created_at: string;
    updated_at: string;
  };
}

/**
 * Verify GitHub webhook signature
 */
function verifyGitHubSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  if (!signature || !signature.startsWith('sha256=')) {
    return false;
  }

  const hmac = createHmac('sha256', secret);
  hmac.update(payload, 'utf8');
  const calculatedSignature = `sha256=${hmac.digest('hex')}`;
  
  const signatureBuffer = Buffer.from(signature, 'utf8');
  const calculatedBuffer = Buffer.from(calculatedSignature, 'utf8');
  
  return signatureBuffer.length === calculatedBuffer.length &&
         timingSafeEqual(signatureBuffer, calculatedBuffer);
}

/**
 * Handle GitHub webhook events
 * POST /api/github/webhook
 */
export async function handleWebhook(c: Context<{ Variables: AuthType }>) {
  try {
    const signature = c.req.header('x-hub-signature-256');
    const event = c.req.header('x-github-event');
    const delivery = c.req.header('x-github-delivery');
    
    if (!signature || !event || !delivery) {
      return c.json({ error: 'Missing required headers' }, 400);
    }

    const payload = await c.req.text();
    const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.error('GitHub webhook secret not configured');
      return c.json({ error: 'Webhook not configured' }, 500);
    }

    // Verify signature
    if (!verifyGitHubSignature(payload, signature, webhookSecret)) {
      console.error('Invalid webhook signature');
      return c.json({ error: 'Invalid signature' }, 401);
    }

    const eventData: GitHubWebhookEvent = JSON.parse(payload);
    
    // Log webhook event
    console.log(`Received GitHub webhook: ${event} (${delivery})`);
    
    // Process the webhook based on event type
    await processWebhookEvent(event, eventData);
    
    return c.json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return c.json({ error: 'Failed to process webhook' }, 500);
  }
}

/**
 * Process different types of webhook events
 */
async function processWebhookEvent(eventType: string, data: GitHubWebhookEvent) {
  try {
    switch (eventType) {
      case 'push':
        await handlePushEvent(data);
        break;
      case 'pull_request':
        await handlePullRequestEvent(data);
        break;
      case 'issues':
        await handleIssueEvent(data);
        break;
      case 'ping':
        console.log('Webhook ping received');
        break;
      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }
  } catch (error) {
    console.error(`Error processing ${eventType} webhook:`, error);
    throw error;
  }
}

/**
 * Handle push events (commits)
 */
async function handlePushEvent(data: GitHubWebhookEvent) {
  if (!data.repository || !data.commits) {
    return;
  }

  const repoFullName = data.repository.full_name;
  
  // Find users who have this repository connected
  const connectedUsers = await services.getUsersWithRepository(data.repository.id);
  
  for (const userId of connectedUsers) {
    try {
      // Trigger a sync for the user to capture the new commits
      await services.syncRepositoryData(userId, repoFullName);
      console.log(`Synced repository ${repoFullName} for user ${userId}`);
    } catch (error) {
      console.error(`Failed to sync ${repoFullName} for user ${userId}:`, error);
    }
  }
}

/**
 * Handle pull request events
 */
async function handlePullRequestEvent(data: GitHubWebhookEvent) {
  if (!data.repository || !data.pull_request) {
    return;
  }

  const repoFullName = data.repository.full_name;
  const connectedUsers = await services.getUsersWithRepository(data.repository.id);
  
  for (const userId of connectedUsers) {
    try {
      await services.syncRepositoryData(userId, repoFullName);
      console.log(`Synced PR data for repository ${repoFullName} for user ${userId}`);
    } catch (error) {
      console.error(`Failed to sync PR data for ${repoFullName} for user ${userId}:`, error);
    }
  }
}

/**
 * Handle issue events
 */
async function handleIssueEvent(data: GitHubWebhookEvent) {
  if (!data.repository || !data.issue) {
    return;
  }

  const repoFullName = data.repository.full_name;
  const connectedUsers = await services.getUsersWithRepository(data.repository.id);
  
  for (const userId of connectedUsers) {
    try {
      await services.syncRepositoryData(userId, repoFullName);
      console.log(`Synced issue data for repository ${repoFullName} for user ${userId}`);
    } catch (error) {
      console.error(`Failed to sync issue data for ${repoFullName} for user ${userId}:`, error);
    }
  }
}

/**
 * Setup GitHub webhook for a repository
 * POST /api/github/repositories/:owner/:repo/webhook
 */
export async function setupWebhook(c: Context<{ Variables: AuthType }>) {
  try {
    const user = c.get("user");
    const owner = c.req.param("owner");
    const repo = c.req.param("repo");

    if (!user?.id) {
      return c.json({ error: "User not found" }, 400);
    }

    if (!owner || !repo) {
      return c.json({ error: "Owner and repository name are required" }, 400);
    }

    // Get the user's GitHub token
    const githubToken = await services.getGitHubToken(user.id);
    if (!githubToken) {
      return c.json({ error: "GitHub not connected" }, 400);
    }

    const github = new GitHubClient({ accessToken: githubToken.accessToken });
    
    // Setup webhook
    const webhookUrl = `${process.env.API_URL || 'http://localhost:8000'}/api/github/webhook`;
    const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      return c.json({ error: "Webhook secret not configured" }, 500);
    }

    const webhook = await github.createWebhook(
      owner,
      repo,
      {
        url: webhookUrl,
        content_type: 'json',
        secret: webhookSecret,
        insecure_ssl: '0'
      },
      ['push', 'pull_request', 'issues']
    );

    return c.json({
      message: "Webhook setup successfully",
      webhook: {
        id: webhook.data.id,
        url: webhook.data.config.url,
        events: webhook.data.events
      }
    });
  } catch (error) {
    console.error("Error setting up webhook:", error);
    
    if (error instanceof Error) {
      if (error.message.includes('Hook already exists')) {
        return c.json({ 
          message: "Webhook already exists for this repository",
          existing: true 
        });
      }
    }

    return c.json({ error: "Failed to setup webhook" }, 500);
  }
}

/**
 * Remove GitHub webhook for a repository
 * DELETE /api/github/repositories/:owner/:repo/webhook
 */
export async function removeWebhook(c: Context<{ Variables: AuthType }>) {
  try {
    const user = c.get("user");
    const owner = c.req.param("owner");
    const repo = c.req.param("repo");

    if (!user?.id) {
      return c.json({ error: "User not found" }, 400);
    }

    if (!owner || !repo) {
      return c.json({ error: "Owner and repository name are required" }, 400);
    }

    const githubToken = await services.getGitHubToken(user.id);
    if (!githubToken) {
      return c.json({ error: "GitHub not connected" }, 400);
    }

    const github = new GitHubClient({ accessToken: githubToken.accessToken });
    
    // List webhooks and find the one to remove
    const webhooks = await github.listWebhooks(owner, repo);

    const webhookUrl = `${process.env.API_URL || 'http://localhost:8000'}/api/github/webhook`;
    const webhook = webhooks.data.find((w: any) => w.config.url === webhookUrl);
    
    if (!webhook) {
      return c.json({ error: "Webhook not found" }, 404);
    }

    await github.deleteWebhook(owner, repo, webhook.id);

    return c.json({ message: "Webhook removed successfully" });
  } catch (error) {
    console.error("Error removing webhook:", error);
    return c.json({ error: "Failed to remove webhook" }, 500);
  }
}

export default {
  handleWebhook,
  setupWebhook,
  removeWebhook
};