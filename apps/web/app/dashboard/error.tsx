'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@devpulse/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@devpulse/ui/components/card';

interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
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
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <CardTitle className="text-xl text-gray-900">
            Dashboard Error
          </CardTitle>
          <CardDescription>
            There was a problem loading your dashboard. This might be due to a temporary issue with your GitHub integration or data sync.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Button onClick={reset} className="w-full">
              Retry Loading Dashboard
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/dashboard/github">
                Check GitHub Integration
              </Link>
            </Button>
            <Button variant="ghost" asChild className="w-full">
              <Link href="/">
                Back to Home
              </Link>
            </Button>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">
              Common solutions:
            </p>
            <ul className="text-sm text-gray-500 space-y-1 list-disc list-inside">
              <li>Check your internet connection</li>
              <li>Verify your GitHub account is connected</li>
              <li>Try refreshing your GitHub repositories</li>
              <li>Clear your browser cache and cookies</li>
            </ul>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <details className="text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 mb-2">
                Error Details (Development)
              </summary>
              <div className="p-3 bg-gray-100 rounded text-xs font-mono text-gray-700 overflow-auto max-h-32">
                <div><strong>Error:</strong> {error.message}</div>
                {error.digest && (
                  <div><strong>ID:</strong> {error.digest}</div>
                )}
              </div>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  );
}