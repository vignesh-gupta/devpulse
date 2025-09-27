import { createGitHubClient } from "@devpulse/github";
import * as githubRepository from "../repositories/github.repository";
import type {
  CreateRepositoryData,
  CreateActivityData,
} from "../repositories/github.repository";
import type {
  GithubToken,
  Repository,
  DailyActivity,
} from "@devpulse/db/schema";

export interface GitHubConnectionStatus {
  connected: boolean;
  tokenExpiry?: Date | null;
  connectedRepositories: number;
  repositories: Repository[];
}

export interface GitHubRepositoryData {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  default_branch: string;
  language: string | null;
  description: string | null;
  html_url: string;
  clone_url: string;
  owner: {
    login: string;
  };
}

export interface SyncOptions {
  date: string;
  userId: string;
}

export interface ActivityStats {
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
}

/**
 * Get GitHub connection status for a user
 */
export async function getConnectionStatus(
  userId: string
): Promise<GitHubConnectionStatus> {
  return await githubRepository.getConnectionStatus(userId);
}

/**
 * Get user's GitHub repositories from GitHub API
 */
export async function getUserRepositories(userId: string): Promise<{
  repositories: GitHubRepositoryData[];
  rateLimit: any;
}> {
  const token = await githubRepository.findTokenByUserId(userId);

  if (!token) {
    throw new Error("GitHub not connected");
  }

  const githubClient = createGitHubClient({
    accessToken: token.accessToken,
  });

  const response = await githubClient.getUserRepositories({
    visibility: "all",
    sort: "updated",
    per_page: 100,
  });

  return {
    repositories: response.data,
    rateLimit: response.rateLimit,
  };
}

/**
 * Connect a repository for a user
 */
export async function connectRepository(
  userId: string,
  owner: string,
  repoName: string
): Promise<Repository> {
  const token = await githubRepository.findTokenByUserId(userId);

  if (!token) {
    throw new Error("GitHub not connected");
  }

  // Get repository details from GitHub API
  const { repositories } = await getUserRepositories(userId);
  const repoData = repositories.find(
    (r) => r.owner.login === owner && r.name === repoName
  );

  if (!repoData) {
    throw new Error("Repository not found or not accessible");
  }

  // Check if repository is already connected
  const existingRepo = await githubRepository.findRepositoryByGitHubId(
    userId,
    repoData.id
  );

  if (existingRepo) {
    // Reactivate existing repository
    const updated = await githubRepository.updateRepository(existingRepo.id, {
      isActive: true,
    });

    if (!updated) {
      throw new Error("Failed to reconnect repository");
    }

    return updated;
  }

  // Create new repository record
  const repositoryData: CreateRepositoryData = {
    userId,
    githubRepoId: repoData.id,
    name: repoData.name,
    fullName: repoData.full_name,
    private: repoData.private,
    defaultBranch: repoData.default_branch || "main",
    language: repoData.language,
    description: repoData.description,
    htmlUrl: repoData.html_url,
    cloneUrl: repoData.clone_url,
    isActive: true,
  };

  return await githubRepository.createRepository(repositoryData);
}

/**
 * Disconnect a repository for a user
 */
export async function disconnectRepository(
  userId: string,
  repositoryId: string
): Promise<void> {
  const updated = await githubRepository.updateRepositoryByUserAndId(
    userId,
    repositoryId,
    {
      isActive: false,
    }
  );

  if (!updated) {
    throw new Error("Repository not found or access denied");
  }
}

/**
 * Sync user's GitHub data for a specific date
 */
export async function syncUserData(options: SyncOptions): Promise<{
  message: string;
  activity: {
    date: string;
    stats: ActivityStats;
  };
}> {
  const { userId, date } = options;

  const token = await githubRepository.findTokenByUserId(userId);
  if (!token) {
    throw new Error("GitHub not connected");
  }

  const connectedRepos = await githubRepository.findRepositoriesByUserId(
    userId,
    true
  );
  if (connectedRepos.length === 0) {
    throw new Error("No repositories connected");
  }

  const githubClient = createGitHubClient({
    accessToken: token.accessToken,
  });

  // Get activity for the specified date
  const since = new Date(date);
  const until = new Date(since);
  until.setDate(until.getDate() + 1);

  const activity = await githubClient.getDeveloperActivity(
    connectedRepos.map((repo) => repo.fullName),
    {
      since: since.toISOString(),
      until: until.toISOString(),
      author: undefined, // Let the API determine the user
    }
  );

  // Process and normalize activity data
  const processedActivity = processActivityData(activity);

  // Check if activity already exists for this date
  const existingActivity = await githubRepository.findActivityByUserAndDate(
    userId,
    since
  );

  if (existingActivity) {
    // Update existing activity
    await githubRepository.updateActivity(existingActivity.id, {
      ...processedActivity,
    });
  } else {
    // Create new activity record
    const activityData: CreateActivityData = {
      userId,
      date: since,
      ...processedActivity,
    };

    await githubRepository.createActivity(activityData);
  }

  return {
    message: "GitHub data synced successfully",
    activity: {
      date,
      stats: activity.stats,
    },
  };
}

