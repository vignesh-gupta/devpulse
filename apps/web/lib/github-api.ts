import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { useErrorHandler } from "@/components/providers/error-provider";

// Types for GitHub API responses
export interface GitHubStatus {
  connected: boolean;
  tokenExpiry?: string | null;
  connectedRepositories: number;
  repositories: GitHubRepository[];
}

export interface GitHubRepository {
  id: string;
  githubRepoId: number;
  name: string;
  fullName: string;
  private: boolean;
  defaultBranch: string;
  language: string | null;
  description: string | null;
  htmlUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GitHubActivity {
  id: string;
  userId: string;
  date: string;
  commits: GitHubCommit[];
  pullRequests: GitHubPullRequest[];
  issues: GitHubIssue[];
  totalCommits: number;
  totalPullRequests: number;
  totalIssues: number;
  createdAt: string;
  updatedAt: string;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  url: string;
  repository: string;
  additions: number;
  deletions: number;
  timestamp: string;
}

export interface GitHubPullRequest {
  id: number;
  title: string;
  url: string;
  repository: string;
  state: 'open' | 'closed' | 'merged';
  action: 'opened' | 'closed' | 'merged' | 'reviewed';
  timestamp: string;
}

export interface GitHubIssue {
  id: number;
  title: string;
  url: string;
  repository: string;
  state: 'open' | 'closed';
  action: 'opened' | 'closed' | 'commented';
  timestamp: string;
}

export interface ConnectRepositoryRequest {
  owner: string;
  repo: string;
}

export interface SyncRequest {
  date?: string; // ISO date string, defaults to today
}

class GitHubApiClient {
  private api: AxiosInstance;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') {
    this.api = axios.create({
      baseURL: baseUrl,
      timeout: 10000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        // Add timestamp to prevent caching
        config.params = {
          ...config.params,
          _t: Date.now()
        };
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && originalRequest) {
          // Token expired or invalid - try to refresh token first
          try {
            await this.refreshToken();
            // Retry the original request
            return this.api.request(originalRequest);
          } catch (refreshError) {
            // Refresh failed, redirect to login
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            return Promise.reject(new Error('Authentication required'));
          }
        }

        if (error.response?.status === 403) {
          // Rate limited or forbidden
          const errorMessage = (error.response.data as any)?.message || 'Access forbidden';
          return Promise.reject(new Error(errorMessage));
        }

        if (error.response && error.response.status >= 500) {
          // Server error
          return Promise.reject(new Error('Server error - please try again later'));
        }

        // Extract error message from response
        const errorMessage = (error.response?.data as any)?.message || 
                            error.message || 
                            'An unexpected error occurred';
        
        return Promise.reject(new Error(errorMessage));
      }
    );
  }

  // Refresh GitHub token
  private async refreshToken(): Promise<void> {
    try {
      await this.api.post('/api/github/token/refresh');
    } catch (error) {
      throw new Error('Failed to refresh token');
    }
  }

  // Get GitHub connection status
  async getStatus(): Promise<GitHubStatus> {
    const response = await this.api.get('/api/github/status');
    return response.data;
  }

  // Get user's repositories from GitHub API
  async getRepositories(): Promise<GitHubRepository[]> {
    const response = await this.api.get('/api/github/repositories');
    return response.data;
  }

  // Connect a specific repository
  async connectRepository(owner: string, repo: string): Promise<GitHubRepository> {
    const response = await this.api.post(`/api/github/repositories/${owner}/${repo}/connect`);
    return response.data;
  }

  // Disconnect a repository
  async disconnectRepository(repositoryId: string): Promise<void> {
    await this.api.post(`/api/github/repositories/${repositoryId}/disconnect`);
  }

  // Sync GitHub data for a specific date
  async syncData(date?: string): Promise<GitHubActivity> {
    const response = await this.api.post('/api/github/sync', { date });
    return response.data;
  }

  // Get activity for a specific date
  async getActivity(date: string): Promise<GitHubActivity> {
    const response = await this.api.get(`/api/github/activity/${date}`);
    return response.data;
  }

  // Get recent activities with pagination
  async getRecentActivities(limit: number = 7): Promise<GitHubActivity[]> {
    const response = await this.api.get(`/api/github/activities?limit=${limit}`);
    return response.data;
  }

  // Validate GitHub token
  async validateToken(): Promise<{ valid: boolean; expiresAt?: string }> {
    const response = await this.api.post('/api/github/token/validate');
    return response.data;
  }

  // Disconnect GitHub account completely
  async disconnectAccount(): Promise<void> {
    await this.api.delete('/api/github/disconnect');
  }

  // Manually refresh GitHub token
  async refreshGitHubToken(): Promise<void> {
    await this.refreshToken();
  }

  // Store GitHub token (for initial setup)
  async storeToken(token: string): Promise<void> {
    await this.api.post('/api/github/token', { token });
  }
}

