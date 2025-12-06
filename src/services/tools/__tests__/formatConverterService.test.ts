import { FormatConverterService } from "@/services/tools/formatConverterService";

describe("FormatConverterService", () => {
  it("converts JSON to YAML", () => {
    const input = JSON.stringify({ hello: "world", count: 2 });
    const result = FormatConverterService.convert(input, "json", "yaml");
    expect(result.success).toBe(true);
    expect(result.output).toContain("hello: world");
    expect(result.output).toContain("count: 2");
  });

  it("converts YAML to JSON", () => {
    const yaml = "hello: world\ncount: 2";
    const result = FormatConverterService.convert(yaml, "yaml", "json");
    expect(result.success).toBe(true);
    expect(result.output).toContain('"hello": "world"');
    expect(result.output).toContain('"count": 2');
  });

  it("returns an error for invalid input", () => {
    const badJson = "{not-valid-json}";
    const result = FormatConverterService.convert(badJson, "json", "yaml");
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
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
