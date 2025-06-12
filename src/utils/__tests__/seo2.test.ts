import { generateAlternates, generateOpenGraph } from "@/utils/seo";

describe("SEO Fallback", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    delete process.env.NEXT_PUBLIC_BASE_URL;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should use localhost as base URL in generateAlternates if env variable is not set", () => {
    const alternates = generateAlternates("en", "/test");
    expect(alternates?.canonical).toBe("http://localhost:3000/test");
  });

  it("should use localhost as base URL in generateOpenGraph if env variable is not set", () => {
    const openGraph = generateOpenGraph("en", "title", "description", "/test");
    expect(openGraph?.url).toBe("http://localhost:3000/en/test");
  });
});
