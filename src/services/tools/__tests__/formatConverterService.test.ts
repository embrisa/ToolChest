import { FormatConverterService } from "@/services/tools/formatConverterService";

describe("FormatConverterService", () => {
  it("converts JSON to YAML", () => {
    const res = FormatConverterService.convert(
      '{"name":"test"}',
      "json",
      "yaml",
    );
    expect(res.success).toBe(true);
    expect(res.output).toContain("name: test");
  });

  it("returns error for invalid input", () => {
    const res = FormatConverterService.convert("not-json", "json", "yaml");
    expect(res.success).toBe(false);
  });
});
