import type { Context } from "hono";
import services from "../services/github.service";
import type { AuthType } from "../auth";

/**
 * Get GitHub connection status
 * GET /api/github/status
 */
export async function getStatus(c: Context<{ Variables: AuthType }>) {
  try {
    const user = c.get("user");

    if (!user?.id) {
      return c.json({ error: "User not found" }, 400);
    }

    const status = await services.getConnectionStatus(user.id);

    return c.json(status);
  } catch (error) {
    console.error("Error fetching GitHub status:", error);
    return c.json({ error: "Failed to fetch GitHub status" }, 500);
  }
}

/**
 * Get user's GitHub repositories
 * GET /api/github/repositories
 */
export async function getRepositories(c: Context<{ Variables: AuthType }>) {
  try {
    const user = c.get("user");

    if (!user?.id) {
      return c.json({ error: "User not found" }, 400);
    }

    const result = await services.getUserRepositories(user.id);

    return c.json(result);
  } catch (error) {
    console.error("Error fetching repositories:", error);

    if (error instanceof Error) {
      if (error.message === "GitHub not connected") {
        return c.json({ error: error.message }, 400);
      }
    }

    return c.json({ error: "Failed to fetch repositories" }, 500);
  }
}

/**
 * Connect a repository
 * POST /api/github/repositories/:owner/:repo/connect
 */
export async function connectRepository(c: Context<{ Variables: AuthType }>) {
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

    const repository = await services.connectRepository(user.id, owner, repo);

    return c.json({
      message: "Repository connected successfully",
      repository,
    });
  } catch (error) {
    console.error("Error connecting repository:", error);

    if (error instanceof Error) {
      if (error.message === "GitHub not connected") {
        return c.json({ error: error.message }, 400);
      }
      if (error.message === "Repository not found or not accessible") {
        return c.json({ error: error.message }, 404);
      }
      if (error.message === "Failed to reconnect repository") {
        return c.json({ error: error.message }, 500);
      }
    }

    return c.json({ error: "Failed to connect repository" }, 500);
  }
}

/**
 * Disconnect a repository
 * POST /api/github/repositories/:id/disconnect
 */
export async function disconnectRepository(
  c: Context<{ Variables: AuthType }>
) {
  try {
    const user = c.get("user");
    const repositoryId = c.req.param("id");

    if (!user?.id) {
      return c.json({ error: "User not found" }, 400);
    }

    if (!repositoryId) {
      return c.json({ error: "Repository ID is required" }, 400);
    }

    await services.disconnectRepository(user.id, repositoryId);

    return c.json({ message: "Repository disconnected successfully" });
  } catch (error) {
    console.error("Error disconnecting repository:", error);

    if (error instanceof Error) {
      if (error.message === "Repository not found or access denied") {
        return c.json({ error: error.message }, 404);
      }
    }

    return c.json({ error: "Failed to disconnect repository" }, 500);
  }
}

/**
 * Sync user's GitHub data
 * POST /api/github/sync
 */
export async function syncData(c: Context<{ Variables: AuthType }>) {
  try {
    const user = c.get("user");

    if (!user?.id) {
      return c.json({ error: "User not found" }, 400);
    }

    const body = await c.req.json();
    const { date } = body;

    if (!date) {
      return c.json({ error: "Date is required" }, 400);
    }

    const result = await services.syncUserData({
      userId: user.id,
      date,
    });

    return c.json(result);
  } catch (error) {
    console.error("Error syncing GitHub data:", error);

    if (error instanceof Error) {
      if (error.message === "GitHub not connected") {
        return c.json({ error: error.message }, 400);
      }
      if (error.message === "No repositories connected") {
        return c.json({ error: error.message }, 400);
      }
    }

    return c.json({ error: "Failed to sync GitHub data" }, 500);
  }
}

/**
 * Get daily activity
 * GET /api/github/activity/:date
 */
export async function getDailyActivity(c: Context<{ Variables: AuthType }>) {
  try {
    const user = c.get("user");
    const date = c.req.param("date");

    if (!user?.id) {
      return c.json({ error: "User not found" }, 400);
    }

    if (!date) {
      return c.json({ error: "Date is required" }, 400);
    }

    const activity = await services.getDailyActivity(user.id, date);

    return c.json({ activity });
  } catch (error) {
    console.error("Error fetching activity:", error);

    if (error instanceof Error) {
      if (error.message === "No activity found for this date") {
        return c.json({ message: error.message }, 404);
      }
    }

    return c.json({ error: "Failed to fetch activity" }, 500);
  }
}

