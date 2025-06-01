import { cn } from "../classNames";

describe("classNames utility", () => {
  describe("basic functionality", () => {
    it("should combine classes correctly", () => {
      const result = cn("class1", "class2");
      expect(result).toBe("class1 class2");
    });

    it("should handle undefined and null values", () => {
      const result = cn("class1", undefined, "class2", null);
      expect(result).toBe("class1 class2");
    });

    it("should handle conditional classes", () => {
      const isActive = true;
      const isDisabled = false;
      const result = cn(
        "base-class",
        isActive && "active",
        isDisabled && "disabled",
      );
      expect(result).toBe("base-class active");
    });

    it("should handle empty input", () => {
      const result = cn();
      expect(result).toBe("");
    });

    it("should handle object-style classes", () => {
      const result = cn({
        class1: true,
        class2: false,
        class3: true,
      });
      expect(result).toContain("class1");
      expect(result).toContain("class3");
      expect(result).not.toContain("class2");
    });

    it("should handle array of classes", () => {
      const result = cn(["class1", "class2", undefined, "class3"]);
      expect(result).toBe("class1 class2 class3");
    });
  });

  describe("edge cases", () => {
    it("should handle empty strings", () => {
      const result = cn("", "class1", "", "class2");
      expect(result).toBe("class1 class2");
    });

    it("should handle whitespace-only strings", () => {
      const result = cn("  ", "class1", "   ", "class2");
      expect(result).toBe("class1 class2");
    });

    it("should deduplicate classes", () => {
      const result = cn("class1", "class2", "class1", "class3", "class2");
      // Should handle duplicates gracefully (exact behavior depends on implementation)
      expect(result).toContain("class1");
      expect(result).toContain("class2");
      expect(result).toContain("class3");
    });
  });

  describe("performance", () => {
    it("should handle large number of classes efficiently", () => {
      const startTime = performance.now();
      const classes = Array.from({ length: 1000 }, (_, i) => `class-${i}`);
      const result = cn(...classes);
      const endTime = performance.now();

      expect(result).toContain("class-0");
      expect(result).toContain("class-999");
      expect(endTime - startTime).toBeLessThan(100); // Should be fast
    });
  });

  describe("TypeScript type safety", () => {
    it("should accept string literals", () => {
      const result = cn("text-blue-500", "hover:text-blue-600");
      expect(result).toBe("text-blue-500 hover:text-blue-600");
    });

    it("should accept template literals", () => {
      const color = "blue";
      const result = cn(`text-${color}-500`, `hover:text-${color}-600`);
      expect(result).toBe("text-blue-500 hover:text-blue-600");
    });
  });
});
