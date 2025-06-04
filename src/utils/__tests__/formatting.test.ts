import { formatBytes, formatDate } from "../formatting";

describe("formatting utilities", () => {
  it("formats bytes", () => {
    expect(formatBytes(1024)).toBe("1 KB");
    expect(formatBytes(1048576)).toBe("1 MB");
  });

  it("formats date", () => {
    const result = formatDate("2020-01-01T00:00:00Z", "en-US", {
      timeZone: "UTC",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    expect(result).toBe("Jan 1, 2020");
  });
});