/**
 * Get recent activities
 * GET /api/github/activities?limit=30
 */
export async function getRecentActivities(c: Context<{ Variables: AuthType }>) {
  try {
    const user = c.get("user");

    if (!user?.id) {
      return c.json({ error: "User not found" }, 400);
    }

    const limitParam = c.req.query("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 30;

    if (isNaN(limit) || limit < 1 || limit > 100) {
      return c.json({ error: "Limit must be a number between 1 and 100" }, 400);
    }

    const activities = await services.getRecentActivities(user.id, limit);

    return c.json({ activities });
  } catch (error) {
    console.error("Error fetching recent activities:", error);
    return c.json({ error: "Failed to fetch recent activities" }, 500);
  }
}

/**
 * Validate and refresh token
 * POST /api/github/token/validate
 */
export async function validateToken(c: Context<{ Variables: AuthType }>) {
  try {
    const user = c.get("user");

    if (!user?.id) {
      return c.json({ error: "User not found" }, 400);
    }

    const token = await services.validateAndRefreshToken(user.id);

    return c.json({
      valid: true,
      expiresAt: token.expiresAt,
    });
  } catch (error) {
    console.error("Error validating token:", error);

    if (error instanceof Error) {
      if (
        error.message === "No GitHub token found" ||
        error.message.includes("expired")
      ) {
        return c.json(
          {
            valid: false,
            error: error.message,
          },
          401
        );
      }
    }

    return c.json({ error: "Failed to validate token" }, 500);
  }
}

/**
 * Store GitHub token
 * POST /api/github/token
 */
export async function storeToken(c: Context<{ Variables: AuthType }>) {
  try {
    const user = c.get("user");

    if (!user?.id) {
      return c.json({ error: "User not found" }, 400);
    }

    const body = await c.req.json();
    const { accessToken, refreshToken, tokenType, scope, expiresAt } = body;

    if (!accessToken) {
      return c.json({ error: "Access token is required" }, 400);
    }

    const token = await services.storeToken(user.id, {
      accessToken,
      refreshToken,
      tokenType,
      scope,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });

    return c.json({
      message: "Token stored successfully",
      expiresAt: token.expiresAt,
    });
  } catch (error) {
    console.error("Error storing token:", error);
    return c.json({ error: "Failed to store token" }, 500);
  }
}

/**
 * Disconnect GitHub account
 * DELETE /api/github/disconnect
 */
export async function disconnectGitHub(c: Context<{ Variables: AuthType }>) {
  try {
    const user = c.get("user");

    if (!user?.id) {
      return c.json({ error: "User not found" }, 400);
    }

    await services.disconnectGitHub(user.id);

    return c.json({ message: "GitHub account disconnected successfully" });
  } catch (error) {
    console.error("Error disconnecting GitHub:", error);

    if (error instanceof Error) {
      if (error.message === "No token found to delete") {
        return c.json({ error: "GitHub account not connected" }, 400);
      }
    }

    return c.json({ error: "Failed to disconnect GitHub account" }, 500);
  }
}

/**
 * Refresh GitHub token
 * POST /api/github/token/refresh
 */
export async function refreshToken(c: Context<{ Variables: AuthType }>) {
  try {
    const user = c.get("user");

    if (!user?.id) {
      return c.json({ error: "User not found" }, 400);
    }

    const refreshedToken = await services.validateAndRefreshToken(user.id);

    if (!refreshedToken) {
      return c.json({ error: "Failed to refresh token" }, 500);
    }

    return c.json({
      message: "Token refreshed successfully",
      token: {
        accessToken: refreshedToken.accessToken,
        expiresAt: refreshedToken.expiresAt,
      },
    });
  } catch (error) {
    console.error("Error refreshing token:", error);

    if (error instanceof Error) {
      if (error.message === "GitHub not connected") {
        return c.json({ error: error.message }, 400);
      }
    }

    return c.json({ error: "Failed to refresh token" }, 500);
  }
}

export default {
  getStatus,
  getRepositories,
  connectRepository,
  disconnectRepository,
  syncData,
  getDailyActivity,
  getRecentActivities,
  validateToken,
  refreshToken,
  storeToken,
  disconnectGitHub,
};
