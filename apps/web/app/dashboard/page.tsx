"use client";

import { authClient } from "@/lib/auth-client";
import Image from "next/image";

export default function DashboardPage() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-4">
            Please sign in to access your dashboard.
          </p>
          <a
            href="/login"
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  const avatarSrc =
    session.user?.image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user?.name || session.user?.email || "User")}&background=3B82F6&color=fff`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">
                Welcome back, {session.user?.name || session.user?.email}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Image
                className="h-8 w-8 rounded-full"
                src={avatarSrc}
                alt="Profile"
                width={32}
                height={32}
              />
              <button
                onClick={() => {
                  authClient.signOut();
                }}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <a
              href="/profile"
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-green-600"
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
                  </div>
                  <div className="ml-3 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Server-Side Profile
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Profile Page
                      </dd>
                    </dl>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  View your profile with server-side rendering and
                  authentication
                </p>
              </div>
            </a>

            <a
              href="/account"
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-purple-600"
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
                  </div>
                  <div className="ml-3 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Client-Side Account
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Account Page
                      </dd>
                    </dl>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Manage your account with client-side rendering and real-time
                  updates
                </p>
              </div>
            </a>

            <div className="bg-white overflow-hidden shadow rounded-lg opacity-50">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                      />
                    </svg>
                  </div>
                  <div className="ml-3 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Coming Soon
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Settings
                      </dd>
                    </dl>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Configure your preferences and integrations
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No summaries yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Connect your GitHub account to start generating AI-powered daily
              standup summaries.
            </p>
            <div className="mt-6">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Connect GitHub
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
