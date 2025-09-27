'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@devpulse/ui/components/card';
import { Button } from '@devpulse/ui/components/button';
import { useGitHubActivity, GitHubActivity } from '@/lib/github-api';
import { LoadingSpinner } from '@/components/ui/loading';

interface GitHubActivitySummaryProps {
  period?: 'week' | 'month' | 'year';
  userId?: string;
}

export function GitHubActivitySummary({ 
  period = 'week',
  userId 
}: GitHubActivitySummaryProps) {
  const [activities, setActivities] = useState<GitHubActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchRecentActivities, syncData } = useGitHubActivity();

  useEffect(() => {
    loadActivitySummary();
  }, [period, userId]);

  const loadActivitySummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const limit = period === 'week' ? 7 : period === 'month' ? 30 : 365;
      const data = await fetchRecentActivities(limit);
      setActivities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activity summary');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    return activities.reduce(
      (totals, activity) => ({
        commits: totals.commits + activity.totalCommits,
        pullRequests: totals.pullRequests + activity.totalPullRequests,
        issues: totals.issues + activity.totalIssues,
        days: totals.days + 1
      }),
      { commits: 0, pullRequests: 0, issues: 0, days: 0 }
    );
  };

  const getTopRepositories = () => {
    const repoActivity = new Map<string, number>();
    
    activities.forEach(activity => {
      activity.commits.forEach(commit => {
        const count = repoActivity.get(commit.repository) || 0;
        repoActivity.set(commit.repository, count + 1);
      });
      
      activity.pullRequests.forEach(pr => {
        const count = repoActivity.get(pr.repository) || 0;
        repoActivity.set(pr.repository, count + 1);
      });
    });

    return Array.from(repoActivity.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([repo, count]) => ({ repo, count }));
  };

  const getPeriodLabel = () => {
    switch (period) {
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'year': return 'This Year';
      default: return 'Period';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Summary</CardTitle>
          <CardDescription>Loading your GitHub activity summary...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Summary</CardTitle>
          <CardDescription>Failed to load activity summary</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadActivitySummary} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Summary</CardTitle>
          <CardDescription>No activity data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No activity found</h3>
            <p className="text-gray-600 mb-4">
              No GitHub activity found for {getPeriodLabel().toLowerCase()}.
            </p>
            <Button onClick={() => syncData()} variant="outline">
              Sync Activity Data
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totals = calculateTotals();
  const topRepos = getTopRepositories();

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Activity Summary</CardTitle>
              <CardDescription>
                Your GitHub activity for {getPeriodLabel().toLowerCase()}
              </CardDescription>
            </div>
            <Button onClick={() => syncData()} variant="outline" size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-700">{totals.commits}</div>
              <div className="text-sm text-green-600 font-medium">Commits</div>
              <div className="text-xs text-gray-500 mt-1">
                {totals.days > 0 ? Math.round(totals.commits / totals.days * 10) / 10 : 0} per day
              </div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-700">{totals.pullRequests}</div>
              <div className="text-sm text-blue-600 font-medium">Pull Requests</div>
              <div className="text-xs text-gray-500 mt-1">
                {totals.days > 0 ? Math.round(totals.pullRequests / totals.days * 10) / 10 : 0} per day
              </div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-3xl font-bold text-orange-700">{totals.issues}</div>
              <div className="text-sm text-orange-600 font-medium">Issues</div>
              <div className="text-xs text-gray-500 mt-1">
                {totals.days > 0 ? Math.round(totals.issues / totals.days * 10) / 10 : 0} per day
              </div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-700">{activities.length}</div>
              <div className="text-sm text-purple-600 font-medium">Active Days</div>
              <div className="text-xs text-gray-500 mt-1">
                {period === 'week' ? 'This week' : period === 'month' ? 'This month' : 'This year'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Repositories */}
      {topRepos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Most Active Repositories</CardTitle>
            <CardDescription>
              Repositories with the most activity in {getPeriodLabel().toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topRepos.map(({ repo, count }, index) => (
                <div key={repo} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{repo}</div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm font-medium">
                      {count} activities
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Trend</CardTitle>
          <CardDescription>
            Daily activity breakdown for {getPeriodLabel().toLowerCase()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {activities.slice(0, 7).map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 py-2">
                <div className="w-20 text-sm text-gray-600 font-medium">
                  {new Date(activity.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>{activity.totalCommits} commits</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>{activity.totalPullRequests} PRs</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span>{activity.totalIssues} issues</span>
                    </div>
                  </div>
                </div>
                <div className="w-12 text-right text-sm font-medium text-gray-900">
                  {activity.totalCommits + activity.totalPullRequests + activity.totalIssues}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default GitHubActivitySummary;