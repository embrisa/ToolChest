import { AnalyticsService } from "@/services/admin/analyticsService";

describe("AnalyticsService utilities", () => {
  let service: AnalyticsService;
  beforeAll(() => {
    jest
      .spyOn(AnalyticsService.prototype as any, "initializeMonitoring")
      .mockImplementation(() => {});
    service = new AnalyticsService();
  });

  test("groupUsagesByPeriod groups by day", () => {
    const usages = [
      { timestamp: new Date("2024-01-01") },
      { timestamp: new Date("2024-01-01") },
      { timestamp: new Date("2024-01-02") },
    ];
    const result = (service as any).groupUsagesByPeriod(usages, "day");
    expect(result).toEqual([2, 1]);
  });

  test("calculateGrowthRates returns percentages", () => {
    const rates = (service as any).calculateGrowthRates({
      daily: [1, 2, 4],
      weekly: [2, 2],
      monthly: [1, 3],
    });
    expect(Math.round(rates.dailyGrowth)).toBe(100);
    expect(rates.weeklyGrowth).toBe(0);
    expect(Math.round(rates.monthlyGrowth)).toBe(200);
  });

  test("calculateAlertSeverity maps ratios", () => {
    const sevLow = (service as any).calculateAlertSeverity(
      "error_rate",
      100,
      110,
    );
    const sevHigh = (service as any).calculateAlertSeverity(
      "error_rate",
      100,
      220,
    );
    expect(sevLow).toBe("low");
    expect(sevHigh).toBe("critical");
  });

  test("logError stores error entries", () => {
    (service as any).errorLogs = [];
    service.logError("boom", new Error("fail"));
    expect((service as any).errorLogs.length).toBe(1);
  });
});
