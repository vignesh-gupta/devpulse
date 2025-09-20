import { pgTable, text, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { createId } from "../lib/id";

export const repositories = pgTable("repositories", {
  id: text('id').primaryKey().$defaultFn(() => createId.repository()),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  githubRepoId: integer('github_repo_id').notNull(),
  name: text('name').notNull(),
  fullName: text('full_name').notNull(),
  private: boolean('private').notNull().default(false),
  defaultBranch: text('default_branch').default('main'),
  language: text('language'),
  description: text('description'),
  htmlUrl: text('html_url').notNull(),
  cloneUrl: text('clone_url').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp('updated_at').$defaultFn(() => new Date()).notNull(),
});

export const githubTokens = pgTable("github_tokens", {
  id: text('id').primaryKey().$defaultFn(() => createId.token()),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token'),
  tokenType: text('token_type').default('bearer'),
  scope: text('scope'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp('updated_at').$defaultFn(() => new Date()).notNull(),
});

export const dailyActivities = pgTable("daily_activities", {
  id: text('id').primaryKey().$defaultFn(() => createId.activity()),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  date: timestamp('date').notNull(),
  commits: jsonb('commits').$type<{
    sha: string;
    message: string;
    url: string;
    repository: string;
    additions: number;
    deletions: number;
    timestamp: string;
  }[]>().default([]),
  pullRequests: jsonb('pull_requests').$type<{
    id: number;
    title: string;
    url: string;
    repository: string;
    state: 'open' | 'closed' | 'merged';
    action: 'opened' | 'closed' | 'merged' | 'reviewed';
    timestamp: string;
  }[]>().default([]),
  issues: jsonb('issues').$type<{
    id: number;
    title: string;
    url: string;
    repository: string;
    state: 'open' | 'closed';
    action: 'opened' | 'closed' | 'commented';
    timestamp: string;
  }[]>().default([]),
  totalCommits: integer('total_commits').default(0),
  totalPullRequests: integer('total_pull_requests').default(0),
  totalIssues: integer('total_issues').default(0),
  createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp('updated_at').$defaultFn(() => new Date()).notNull(),
});

export const summaries = pgTable("summaries", {
  id: text('id').primaryKey().$defaultFn(() => createId.summary()),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  date: timestamp('date').notNull(),
  content: text('content').notNull(),
  yesterdayWork: text('yesterday_work'),
  todayFocus: text('today_focus'),
  blockers: text('blockers'),
  aiGenerated: boolean('ai_generated').notNull().default(true),
  edited: boolean('edited').notNull().default(false),
  approved: boolean('approved').notNull().default(false),
  activityId: text('activity_id').references(() => dailyActivities.id, { onDelete: 'set null' }),
  metadata: jsonb('metadata').$type<{
    totalCommits: number;
    totalPullRequests: number;
    totalIssues: number;
    repositories: string[];
    aiModel: string;
    generatedAt: string;
  }>(),
  createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp('updated_at').$defaultFn(() => new Date()).notNull(),
});

// Export types for TypeScript inference
export type Repository = typeof repositories.$inferSelect;
export type NewRepository = typeof repositories.$inferInsert;

export type GithubToken = typeof githubTokens.$inferSelect;
export type NewGithubToken = typeof githubTokens.$inferInsert;

export type DailyActivity = typeof dailyActivities.$inferSelect;
export type NewDailyActivity = typeof dailyActivities.$inferInsert;

export type Summary = typeof summaries.$inferSelect;
export type NewSummary = typeof summaries.$inferInsert;