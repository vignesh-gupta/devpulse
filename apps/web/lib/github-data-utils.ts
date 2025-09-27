import { GitHubActivity, GitHubCommit, GitHubPullRequest, GitHubIssue } from '@/lib/github-api';

// Utility functions for normalizing and optimizing GitHub activity data

/**
 * Removes duplicate commits based on SHA
 */
export function deduplicateCommits(commits: GitHubCommit[]): GitHubCommit[] {
  const uniqueCommits = new Map<string, GitHubCommit>();
  
  commits.forEach(commit => {
    // Keep the most recent version if duplicates exist
    if (!uniqueCommits.has(commit.sha) || 
        new Date(commit.timestamp) > new Date(uniqueCommits.get(commit.sha)!.timestamp)) {
      uniqueCommits.set(commit.sha, commit);
    }
  });
  
  return Array.from(uniqueCommits.values());
}

/**
 * Removes duplicate pull requests based on ID
 */
export function deduplicatePullRequests(pullRequests: GitHubPullRequest[]): GitHubPullRequest[] {
  const uniquePRs = new Map<number, GitHubPullRequest>();
  
  pullRequests.forEach(pr => {
    // Keep the most recent version if duplicates exist
    if (!uniquePRs.has(pr.id) || 
        new Date(pr.timestamp) > new Date(uniquePRs.get(pr.id)!.timestamp)) {
      uniquePRs.set(pr.id, pr);
    }
  });
  
  return Array.from(uniquePRs.values());
}

/**
 * Removes duplicate issues based on ID
 */
export function deduplicateIssues(issues: GitHubIssue[]): GitHubIssue[] {
  const uniqueIssues = new Map<number, GitHubIssue>();
  
  issues.forEach(issue => {
    // Keep the most recent version if duplicates exist
    if (!uniqueIssues.has(issue.id) || 
        new Date(issue.timestamp) > new Date(uniqueIssues.get(issue.id)!.timestamp)) {
      uniqueIssues.set(issue.id, issue);
    }
  });
  
  return Array.from(uniqueIssues.values());
}

/**
 * Normalizes a single activity record by deduplicating all items
 */
export function normalizeActivity(activity: GitHubActivity): GitHubActivity {
  const deduplicatedCommits = deduplicateCommits(activity.commits);
  const deduplicatedPRs = deduplicatePullRequests(activity.pullRequests);
  const deduplicatedIssues = deduplicateIssues(activity.issues);
  
  return {
    ...activity,
    commits: deduplicatedCommits,
    pullRequests: deduplicatedPRs,
    issues: deduplicatedIssues,
    totalCommits: deduplicatedCommits.length,
    totalPullRequests: deduplicatedPRs.length,
    totalIssues: deduplicatedIssues.length
  };
}

/**
 * Normalizes an array of activity records
 */
export function normalizeActivities(activities: GitHubActivity[]): GitHubActivity[] {
  return activities.map(normalizeActivity);
}

/**
 * Sorts activities by date (most recent first)
 */
