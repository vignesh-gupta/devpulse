// Main exports for the GitHub API package
export * from './types';
export * from './client';

// Re-export commonly used functions
export { createGitHubClient } from './client';

// Version
export const VERSION = '0.0.1';