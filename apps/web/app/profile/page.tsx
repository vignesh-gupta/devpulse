import { requireServerAuth } from "../../lib/auth-server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@devpulse/ui/components/card";
import Link from "next/link";

export default async function ProfilePage() {
  const { user, session } = await requireServerAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Profile</h1>
          <p className="text-gray-600">Server-Side Rendered Profile Page</p>
          <p className="text-sm text-blue-600 mt-2">
            This page is rendered server-side with authentication
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
            href="/account"
            className="px-4 py-2 text-blue-600 hover:text-blue-800 underline"
          >
            Account (Client-Side)
          </Link>
        </div>

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
                Your profile information fetched server-side
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    User ID
                  </label>
                  <p className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                    {user.id}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Name
                  </label>
                  <p className="text-gray-900">{user.name}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Email
                  </label>
                  <p className="text-gray-900">{user.email}</p>
                </div>

                {user.image && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Avatar
                    </label>
                    <div className="mt-2">
                      <img
                        src={user.image}
                        alt={user.name}
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
                  {session.id}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Expires At
                </label>
                <p className="text-gray-900">
                  {new Date(session.expiresAt).toLocaleString()}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Render Type
                </label>
                <p className="text-green-600 font-semibold">
                  Server-Side Rendering
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Page Generated
                </label>
                <p className="text-gray-900">{new Date().toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Server-Side Features</CardTitle>
            <CardDescription>
              This page demonstrates server-side authentication and data
              fetching
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-600">✅ Implemented</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Server-side authentication check</li>
                  <li>• Automatic redirect if not authenticated</li>
                  <li>• Session validation on server</li>
                  <li>• User data pre-fetched</li>
                  <li>• SEO-friendly rendering</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-600">
                  🔮 Future Features
                </h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• GitHub repository connections</li>
                  <li>• Daily activity summaries</li>
                  <li>• AI-generated standup reports</li>
                  <li>• Team collaboration features</li>
                  <li>• Activity timeline</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
