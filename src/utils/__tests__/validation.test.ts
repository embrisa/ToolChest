import { isEmail, isUrl } from "../validation";

describe("validation utilities", () => {
  it("validates email", () => {
    expect(isEmail("test@example.com")).toBe(true);
    expect(isEmail("invalid")).toBe(false);
  });

  it("validates url", () => {
    expect(isUrl("https://example.com")).toBe(true);
    expect(isUrl("notaurl")).toBe(false);
  });
});
