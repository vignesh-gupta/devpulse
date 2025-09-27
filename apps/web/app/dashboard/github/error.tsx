'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@devpulse/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@devpulse/ui/components/card';

interface GitHubErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GitHubError({ error, reset }: GitHubErrorProps) {
  useEffect(() => {
    console.error('GitHub integration error:', error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-center min-h-[50vh]">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <CardTitle className="text-xl text-gray-900">
              GitHub Integration Error
            </CardTitle>
            <CardDescription>
              There was a problem loading your GitHub integration. This could be due to authentication issues, API rate limits, or network connectivity.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Button onClick={reset} className="w-full">
                Retry GitHub Connection
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/login?reconnect=github">
                  Reconnect GitHub Account
                </Link>
              </Button>
              <Button variant="ghost" asChild className="w-full">
                <Link href="/dashboard">
                  Back to Dashboard
                </Link>
              </Button>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3">
                Troubleshooting steps:
              </p>
              <ul className="text-sm text-gray-500 space-y-1 list-disc list-inside">
                <li>Check if your GitHub account is properly connected</li>
                <li>Verify repository permissions in GitHub settings</li>
                <li>Ensure your GitHub token hasn't expired</li>
                <li>Try disconnecting and reconnecting your GitHub account</li>
              </ul>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">
                Need help? Common GitHub integration issues:
              </p>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="p-2 bg-gray-50 rounded">
                  <strong className="text-gray-700">Rate Limited:</strong>
                  <span className="text-gray-600 ml-1">Wait a few minutes and try again</span>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <strong className="text-gray-700">Token Expired:</strong>
                  <span className="text-gray-600 ml-1">Reconnect your GitHub account</span>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <strong className="text-gray-700">No Repositories:</strong>
                  <span className="text-gray-600 ml-1">Check repository permissions</span>
                </div>
              </div>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <details className="text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 mb-2">
                  Technical Details (Development)
                </summary>
                <div className="p-3 bg-gray-100 rounded text-xs font-mono text-gray-700 overflow-auto max-h-32">
                  <div><strong>Error:</strong> {error.message}</div>
                  {error.digest && (
                    <div><strong>ID:</strong> {error.digest}</div>
                  )}
                  {error.stack && (
                    <div className="mt-2">
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap text-xs mt-1">
                        {error.stack.substring(0, 500)}...
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}