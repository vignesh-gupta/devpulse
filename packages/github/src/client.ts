import { Octokit } from "@octokit/rest";
import {
  GitHubRepository,
  GitHubCommit,
  GitHubPullRequest,
  GitHubIssue,
  GitHubApiResponse,
  GitHubClientConfig,
  DeveloperActivity,
  RateLimitInfo,
  GitHubApiError,
  RateLimitError,
  GitHubRepositorySchema,
  GitHubCommitSchema,
  GitHubPullRequestSchema,
  GitHubIssueSchema,
} from "./types";

export class GitHubClient {
  private octokit: Octokit;
  private config: GitHubClientConfig;

  constructor(config: GitHubClientConfig) {
    this.config = config;
    this.octokit = new Octokit({
      auth: config.accessToken,
      userAgent: config.userAgent || "DevPulse/1.0.0",
      baseUrl: config.baseUrl || "https://api.github.com",
    });
  }

  /**
   * Get rate limit information
   */
  async getRateLimit(): Promise<RateLimitInfo> {
    try {
      const response = await this.octokit.rateLimit.get();
      const { limit, remaining, reset, used } = response.data.rate;

      return {
        limit: limit,
        remaining: remaining,
        reset: new Date(reset * 1000),
        used: used,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user's repositories
   */
  async getUserRepositories(
    options: {
      visibility?: "all" | "public" | "private";
      sort?: "created" | "updated" | "pushed" | "full_name";
      direction?: "asc" | "desc";
      per_page?: number;
      page?: number;
    } = {}
  ): Promise<GitHubApiResponse<GitHubRepository[]>> {
    try {
      const response = await this.octokit.repos.listForAuthenticatedUser({
        visibility: options.visibility || "all",
        sort: options.sort || "updated",
        direction: options.direction || "desc",
        per_page: options.per_page || 30,
        page: options.page || 1,
      });

      const repositories = response.data.map((repo) =>
        GitHubRepositorySchema.parse(repo)
      );

      return {
        data: repositories,
        status: response.status,
        headers: response.headers as Record<string, string>,
        rateLimit: (() => {
          const rl = this.extractRateLimit(response.headers);
          if (
            rl &&
            typeof rl.limit === "number" &&
            typeof rl.remaining === "number" &&
            rl.reset instanceof Date
          ) {
            return {
              limit: rl.limit,
              remaining: rl.remaining,
              reset: Math.floor(rl.reset.getTime() / 1000),
            };
          }
          return undefined;
        })(),
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get commits for a repository
   */
  async getRepositoryCommits(
    owner: string,
    repo: string,
    options: {
      since?: string;
      until?: string;
      author?: string;
      per_page?: number;
      page?: number;
    } = {}
  ): Promise<GitHubApiResponse<GitHubCommit[]>> {
    try {
      const response = await this.octokit.repos.listCommits({
        owner,
        repo,
        since: options.since,
        until: options.until,
        author: options.author,
        per_page: options.per_page || 30,
        page: options.page || 1,
      });

      const commits = response.data.map((commit) =>
        GitHubCommitSchema.parse(commit)
      );

      return {
        data: commits,
        status: response.status,
        headers: response.headers as Record<string, string>,
        rateLimit: (() => {
          const rl = this.extractRateLimit(response.headers);
          if (
            rl &&
            typeof rl.limit === "number" &&
            typeof rl.remaining === "number" &&
            rl.reset instanceof Date
          ) {
            return {
              limit: rl.limit,
              remaining: rl.remaining,
              reset: Math.floor(rl.reset.getTime() / 1000),
            };
          }
          return undefined;
        })(),
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get pull requests for a repository
   */
  async getRepositoryPullRequests(
    owner: string,
    repo: string,
    options: {
      state?: "open" | "closed" | "all";
      sort?: "created" | "updated" | "popularity";
      direction?: "asc" | "desc";
      per_page?: number;
      page?: number;
    } = {}
  ): Promise<GitHubApiResponse<GitHubPullRequest[]>> {
    try {
      const response = await this.octokit.pulls.list({
        owner,
        repo,
        state: options.state || "all",
        sort: options.sort || "updated",
        direction: options.direction || "desc",
        per_page: options.per_page || 30,
        page: options.page || 1,
      });

      const pullRequests = response.data.map((pr) =>
        GitHubPullRequestSchema.parse(pr)
      );

      return {
        data: pullRequests,
        status: response.status,
        headers: response.headers as Record<string, string>,
        rateLimit: (() => {
          const rl = this.extractRateLimit(response.headers);
          if (
            rl &&
            typeof rl.limit === "number" &&
            typeof rl.remaining === "number" &&
            rl.reset instanceof Date
          ) {
            return {
              limit: rl.limit,
              remaining: rl.remaining,
              reset: Math.floor(rl.reset.getTime() / 1000),
            };
          }
          return undefined;
        })(),
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get issues for a repository
   */
  async getRepositoryIssues(
    owner: string,
    repo: string,
    options: {
      state?: "open" | "closed" | "all";
      sort?: "created" | "updated" | "comments";
      direction?: "asc" | "desc";
      assignee?: string;
      per_page?: number;
      page?: number;
    } = {}
  ): Promise<GitHubApiResponse<GitHubIssue[]>> {
    try {
      const response = await this.octokit.issues.listForRepo({
        owner,
        repo,
        state: options.state || "all",
        sort: options.sort || "updated",
        direction: options.direction || "desc",
        assignee: options.assignee,
        per_page: options.per_page || 30,
        page: options.page || 1,
      });

      // Filter out pull requests (issues API includes PRs)
      const issues = response.data
        .filter((issue) => !issue.pull_request)
        .map((issue) => GitHubIssueSchema.parse(issue));

      return {
        data: issues,
        status: response.status,
        headers: response.headers as Record<string, string>,
        rateLimit: (() => {
          const rl = this.extractRateLimit(response.headers);
          if (
            rl &&
            typeof rl.limit === "number" &&
            typeof rl.remaining === "number" &&
            rl.reset instanceof Date
          ) {
            return {
              limit: rl.limit,
              remaining: rl.remaining,
              reset: Math.floor(rl.reset.getTime() / 1000),
            };
          }
          return undefined;
        })(),
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get comprehensive developer activity for a date range
   */
  async getDeveloperActivity(
    repositories: string[], // Array of 'owner/repo' strings
    options: {
      since?: string;
      until?: string;
      author?: string;
    } = {}
  ): Promise<DeveloperActivity> {
    const activity: DeveloperActivity = {
      date: options.since ?? new Date().toUTCString(),
      repositories: [],
      commits: [],
      pullRequests: [],
      issues: [],
      stats: {
        totalCommits: 0,
        totalPRs: 0,
        totalIssues: 0,
        linesAdded: 0,
        linesDeleted: 0,
        repositoriesWorkedOn: 0,
      },
    };

    // Process each repository
    for (const repoString of repositories) {
      const [owner, repo] = repoString.split("/");
      if (!owner || !repo) continue;

      try {
        // Get repository info
        const repoResponse = await this.octokit.repos.get({ owner, repo });
        const repository = GitHubRepositorySchema.parse(repoResponse.data);
        activity.repositories.push(repository);

        // Get commits
        const commitsResponse = await this.getRepositoryCommits(owner, repo, {
          since: options.since,
          until: options.until,
          author: options.author,
        });
        activity.commits.push(...commitsResponse.data);

        // Get pull requests
        const prsResponse = await this.getRepositoryPullRequests(owner, repo, {
          state: "all",
        });

        // Filter PRs by date and author if specified
        const filteredPRs = prsResponse.data.filter((pr) => {
          const created = new Date(pr.created_at);
          const since = options.since ? new Date(options.since) : null;
          const until = options.until ? new Date(options.until) : null;
          const author = options.author
            ? pr.user.login === options.author
            : true;

          return (
            (!since || created >= since) &&
            (!until || created <= until) &&
            author
          );
        });
        activity.pullRequests.push(...filteredPRs);

        // Get issues
        const issuesResponse = await this.getRepositoryIssues(owner, repo, {
          state: "all",
          assignee: options.author,
        });

        // Filter issues by date
        const filteredIssues = issuesResponse.data.filter((issue) => {
          const created = new Date(issue.created_at);
          const since = options.since ? new Date(options.since) : null;
          const until = options.until ? new Date(options.until) : null;

          return (!since || created >= since) && (!until || created <= until);
        });
        activity.issues.push(...filteredIssues);

        activity.stats.repositoriesWorkedOn++;
      } catch (error) {
        console.warn(`Failed to fetch data for ${repoString}:`, error);
      }
    }

    // Calculate stats
    activity.stats.totalCommits = activity.commits.length;
    activity.stats.totalPRs = activity.pullRequests.length;
    activity.stats.totalIssues = activity.issues.length;

    // Calculate lines added/deleted from commits and PRs
    activity.stats.linesAdded =
      activity.commits.reduce(
        (sum, commit) => sum + (commit.stats?.additions || 0),
        0
      ) +
      activity.pullRequests.reduce((sum, pr) => sum + (pr.additions || 0), 0);

    activity.stats.linesDeleted =
      activity.commits.reduce(
        (sum, commit) => sum + (commit.stats?.deletions || 0),
        0
      ) +
      activity.pullRequests.reduce((sum, pr) => sum + (pr.deletions || 0), 0);

    return activity;
  }

  /**
   * Extract rate limit information from response headers
   */
  private extractRateLimit(headers: any): RateLimitInfo | undefined {
    const limit = headers["x-ratelimit-limit"];
    const remaining = headers["x-ratelimit-remaining"];
    const reset = headers["x-ratelimit-reset"];

    let rl = null;

    if (limit && remaining && reset) {
      return {
        limit: parseInt(limit),
        remaining: parseInt(remaining),
        reset: new Date(parseInt(reset) * 1000),
        used: parseInt(limit) - parseInt(remaining),
      };
    }

    return undefined;
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): Error {
    if (
      error.status === 403 &&
      error.response?.headers?.["x-ratelimit-remaining"] === "0"
    ) {
      const resetTime = new Date(
        parseInt(error.response.headers["x-ratelimit-reset"]) * 1000
      );
      return new RateLimitError("GitHub API rate limit exceeded", resetTime);
    }

    if (error.status) {
      return new GitHubApiError(
        error.message || "GitHub API error",
        error.status,
        error.response
      );
    }

    return error instanceof Error ? error : new Error("Unknown error");
  }
}

/**
 * Create a new GitHub client instance
 */
export function createGitHubClient(config: GitHubClientConfig): GitHubClient {
  return new GitHubClient(config);
}
