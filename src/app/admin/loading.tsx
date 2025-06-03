export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container-wide py-8">
        <div className="space-y-6">
          {/* Page Header Skeleton */}
          <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
            <div className="skeleton h-8 w-48 mb-2"></div>
            <div className="skeleton h-4 w-96"></div>
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card p-6">
                <div className="flex items-center space-x-4">
                  <div className="skeleton h-12 w-12 rounded-xl"></div>
                  <div className="space-y-2 flex-1">
                    <div className="skeleton h-4 w-20"></div>
                    <div className="skeleton h-6 w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Content Cards Skeleton */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="card p-6">
              <div className="skeleton h-6 w-32 mb-4"></div>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="skeleton h-4 w-full"></div>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <div className="skeleton h-6 w-32 mb-4"></div>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="skeleton h-4 w-full"></div>
                ))}
              </div>
            </div>
          </div>

          {/* Loading Message */}
          <div className="text-center py-8">
            <div className="inline-flex items-center space-x-3 text-neutral-600 dark:text-neutral-400">
              <div className="animate-spin w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full"></div>
              <span className="text-sm font-medium">
                Loading admin dashboard...
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
