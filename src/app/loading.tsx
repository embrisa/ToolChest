import { ToolGridFallback } from "@/components/ui";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section Skeleton */}
      <section className="surface-glass border-b border-neutral-200/50 dark:border-neutral-800/50">
        <div className="container-wide py-12">
          <div className="text-center animate-pulse">
            <div className="skeleton-title mx-auto mb-4 max-w-md"></div>
            <div className="skeleton-text mx-auto mb-8 max-w-2xl"></div>
            <div className="skeleton-button mx-auto"></div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container-wide py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Sidebar Skeleton */}
          <aside className="lg:col-span-1">
            <div className="card p-6 animate-pulse">
              <div className="skeleton h-6 rounded mb-4 w-24"></div>
              <div className="space-y-3">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <div className="skeleton h-4 w-4 rounded"></div>
                    <div className="skeleton h-4 rounded flex-1"></div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Tools Grid */}
          <div className="mt-8 lg:mt-0 lg:col-span-3">
            <ToolGridFallback count={6} message="Loading tools..." />
          </div>
        </div>
      </main>
    </div>
  );
}
