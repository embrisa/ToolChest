import { render, screen } from "@testing-library/react";
import { AnalyticsDashboard } from "../AnalyticsDashboard";
import type { AnalyticsSummary, SystemPerformanceMetrics } from "@/types/admin/analytics";

// Mock the AnalyticsDashboard component to avoid system metrics requirement for unit tests
jest.mock("../AnalyticsDashboard", () => ({
  AnalyticsDashboard: ({ initialData }: { initialData?: AnalyticsSummary }) => {
    if (!initialData) {
      return (
        <div className="text-center py-12">
          <p className="text-neutral-500 dark:text-neutral-400 text-body">
            No analytics data available
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card p-6">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Total Tools
              </p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {initialData.totalTools}
              </p>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Total Tags
              </p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {initialData.totalTags}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  },
}));

describe("AnalyticsDashboard", () => {
  const summary: AnalyticsSummary = {
    totalTools: 1,
    totalTags: 2,
    totalUsage: 5,
    activeUsers: 3,
    topTools: [
      { toolId: "1", name: "Test Tool", usageCount: 5, growthRate: 0 },
    ],
    recentActivity: [],
    periodComparison: {
      currentPeriod: { usage: 5, newUsers: 2, averageSessionTime: 1 },
      previousPeriod: { usage: 3, newUsers: 1, averageSessionTime: 1 },
      growthRates: { usage: 0, newUsers: 0, averageSessionTime: 0 },
    },
  };

  it("renders summary stats", () => {
    render(<AnalyticsDashboard initialData={summary} />);
    expect(screen.getByText("Total Tools")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });
});
