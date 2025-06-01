import { Metadata } from "next";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";

export const metadata: Metadata = {
  title: "Analytics - tool-chest Admin",
  description:
    "View comprehensive analytics and system performance metrics for tool-chest",
};

export default function AnalyticsPage() {
  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Page Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-accent-500 rounded-xl flex items-center justify-center">
            <span className="text-2xl">📈</span>
          </div>
          <div>
            <h1 className="text-title text-3xl font-bold text-foreground">
              Analytics Dashboard
            </h1>
            <p className="mt-2 text-body text-neutral-600 dark:text-neutral-400">
              Monitor tool usage, system performance, and user engagement
              metrics across your tool-chest application.
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="surface-glass rounded-xl p-4">
            <div className="text-sm text-neutral-500 dark:text-neutral-400">
              Live Users
            </div>
            <div className="text-2xl font-bold text-foreground mt-1">
              <span className="inline-flex items-center">
                <span className="w-2 h-2 bg-success-500 rounded-full mr-2 animate-pulse"></span>
                23
              </span>
            </div>
          </div>
          <div className="surface-glass rounded-xl p-4">
            <div className="text-sm text-neutral-500 dark:text-neutral-400">
              Today's Sessions
            </div>
            <div className="text-2xl font-bold text-foreground mt-1">1,247</div>
          </div>
          <div className="surface-glass rounded-xl p-4">
            <div className="text-sm text-neutral-500 dark:text-neutral-400">
              Page Views
            </div>
            <div className="text-2xl font-bold text-foreground mt-1">3,829</div>
          </div>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <AnalyticsDashboard />
    </div>
  );
}