export function sortActivitiesByDate(activities: GitHubActivity[]): GitHubActivity[] {
  return [...activities].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/**
 * Groups activities by date for better organization
 */
export function groupActivitiesByDate(activities: GitHubActivity[]): Map<string, GitHubActivity[]> {
  const grouped = new Map<string, GitHubActivity[]>();
  
  activities.forEach(activity => {
    const dateKey = activity.date;
    const existing = grouped.get(dateKey) || [];
    grouped.set(dateKey, [...existing, activity]);
  });
  
  return grouped;
}

/**
 * Filters activities by date range
 */
export function filterActivitiesByDateRange(
  activities: GitHubActivity[], 
  startDate: Date, 
  endDate: Date
): GitHubActivity[] {
  return activities.filter(activity => {
    const activityDate = new Date(activity.date);
    return activityDate >= startDate && activityDate <= endDate;
  });
}

/**
 * Aggregates activity statistics
 */
export interface ActivityStats {
  totalActivities: number;
  totalCommits: number;
  totalPullRequests: number;
  totalIssues: number;
  uniqueRepositories: Set<string>;
  activeDays: number;
  averageCommitsPerDay: number;
  averagePRsPerDay: number;
  averageIssuesPerDay: number;
  mostActiveRepository: string | null;
  mostActiveRepositoryCount: number;
}

export function calculateActivityStats(activities: GitHubActivity[]): ActivityStats {
  const repositoryActivity = new Map<string, number>();
  
  let totalCommits = 0;
  let totalPullRequests = 0;
  let totalIssues = 0;
  const uniqueRepositories = new Set<string>();
  
  activities.forEach(activity => {
    totalCommits += activity.totalCommits;
    totalPullRequests += activity.totalPullRequests;
    totalIssues += activity.totalIssues;
    
    // Track repository activity
    activity.commits.forEach(commit => {
      uniqueRepositories.add(commit.repository);
      repositoryActivity.set(
        commit.repository, 
        (repositoryActivity.get(commit.repository) || 0) + 1
      );
    });
    
    activity.pullRequests.forEach(pr => {
      uniqueRepositories.add(pr.repository);
      repositoryActivity.set(
        pr.repository, 
        (repositoryActivity.get(pr.repository) || 0) + 1
      );
    });
    
    activity.issues.forEach(issue => {
      uniqueRepositories.add(issue.repository);
      repositoryActivity.set(
        issue.repository, 
        (repositoryActivity.get(issue.repository) || 0) + 1
      );
    });
  });
  
  // Find most active repository
  let mostActiveRepository: string | null = null;
  let mostActiveRepositoryCount = 0;
  
  repositoryActivity.forEach((count, repo) => {
    if (count > mostActiveRepositoryCount) {
      mostActiveRepository = repo;
      mostActiveRepositoryCount = count;
    }
  });
  
  const activeDays = activities.length;
  
  return {
    totalActivities: activities.length,
    totalCommits,
    totalPullRequests,
    totalIssues,
    uniqueRepositories,
    activeDays,
    averageCommitsPerDay: activeDays > 0 ? totalCommits / activeDays : 0,
    averagePRsPerDay: activeDays > 0 ? totalPullRequests / activeDays : 0,
    averageIssuesPerDay: activeDays > 0 ? totalIssues / activeDays : 0,
    mostActiveRepository,
    mostActiveRepositoryCount
  };
}

/**
 * Validates activity data for consistency
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateActivity(activity: GitHubActivity): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check required fields
  if (!activity.id) errors.push('Activity ID is missing');
  if (!activity.userId) errors.push('User ID is missing');
  if (!activity.date) errors.push('Date is missing');
  
  // Check date format
  if (activity.date && isNaN(new Date(activity.date).getTime())) {
    errors.push('Invalid date format');
  }
  
  // Check if totals match actual counts
  if (activity.totalCommits !== activity.commits.length) {
    warnings.push(`Total commits mismatch: ${activity.totalCommits} vs ${activity.commits.length}`);
  }
  
  if (activity.totalPullRequests !== activity.pullRequests.length) {
    warnings.push(`Total PRs mismatch: ${activity.totalPullRequests} vs ${activity.pullRequests.length}`);
  }
  
  if (activity.totalIssues !== activity.issues.length) {
    warnings.push(`Total issues mismatch: ${activity.totalIssues} vs ${activity.issues.length}`);
  }
  
  // Validate commits
  activity.commits.forEach((commit, index) => {
    if (!commit.sha) errors.push(`Commit ${index}: SHA is missing`);
    if (!commit.message) warnings.push(`Commit ${index}: Message is empty`);
    if (!commit.repository) errors.push(`Commit ${index}: Repository is missing`);
    if (!commit.timestamp || isNaN(new Date(commit.timestamp).getTime())) {
      errors.push(`Commit ${index}: Invalid timestamp`);
    }
  });
  
  // Validate pull requests
  activity.pullRequests.forEach((pr, index) => {
    if (!pr.id) errors.push(`PR ${index}: ID is missing`);
    if (!pr.title) warnings.push(`PR ${index}: Title is empty`);
    if (!pr.repository) errors.push(`PR ${index}: Repository is missing`);
    if (!['open', 'closed', 'merged'].includes(pr.state)) {
      errors.push(`PR ${index}: Invalid state '${pr.state}'`);
    }
    if (!pr.timestamp || isNaN(new Date(pr.timestamp).getTime())) {
      errors.push(`PR ${index}: Invalid timestamp`);
    }
  });
  
  // Validate issues
  activity.issues.forEach((issue, index) => {
    if (!issue.id) errors.push(`Issue ${index}: ID is missing`);
    if (!issue.title) warnings.push(`Issue ${index}: Title is empty`);
    if (!issue.repository) errors.push(`Issue ${index}: Repository is missing`);
    if (!['open', 'closed'].includes(issue.state)) {
      errors.push(`Issue ${index}: Invalid state '${issue.state}'`);
    }
    if (!issue.timestamp || isNaN(new Date(issue.timestamp).getTime())) {
      errors.push(`Issue ${index}: Invalid timestamp`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates multiple activities and returns summary
 */
export function validateActivities(activities: GitHubActivity[]): {
  validCount: number;
  invalidCount: number;
  totalWarnings: number;
  results: ValidationResult[];
} {
  const results = activities.map(validateActivity);
  
  return {
    validCount: results.filter(r => r.isValid).length,
    invalidCount: results.filter(r => !r.isValid).length,
    totalWarnings: results.reduce((sum, r) => sum + r.warnings.length, 0),
    results
  };
}

/**
 * Optimizes activity data for performance by removing unnecessary fields and sorting
 */
export function optimizeActivityData(activities: GitHubActivity[]): GitHubActivity[] {
  return normalizeActivities(activities)
    .filter(activity => 
      activity.totalCommits > 0 || 
      activity.totalPullRequests > 0 || 
      activity.totalIssues > 0
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Creates a summary of activity data for efficient storage/retrieval
 */
export interface ActivitySummary {
  userId: string;
  dateRange: {
    start: string;
    end: string;
  };
  stats: ActivityStats;
  topRepositories: Array<{
    name: string;
    count: number;
  }>;
  recentActivities: GitHubActivity[];
  lastUpdated: string;
}

export function createActivitySummary(
  activities: GitHubActivity[], 
  userId: string
): ActivitySummary {
  const optimizedActivities = optimizeActivityData(activities);
  const stats = calculateActivityStats(optimizedActivities);
  
  // Get date range
  const dates = optimizedActivities.map(a => new Date(a.date).getTime());
  const startDate = dates.length > 0 ? new Date(Math.min(...dates)) : new Date();
  const endDate = dates.length > 0 ? new Date(Math.max(...dates)) : new Date();
  
  // Get top repositories
  const repoActivity = new Map<string, number>();
  optimizedActivities.forEach(activity => {
    [...activity.commits, ...activity.pullRequests, ...activity.issues].forEach(item => {
      const repo = 'repository' in item ? item.repository : '';
      repoActivity.set(repo, (repoActivity.get(repo) || 0) + 1);
    });
  });
  
  const topRepositories = Array.from(repoActivity.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));
  
  return {
    userId,
    dateRange: {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    },
    stats,
    topRepositories,
    recentActivities: optimizedActivities.slice(0, 20),
    lastUpdated: new Date().toISOString()
  };
}