// Create singleton instance
export const githubApi = new GitHubApiClient();

// React hooks for GitHub API operations
export function useGitHubStatus() {
  const { showError, showSuccess } = useErrorHandler();
  
  const fetchStatus = async () => {
    try {
      return await githubApi.getStatus();
    } catch (error) {
      showError(error instanceof Error ? error : new Error('Failed to fetch GitHub status'));
      throw error;
    }
  };

  const validateToken = async () => {
    try {
      return await githubApi.validateToken();
    } catch (error) {
      showError(error instanceof Error ? error : new Error('Failed to validate token'));
      throw error;
    }
  };

  const refreshToken = async () => {
    try {
      await githubApi.refreshGitHubToken();
      showSuccess('GitHub token refreshed successfully');
    } catch (error) {
      showError(error instanceof Error ? error : new Error('Failed to refresh token'));
      throw error;
    }
  };

  const disconnectAccount = async () => {
    try {
      await githubApi.disconnectAccount();
      showSuccess('GitHub account disconnected');
    } catch (error) {
      showError(error instanceof Error ? error : new Error('Failed to disconnect account'));
      throw error;
    }
  };

  return { fetchStatus, validateToken, refreshToken, disconnectAccount };
}

export function useGitHubRepositories() {
  const { showError, showSuccess } = useErrorHandler();
  
  const fetchRepositories = async () => {
    try {
      return await githubApi.getRepositories();
    } catch (error) {
      showError(error instanceof Error ? error : new Error('Failed to fetch repositories'));
      throw error;
    }
  };

  const connectRepository = async (owner: string, repo: string) => {
    try {
      const result = await githubApi.connectRepository(owner, repo);
      showSuccess(`Successfully connected ${owner}/${repo}`);
      return result;
    } catch (error) {
      showError(error instanceof Error ? error : new Error('Failed to connect repository'));
      throw error;
    }
  };

  const disconnectRepository = async (repositoryId: string, repoName: string) => {
    try {
      await githubApi.disconnectRepository(repositoryId);
      showSuccess(`Successfully disconnected ${repoName}`);
    } catch (error) {
      showError(error instanceof Error ? error : new Error('Failed to disconnect repository'));
      throw error;
    }
  };

  return { fetchRepositories, connectRepository, disconnectRepository };
}

export function useGitHubActivity() {
  const { showError, showSuccess } = useErrorHandler();
  
  const syncData = async (date?: string) => {
    try {
      const result = await githubApi.syncData(date);
      showSuccess('GitHub data synced successfully');
      return result;
    } catch (error) {
      showError(error instanceof Error ? error : new Error('Failed to sync GitHub data'));
      throw error;
    }
  };

  const fetchActivity = async (date: string) => {
    try {
      return await githubApi.getActivity(date);
    } catch (error) {
      showError(error instanceof Error ? error : new Error('Failed to fetch activity'));
      throw error;
    }
  };

  const fetchRecentActivities = async (limit: number = 7) => {
    try {
      return await githubApi.getRecentActivities(limit);
    } catch (error) {
      showError(error instanceof Error ? error : new Error('Failed to fetch recent activities'));
      throw error;
    }
  };

  return { syncData, fetchActivity, fetchRecentActivities };
}