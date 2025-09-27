import { z } from 'zod';

// GitHub Repository Types
export const GitHubRepositorySchema = z.object({
  id: z.number(),
  name: z.string(),
  full_name: z.string(),
  private: z.boolean(),
  description: z.string().nullable(),
  html_url: z.string(),
  clone_url: z.string(),
  ssh_url: z.string(),
  default_branch: z.string(),
  language: z.string().nullable(),
  stargazers_count: z.number(),
  watchers_count: z.number(),
  forks_count: z.number(),
  open_issues_count: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
  pushed_at: z.string().nullable(),
  owner: z.object({
    id: z.number(),
    login: z.string(),
    avatar_url: z.string(),
    type: z.string(),
  }),
});

// GitHub Commit Types
export const GitHubCommitSchema = z.object({
  sha: z.string(),
  commit: z.object({
    message: z.string(),
    author: z.object({
      name: z.string(),
      email: z.string(),
      date: z.string(),
    }),
    committer: z.object({
      name: z.string(),
      email: z.string(),
      date: z.string(),
    }),
  }),
  author: z.object({
    id: z.number(),
    login: z.string(),
    avatar_url: z.string(),
  }).nullable(),
  committer: z.object({
    id: z.number(),
    login: z.string(),
    avatar_url: z.string(),
  }).nullable(),
  html_url: z.string(),
  stats: z.object({
    additions: z.number(),
    deletions: z.number(),
    total: z.number(),
  }).optional(),
});

// GitHub Pull Request Types
export const GitHubPullRequestSchema = z.object({
  id: z.number(),
  number: z.number(),
  title: z.string(),
  body: z.string().nullable(),
  state: z.enum(['open', 'closed', 'merged']),
  draft: z.boolean(),
  html_url: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  closed_at: z.string().nullable(),
  merged_at: z.string().nullable(),
  user: z.object({
    id: z.number(),
    login: z.string(),
    avatar_url: z.string(),
  }),
  assignees: z.array(z.object({
    id: z.number(),
    login: z.string(),
    avatar_url: z.string(),
  })),
  labels: z.array(z.object({
    id: z.number(),
    name: z.string(),
    color: z.string(),
    description: z.string().nullable(),
  })),
  base: z.object({
    ref: z.string(),
    sha: z.string(),
  }),
  head: z.object({
    ref: z.string(),
    sha: z.string(),
  }),
  additions: z.number().optional(),
  deletions: z.number().optional(),
  changed_files: z.number().optional(),
});

// GitHub Issue Types
export const GitHubIssueSchema = z.object({
  id: z.number(),
  number: z.number(),
  title: z.string(),
  body: z.string().nullable(),
  state: z.enum(['open', 'closed']),
  html_url: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  closed_at: z.string().nullable(),
  user: z.object({
    id: z.number(),
    login: z.string(),
    avatar_url: z.string(),
  }),
  assignees: z.array(z.object({
    id: z.number(),
    login: z.string(),
    avatar_url: z.string(),
  })),
  labels: z.array(z.object({
    id: z.number(),
    name: z.string(),
    color: z.string(),
    description: z.string().nullable(),
  })),
  comments: z.number(),
});

// Exported TypeScript types
export type GitHubRepository = z.infer<typeof GitHubRepositorySchema>;
export type GitHubCommit = z.infer<typeof GitHubCommitSchema>;
export type GitHubPullRequest = z.infer<typeof GitHubPullRequestSchema>;
export type GitHubIssue = z.infer<typeof GitHubIssueSchema>;

// API Response types
export interface GitHubApiResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
  rateLimit?: {
    limit: number;
    remaining: number;
    reset: number;
  };
}

// Configuration types
export interface GitHubClientConfig {
  accessToken: string;
  userAgent?: string;
  baseUrl?: string;
}

// Activity types for DevPulse
export interface DeveloperActivity {
  date: string;
  repositories: GitHubRepository[];
  commits: GitHubCommit[];
  pullRequests: GitHubPullRequest[];
  issues: GitHubIssue[];
  stats: {
    totalCommits: number;
    totalPRs: number;
    totalIssues: number;
    linesAdded: number;
    linesDeleted: number;
    repositoriesWorkedOn: number;
  };
}

// Rate limit types
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: Date;
  used: number;
}

// Error types
export class GitHubApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any,
  ) {
    super(message);
    this.name = 'GitHubApiError';
  }
}

export class RateLimitError extends GitHubApiError {
  constructor(
    message: string,
    public resetAt: Date,
  ) {
    super(message, 429);
    this.name = 'RateLimitError';
  }
}