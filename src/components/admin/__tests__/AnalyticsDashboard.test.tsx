import { render, screen } from "@testing-library/react";
import { AnalyticsDashboard } from "../AnalyticsDashboard";
import type { AnalyticsSummary } from "@/types/admin/analytics";

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
      growthRates: { usageGrowth: 0, userGrowth: 0, sessionGrowth: 0 },
    },
  } as any;

  it("renders summary stats", () => {
    render(<AnalyticsDashboard initialData={summary} />);
    expect(screen.getByText("Total Tools")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });
});
