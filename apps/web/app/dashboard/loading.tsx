import { Skeleton, SkeletonCard, SkeletonStats, SkeletonActivity } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@devpulse/ui/components/card';

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Dashboard Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Quick Stats Skeleton */}
      <SkeletonStats count={4} />

      {/* Recent Activity Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GitHub Activity Card */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <SkeletonActivity items={3} />
          </CardContent>
        </Card>

        {/* Summary Card */}
        <SkeletonCard lines={4} showActions />
      </div>

      {/* Repository List Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-36 mb-2" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-5 w-5" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}