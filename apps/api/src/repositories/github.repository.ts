import { db } from "@devpulse/db";
import { repositories, githubTokens } from "@devpulse/db/schema";
import { eq, and, desc } from "drizzle-orm";
import type {
  GithubToken,
  Repository,
  NewGithubToken,
} from "@devpulse/db/schema";

export interface CreateRepositoryData {
  userId: string;
  githubRepoId: number;
  name: string;
  fullName: string;
  private: boolean;
  defaultBranch: string;
  language: string | null;
  description: string | null;
  htmlUrl: string;
  cloneUrl: string;
  isActive?: boolean;
}

export interface UpdateRepositoryData {
  isActive?: boolean;
  updatedAt?: Date;
}

export interface CreateActivityData {
  userId: string;
  date: Date;
  commits: any[];
  pullRequests: any[];
  issues: any[];
  totalCommits: number;
  totalPullRequests: number;
  totalIssues: number;
}

export interface UpdateActivityData {
  commits?: any[];
  pullRequests?: any[];
  issues?: any[];
  totalCommits?: number;
  totalPullRequests?: number;
  totalIssues?: number;
  updatedAt?: Date;
}

/**
 * Token Operations
 */
export async function findTokenByUserId(
  userId: string
): Promise<GithubToken | null> {
  const tokens = await db
    .select()
    .from(githubTokens)
    .where(eq(githubTokens.userId, userId))
    .limit(1);

  return tokens[0] || null;
}

export async function createToken(
  tokenData: NewGithubToken
): Promise<GithubToken> {
  const [token] = await db.insert(githubTokens).values(tokenData).returning();

  return token;
}

export async function updateToken(
  userId: string,
  updates: Partial<GithubToken>
): Promise<GithubToken | null> {
  const [token] = await db
    .update(githubTokens)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(githubTokens.userId, userId))
    .returning();

  return token || null;
}

export async function deleteToken(userId: string): Promise<boolean> {
  const result = await db
    .delete(githubTokens)
    .where(eq(githubTokens.userId, userId));

  return result.rowCount > 0;
}

/**
 * Repository Operations
 */
export async function findRepositoriesByUserId(
  userId: string,
  activeOnly: boolean = false
): Promise<Repository[]> {
  const conditions = [eq(repositories.userId, userId)];

  if (activeOnly) {
    conditions.push(eq(repositories.isActive, true));
  }

  return await db
    .select()
    .from(repositories)
    .where(and(...conditions))
    .orderBy(desc(repositories.updatedAt));
}

export async function findRepositoryByGitHubId(
  userId: string,
  githubRepoId: number
): Promise<Repository | null> {
  const repos = await db
    .select()
    .from(repositories)
    .where(
      and(
        eq(repositories.userId, userId),
        eq(repositories.githubRepoId, githubRepoId)
      )
    )
    .limit(1);

  return repos[0] || null;
}

/**
 * Find all repositories with a specific GitHub repository ID (across all users)
 */
export async function findRepositoriesByGitHubId(
  githubRepoId: number
): Promise<Repository[]> {
  const repos = await db
    .select()
    .from(repositories)
    .where(eq(repositories.githubRepoId, githubRepoId));

  return repos;
}

export async function createRepository(
  data: CreateRepositoryData
): Promise<Repository> {
  const [repository] = await db
    .insert(repositories)
    .values({
      ...data,
      isActive: data.isActive ?? true,
    })
    .returning();

  return repository;
}

export async function updateRepository(
  repositoryId: string,
  updates: UpdateRepositoryData
): Promise<Repository | null> {
  const [repository] = await db
    .update(repositories)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(repositories.id, repositoryId))
    .returning();

  return repository || null;
}

export async function updateRepositoryByUserAndId(
  userId: string,
  repositoryId: string,
  updates: UpdateRepositoryData
): Promise<Repository | null> {
  const [repository] = await db
    .update(repositories)
    .set({ ...updates, updatedAt: new Date() })
    .where(
      and(eq(repositories.id, repositoryId), eq(repositories.userId, userId))
    )
    .returning();

  return repository || null;
}

export async function deleteRepository(repositoryId: string): Promise<boolean> {
  const result = await db
    .delete(repositories)
    .where(eq(repositories.id, repositoryId));

  return result.rowCount > 0;
}

/**
 * Aggregate Operations
 */
export async function getConnectionStatus(userId: string): Promise<{
  connected: boolean;
  tokenExpiry?: Date | null;
  connectedRepositories: number;
  repositories: Repository[];
}> {
  const token = await findTokenByUserId(userId);
  const connectedRepos = await findRepositoriesByUserId(userId, true);

  return {
    connected: !!token,
    tokenExpiry: token?.expiresAt,
    connectedRepositories: connectedRepos.length,
    repositories: connectedRepos,
  };
}
