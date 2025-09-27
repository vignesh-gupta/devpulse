'use client';

import { useState, useEffect } from 'react';
import { Button } from '@devpulse/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@devpulse/ui/components/card';
import { authClient } from '../../../lib/auth-client';

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  updated_at: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

interface GitHubStatus {
  connected: boolean;
  tokenExpiry: string | null;
  connectedRepositories: number;
  repositories: Repository[];
}

export default function GitHubIntegration() {
  const [githubStatus, setGithubStatus] = useState<GitHubStatus | null>(null);
  const [availableRepos, setAvailableRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    checkGitHubStatus();
  }, []);

  const checkGitHubStatus = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/github/status`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setGithubStatus(data);
        
        if (data.connected) {
          await fetchAvailableRepositories();
        }
      }
    } catch (error) {
      console.error('Error checking GitHub status:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableRepositories = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/github/repositories`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setAvailableRepos(data.repositories);
      }
    } catch (error) {
      console.error('Error fetching repositories:', error);
    }
  };

  const connectToGitHub = async () => {
    try {
      const { data, error } = await authClient.signIn.social({
        provider: 'github',
        callbackURL: '/dashboard/github',
      });

      if (error) {
        console.error('GitHub connection error:', error);
      } else {
        // Refresh status after connection
        await checkGitHubStatus();
      }
    } catch (error) {
      console.error('Error connecting to GitHub:', error);
    }
  };

  const connectRepository = async (owner: string, repo: string) => {
    setConnecting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/github/repositories/${owner}/${repo}/connect`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        await checkGitHubStatus();
      } else {
        const error = await response.json();
        console.error('Error connecting repository:', error);
      }
    } catch (error) {
      console.error('Error connecting repository:', error);
    } finally {
      setConnecting(false);
    }
  };

  const disconnectRepository = async (repositoryId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/github/repositories/${repositoryId}/disconnect`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        await checkGitHubStatus();
      } else {
        const error = await response.json();
        console.error('Error disconnecting repository:', error);
      }
    } catch (error) {
      console.error('Error disconnecting repository:', error);
    }
  };

  const syncGitHubData = async () => {
    setSyncing(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/github/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: today }),
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Sync successful:', data);
      } else {
        const error = await response.json();
        console.error('Sync error:', error);
      }
    } catch (error) {
      console.error('Error syncing GitHub data:', error);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="grid gap-6">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-48 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">GitHub Integration</h1>
        <p className="text-muted-foreground">
          Connect your GitHub repositories to automatically track your development activity.
        </p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${githubStatus?.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            GitHub Connection Status
          </CardTitle>
          <CardDescription>
            {githubStatus?.connected 
              ? `Connected with ${githubStatus.connectedRepositories} active repositories`
              : 'Not connected to GitHub'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!githubStatus?.connected ? (
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold mb-2">Connect Your GitHub Account</h3>
              <p className="text-muted-foreground mb-4">
                Allow DevPulse to access your GitHub repositories to track commits, pull requests, and issues.
              </p>
              <Button onClick={connectToGitHub} size="lg">
                Connect GitHub Account
              </Button>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">
                  Last synced: {githubStatus.repositories[0]?.updated_at 
                    ? new Date(githubStatus.repositories[0].updated_at).toLocaleString()
                    : 'Never'
                  }
                </p>
              </div>
              <Button onClick={syncGitHubData} disabled={syncing}>
                {syncing ? 'Syncing...' : 'Sync Now'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Connected Repositories */}
      {githubStatus?.connected && githubStatus.repositories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Connected Repositories</CardTitle>
            <CardDescription>
              Repositories that are actively being tracked for standup summaries.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {githubStatus.repositories.map((repo) => (
                <div key={repo.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{repo.full_name}</h4>
                      {repo.private && (
                        <span className="px-2 py-1 text-xs bg-muted rounded">Private</span>
                      )}
                    </div>
                    {repo.description && (
                      <p className="text-sm text-muted-foreground mb-2">{repo.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {repo.language && <span>Language: {repo.language}</span>}
                      <span>⭐ {repo.stargazers_count}</span>
                      <span>Updated: {new Date(repo.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => disconnectRepository(repo.id.toString())}
                  >
                    Disconnect
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Repositories */}
      {githubStatus?.connected && availableRepos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Available Repositories</CardTitle>
            <CardDescription>
              Select additional repositories to track for your daily standups.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 max-h-96 overflow-y-auto">
              {availableRepos
                .filter(repo => !githubStatus.repositories.some(connected => connected.id === repo.id))
                .map((repo) => (
                <div key={repo.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{repo.full_name}</h4>
                      {repo.private && (
                        <span className="px-2 py-1 text-xs bg-muted rounded">Private</span>
                      )}
                    </div>
                    {repo.description && (
                      <p className="text-sm text-muted-foreground mb-2">{repo.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {repo.language && <span>Language: {repo.language}</span>}
                      <span>⭐ {repo.stargazers_count}</span>
                      <span>Updated: {new Date(repo.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => connectRepository(repo.owner.login, repo.name)}
                    disabled={connecting}
                    size="sm"
                  >
                    {connecting ? 'Connecting...' : 'Connect'}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}