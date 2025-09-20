"use client";

import { Button } from "@devpulse/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@devpulse/ui/components/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function AccountPage() {
  const { data: session, isPending, error } = authClient.useSession();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second to show real-time client-side rendering
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Loading session...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="text-red-600 mb-4">
              <svg
                className="w-12 h-12 mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Session Error
            </h3>
            <p className="text-gray-600 mb-4">{error.message}</p>
            <Button onClick={() => router.push("/login")}>
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Account</h1>
          <p className="text-gray-600">Client-Side Rendered Account Page</p>
          <p className="text-sm text-purple-600 mt-2">
            This page is rendered client-side with authentication
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-center gap-4 mb-8">
          <Link
            href="/dashboard"
            className="px-4 py-2 text-blue-600 hover:text-blue-800 underline"
          >
            Dashboard
          </Link>
          <Link
            href="/profile"
            className="px-4 py-2 text-blue-600 hover:text-blue-800 underline"
          >
            Profile (Server-Side)
          </Link>
        </div>

        {/* Real-time Clock */}
        <Card className="mb-6">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-mono text-blue-600">
              {currentTime.toLocaleTimeString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Live client-side rendering - updates every second
            </p>
          </CardContent>
        </Card>

        {/* User Information Card */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                User Information
              </CardTitle>
              <CardDescription>
                Your profile information fetched client-side
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    User ID
                  </label>
                  <p className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                    {session.user.id}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Name
                  </label>
                  <p className="text-gray-900">{session.user.name}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Email
                  </label>
                  <p className="text-gray-900">{session.user.email}</p>
                </div>

                {session.user.image && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Avatar
                    </label>
                    <div className="mt-2">
                      <img
                        src={session.user.image}
                        alt={session.user.name}
                        className="w-16 h-16 rounded-full border-2 border-gray-200"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Session Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Session Details
              </CardTitle>
              <CardDescription>Current session information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Session ID
                </label>
                <p className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                  {session.session.id}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Expires At
                </label>
                <p className="text-gray-900">
                  {new Date(session.session.expiresAt).toLocaleString()}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Render Type
                </label>
                <p className="text-purple-600 font-semibold">
                  Client-Side Rendering
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Last Updated
                </label>
                <p className="text-gray-900">{currentTime.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interactive Features Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Client-Side Features</CardTitle>
            <CardDescription>
              This page demonstrates client-side authentication and real-time
              updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-purple-600">
                  ✨ Client-Side Benefits
                </h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Real-time data updates</li>
                  <li>• Interactive user experience</li>
                  <li>• Instant navigation</li>
                  <li>• Loading states and error handling</li>
                  <li>• Optimistic UI updates</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-green-600">
                  🔒 Security Features
                </h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Automatic auth redirect</li>
                  <li>• Session validation</li>
                  <li>• Error boundaries</li>
                  <li>• Secure token handling</li>
                  <li>• Protected route access</li>
                </ul>
              </div>
            </div>

            {/* Interactive Demo */}
            <div className="border-t pt-6">
              <h4 className="font-semibold text-gray-900 mb-4">
                Interactive Demo
              </h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  size="sm"
                >
                  Refresh Page
                </Button>
                <Button
                  onClick={() => alert(`Hello, ${session.user.name}!`)}
                  variant="outline"
                  size="sm"
                >
                  Show Alert
                </Button>
                <Button
                  onClick={() => router.push("/dashboard")}
                  variant="outline"
                  size="sm"
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
