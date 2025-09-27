import { createGitHubClient } from "@devpulse/github";
import * as githubRepository from "../repositories/github.repository";
import type {
  CreateRepositoryData,
  CreateActivityData,
} from "../repositories/github.repository";
import type {
  GithubToken,
  Repository,
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
  totalPullRequests: number;
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
 * Fetch fresh GitHub activity data for a specific date range
 * This is used for AI summary generation
 */
export async function fetchGitHubActivity(
  userId: string,
  dateRange: { startDate: string; endDate: string }
): Promise<{
  commits: Array<{
    sha: string;
    message: string;
    url: string;
    repository: string;
    additions: number;
    deletions: number;
    timestamp: string;
  }>;
  pullRequests: Array<{
    id: number;
    title: string;
    url: string;
    repository: string;
    state: 'open' | 'closed' | 'merged';
    action: 'opened' | 'closed' | 'merged' | 'reviewed';
    timestamp: string;
  }>;
  issues: Array<{
    id: number;
    title: string;
    url: string;
    repository: string;
    state: 'open' | 'closed';
    action: 'opened' | 'closed' | 'commented';
    timestamp: string;
  }>;
  stats: {
    totalCommits: number;
    totalPullRequests: number;
    totalIssues: number;
  };
}> {
  const { startDate, endDate } = dateRange;

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

  // Get activity for the specified date range
  const since = new Date(startDate);
  const until = new Date(endDate);

  const activity = await githubClient.getDeveloperActivity(
    connectedRepos.map((repo) => repo.fullName),
    {
      since: since.toISOString(),
      until: until.toISOString(),
      author: undefined, // Let the API determine the user
    }
  );

  // Process and normalize activity data for consistent format
  return processActivityData(activity, connectedRepos);
}

/**
 * Get daily activity data for a specific date (on-demand fetch)
 */
export async function getDailyActivity(
  userId: string,
  date: string
): Promise<{
  date: string;
  commits: any[];
  pullRequests: any[];
  issues: any[];
  stats: ActivityStats;
}> {
  const startDate = date;
  const endDate = new Date(date);
  endDate.setDate(endDate.getDate() + 1);
  
  const activity = await fetchGitHubActivity(userId, {
    startDate,
    endDate: endDate.toISOString().split('T')[0]
  });

  return {
    date,
    commits: activity.commits,
    pullRequests: activity.pullRequests,
    issues: activity.issues,
    stats: activity.stats,
  };
}

/**
 * Get recent activities for a user (last 7 days by default)
 */
export async function getRecentActivities(
  userId: string,
  days: number = 7
): Promise<Array<{
  date: string;
  commits: any[];
  pullRequests: any[];
  issues: any[];
  stats: ActivityStats;
}>> {
  const results = [];
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    
    try {
      const activity = await getDailyActivity(userId, dateString);
      results.push(activity);
    } catch (error) {
      // If no activity for a day, continue with next day
      results.push({
        date: dateString,
        commits: [],
        pullRequests: [],
        issues: [],
        stats: { totalCommits: 0, totalPullRequests: 0, totalIssues: 0 }
      });
    }
  }
  
  return results;
}

/**
 * Process raw GitHub activity data into our format
 */
function processActivityData(activity: any, repositories: Repository[]) {
  const repoMap = new Map(repositories.map(repo => [repo.fullName, repo.name]));
  
  const commits = activity.commits?.map((commit: any) => ({
    sha: commit.sha,
    message: commit.commit.message,
    url: commit.html_url,
    repository: repoMap.get(commit.repository?.full_name) || commit.repository?.name || "unknown",
    additions: commit.stats?.additions || 0,
    deletions: commit.stats?.deletions || 0,
    timestamp: commit.commit.author.date,
  })) || [];
  
  const pullRequests = activity.pullRequests?.map((pr: any) => ({
    id: pr.id,
    title: pr.title,
    url: pr.html_url,
    repository: repoMap.get(pr.base?.repo?.full_name) || pr.base?.repo?.name || "unknown",
    state: pr.state,
    action: pr.merged ? 'merged' : pr.state,
    timestamp: pr.updated_at,
  })) || [];
  
  const issues = activity.issues?.map((issue: any) => ({
    id: issue.id,
    title: issue.title,
    url: issue.html_url,
    repository: repoMap.get(issue.repository?.full_name) || issue.repository?.name || "unknown",
    state: issue.state,
    action: issue.state,
    timestamp: issue.updated_at,
  })) || [];
  
  return {
    commits,
    pullRequests,
    issues,
    stats: {
      totalCommits: commits.length,
      totalPullRequests: pullRequests.length,
      totalIssues: issues.length,
    },
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

/**
 * Get users who have a specific repository connected
 */
export async function getUsersWithRepository(githubRepoId: number): Promise<string[]> {
  const repositories = await githubRepository.findRepositoriesByGitHubId(githubRepoId);
  return repositories.map(repo => repo.userId);
}

/**
 * Get GitHub token for a user
 */
export async function getGitHubToken(userId: string): Promise<GithubToken | null> {
  return await githubRepository.findTokenByUserId(userId);
}

export default {
  getConnectionStatus,
  getUserRepositories,
  connectRepository,
  disconnectRepository,
  fetchGitHubActivity,
  getDailyActivity,
  getRecentActivities,
  validateAndRefreshToken,
  storeToken,
  disconnectGitHub,
  getUsersWithRepository,
  getGitHubToken,
};
