'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@devpulse/ui/components/card';
import { Button } from '@devpulse/ui/components/button';
import { useGitHubActivity, GitHubActivity } from '@/lib/github-api';
import { LoadingSpinner } from '@/components/ui/loading';

interface GitHubActivityTimelineProps {
  userId?: string;
  repositoryId?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export function GitHubActivityTimeline({ 
  userId, 
  repositoryId, 
  dateRange 
}: GitHubActivityTimelineProps) {
  const [activities, setActivities] = useState<GitHubActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { syncData, fetchRecentActivities } = useGitHubActivity();

  useEffect(() => {
    loadActivity();
  }, [userId, repositoryId, dateRange]);

  const loadActivity = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchRecentActivities(10);
      setActivities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activity');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'commit':
        return (
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'pull_request':
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'issue':
        return (
          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
          <CardDescription>Loading your GitHub activity...</CardDescription>
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
          <CardTitle>Activity Timeline</CardTitle>
          <CardDescription>Failed to load activity data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadActivity} variant="outline">
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
          <CardTitle>Activity Timeline</CardTitle>
          <CardDescription>Your recent GitHub activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No activity found</h3>
            <p className="text-gray-600 mb-4">
              {dateRange 
                ? 'No activity found for the selected date range'
                : 'No recent activity to display'
              }
            </p>
            <Button onClick={() => syncData()} variant="outline">
              Sync Activity Data
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Activity Timeline</CardTitle>
            <CardDescription>
              Your recent GitHub activity ({activities.length} items)
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
        <div className="space-y-6">
          {activities.map((activity, index) => (
            <div key={activity.id} className="relative">
              {/* Timeline line */}
              {index < activities.length - 1 && (
                <div className="absolute left-4 top-8 w-0.5 h-16 bg-gray-200"></div>
              )}
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-gray-900">
                      Activity for {new Date(activity.date).toLocaleDateString()}
                    </h4>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {formatDate(activity.createdAt)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="text-lg font-semibold text-green-700">{activity.totalCommits}</div>
                      <div className="text-xs text-green-600">Commits</div>
                    </div>
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <div className="text-lg font-semibold text-blue-700">{activity.totalPullRequests}</div>
                      <div className="text-xs text-blue-600">Pull Requests</div>
                    </div>
                    <div className="text-center p-2 bg-orange-50 rounded">
                      <div className="text-lg font-semibold text-orange-700">{activity.totalIssues}</div>
                      <div className="text-xs text-orange-600">Issues</div>
                    </div>
                  </div>
                  
                  {/* Activity Details */}
                  <div className="space-y-3">
                    {/* Commits */}
                    {activity.commits.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-1">Recent Commits</h5>
                        <div className="space-y-1">
                          {activity.commits.slice(0, 3).map((commit) => (
                            <div key={commit.sha} className="flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                              <a
                                href={commit.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-700 hover:text-blue-600 flex-1 truncate"
                              >
                                {commit.message}
                              </a>
                              <span className="text-xs text-gray-500">{commit.repository}</span>
                            </div>
                          ))}
                          {activity.commits.length > 3 && (
                            <div className="text-xs text-gray-500 ml-4">
                              +{activity.commits.length - 3} more commits
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Pull Requests */}
                    {activity.pullRequests.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-1">Pull Requests</h5>
                        <div className="space-y-1">
                          {activity.pullRequests.slice(0, 2).map((pr) => (
                            <div key={pr.id} className="flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                              <a
                                href={pr.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-700 hover:text-blue-600 flex-1 truncate"
                              >
                                {pr.title}
                              </a>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                pr.state === 'merged' ? 'bg-purple-100 text-purple-700' :
                                pr.state === 'closed' ? 'bg-red-100 text-red-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {pr.state}
                              </span>
                            </div>
                          ))}
                          {activity.pullRequests.length > 2 && (
                            <div className="text-xs text-gray-500 ml-4">
                              +{activity.pullRequests.length - 2} more pull requests
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Issues */}
                    {activity.issues.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-1">Issues</h5>
                        <div className="space-y-1">
                          {activity.issues.slice(0, 2).map((issue) => (
                            <div key={issue.id} className="flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                              <a 
                                href={issue.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-700 hover:text-blue-600 flex-1 truncate"
                              >
                                {issue.title}
                              </a>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                issue.state === 'closed' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                              }`}>
                                {issue.state}
                              </span>
                            </div>
                          ))}
                          {activity.issues.length > 2 && (
                            <div className="text-xs text-gray-500 ml-4">
                              +{activity.issues.length - 2} more issues
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {activities.length >= 10 && (
          <div className="mt-6 text-center">
            <Button variant="outline" onClick={loadActivity}>
              Load More Activity
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default GitHubActivityTimeline;