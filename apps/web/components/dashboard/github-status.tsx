"use client";

import { useState, useEffect } from "react";
import { useGitHubStatus, GitHubStatus } from "@/lib/github-api";
import { LoadingSpinner } from "@/components/ui/loading";

interface GitHubStatusProps {
  onStatusChange?: (status: GitHubStatus) => void;
}

export function GitHubStatusCard({ onStatusChange }: GitHubStatusProps) {
  const [status, setStatus] = useState<GitHubStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { fetchStatus } = useGitHubStatus();

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const statusData = await fetchStatus();
      setStatus(statusData);
      onStatusChange?.(statusData);
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center justify-center">
            <LoadingSpinner size="md" />
          </div>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-red-500">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">GitHub Connection Error</h3>
              <p className="text-sm text-red-700 mt-1">Failed to load GitHub status</p>
            </div>
            <div className="ml-auto">
              <button
                onClick={loadStatus}
                className="text-red-600 hover:text-red-500 font-medium text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white overflow-hidden shadow rounded-lg border-l-4 ${
      status.connected ? 'border-green-500' : 'border-yellow-500'
    }`}>
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {status.connected ? (
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            )}
          </div>
          <div className="ml-3 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">
                GitHub Integration
              </h3>
              <button
                onClick={loadStatus}
                className="text-gray-400 hover:text-gray-600"
                title="Refresh status"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            
            <div className="mt-2">
              <div className="flex items-center text-sm">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  status.connected 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {status.connected ? 'Connected' : 'Not Connected'}
                </span>
                
                {status.connected && (
                  <span className="ml-3 text-gray-500">
                    {status.connectedRepositories} repositories
                  </span>
                )}
              </div>
              
              {status.tokenExpiry && (
                <p className="text-xs text-gray-500 mt-1">
                  Token expires: {new Date(status.tokenExpiry).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {!status.connected && (
          <div className="mt-3">
            <a
              href="/onboarding"
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Connect GitHub
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// Repository summary component
export function RepositorySummary({ repositories }: { repositories: GitHubStatus['repositories'] }) {
  if (repositories.length === 0) {
    return (
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Connected Repositories</h3>
          <div className="text-center py-6">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No repositories connected</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by connecting your first repository.</p>
            <div className="mt-6">
              <a
                href="/dashboard/github"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Manage Repositories
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Connected Repositories</h3>
          <a
            href="/dashboard/github"
            className="text-sm text-blue-600 hover:text-blue-500 font-medium"
          >
            Manage all
          </a>
        </div>
        
        <div className="space-y-3">
          {repositories.slice(0, 5).map((repo) => (
            <div key={repo.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {repo.private ? (
                    <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{repo.name}</p>
                  {repo.language && (
                    <div className="flex items-center mt-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1"></span>
                      <span className="text-xs text-gray-500">{repo.language}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  repo.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {repo.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {repositories.length > 5 && (
          <div className="mt-4 text-center">
            <a
              href="/dashboard/github"
              className="text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              View all {repositories.length} repositories
            </a>
          </div>
        )}
      </div>
    </div>
  );
}