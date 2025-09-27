'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@devpulse/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@devpulse/ui/components/card';

export default function GitHubManagementPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">GitHub Integration</h1>
            <p className="text-gray-600 mt-2">
              Manage your connected repositories and sync your development activity
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>GitHub Repository Management</CardTitle>
            <CardDescription>
              Connect and manage your GitHub repositories for activity tracking.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Coming Soon:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Repository connection and disconnection</li>
                  <li>• Real-time activity synchronization</li>
                  <li>• Available repositories browsing</li>
                  <li>• Token management and refresh</li>
                </ul>
              </div>
              
              <div className="pt-4">
                <Button 
                  onClick={() => router.push('/onboarding')}
                  className="mr-3"
                >
                  Connect GitHub Account
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                >
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
