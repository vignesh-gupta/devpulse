import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@devpulse/ui/components/card';

export default function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <svg
              className="w-6 h-6 text-blue-600"
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
          <CardTitle className="text-xl text-gray-900">
            Preparing Login
          </CardTitle>
          <CardDescription>
            Setting up authentication...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Login Form Skeleton */}
          <div className="space-y-4">
            <div className="h-12 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mx-auto" />
          </div>
          
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <div className="h-1 w-1 bg-gray-300 rounded-full animate-pulse" />
            <div className="h-1 w-1 bg-gray-300 rounded-full animate-pulse animation-delay-100" />
            <div className="h-1 w-1 bg-gray-300 rounded-full animate-pulse animation-delay-200" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}