/**
 * Get daily activity for a user and date
 */
export async function getDailyActivity(
  userId: string,
  date: string
): Promise<DailyActivity> {
  const activity = await githubRepository.findActivityByUserAndDate(
    userId,
    new Date(date)
  );

  if (!activity) {
    throw new Error("No activity found for this date");
  }

  return activity;
}

/**
 * Get recent activities for a user
 */
export async function getRecentActivities(
  userId: string,
  limit: number = 30
): Promise<DailyActivity[]> {
  return await githubRepository.findActivitiesByUserId(userId, limit);
}

/**
 * Process raw GitHub activity data into our format
 */
function processActivityData(activity: any) {
  return {
    commits: activity.commits.map((commit: any) => ({
      sha: commit.sha,
      message: commit.commit.message,
      url: commit.html_url,
      repository: "unknown", // Repository context would need to be determined from the API call
      additions: commit.stats?.additions || 0,
      deletions: commit.stats?.deletions || 0,
      timestamp: commit.commit.author.date,
    })),
    pullRequests: activity.pullRequests.map((pr: any) => ({
      id: pr.id,
      title: pr.title,
      url: pr.html_url,
      repository: "unknown", // Repository context would need to be determined from the API call
      state: pr.state,
      action: "opened" as const,
      timestamp: pr.created_at,
    })),
    issues: activity.issues.map((issue: any) => ({
      id: issue.id,
      title: issue.title,
      url: issue.html_url,
      repository: "unknown", // Repository context would need to be determined from the API call
      state: issue.state,
      action: "opened" as const,
      timestamp: issue.created_at,
    })),
    totalCommits: activity.stats.totalCommits,
    totalPullRequests: activity.stats.totalPRs,
    totalIssues: activity.stats.totalIssues,
  };
}

/**
 * Validate GitHub token and refresh if needed
 */
export async function validateAndRefreshToken(
  userId: string
): Promise<GithubToken> {
  const token = await githubRepository.findTokenByUserId(userId);

  if (!token) {
    throw new Error("No GitHub token found");
  }

  // Check if token is expired
  if (token.expiresAt && token.expiresAt < new Date()) {
    // TODO: Implement token refresh logic here if refresh tokens are available
    throw new Error("GitHub token has expired. Please reconnect your account.");
  }

  return token;
}

/**
 * Store or update GitHub token for a user
 */
export async function storeToken(
  userId: string,
  tokenData: {
    accessToken: string;
    refreshToken?: string;
    tokenType?: string;
    scope?: string;
    expiresAt?: Date;
  }
): Promise<GithubToken> {
  const existingToken = await githubRepository.findTokenByUserId(userId);

  if (existingToken) {
    const updated = await githubRepository.updateToken(userId, tokenData);
    if (!updated) {
      throw new Error("Failed to update token");
    }
    return updated;
  } else {
    return await githubRepository.createToken({
      userId,
      ...tokenData,
    });
  }
}

/**
 * Remove GitHub token and disconnect all repositories
 */
export async function disconnectGitHub(userId: string): Promise<void> {
  // Deactivate all repositories
  const repositories = await githubRepository.findRepositoriesByUserId(
    userId,
    true
  );

  for (const repo of repositories) {
    await githubRepository.updateRepository(repo.id, { isActive: false });
  }

  // Delete token
  const deleted = await githubRepository.deleteToken(userId);

  if (!deleted) {
    throw new Error("No token found to delete");
  }
}

export default {
  getConnectionStatus,
  getUserRepositories,
  connectRepository,
  disconnectRepository,
  syncUserData,
  getDailyActivity,
  getRecentActivities,
  validateAndRefreshToken,
  storeToken,
  disconnectGitHub,
};
