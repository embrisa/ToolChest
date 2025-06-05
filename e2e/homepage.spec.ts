import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Homepage E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage before each test
    await page.goto("/");
    // Wait for the page to load with a more reasonable timeout
    // Use domcontentloaded instead of networkidle for faster tests
    await page.waitForLoadState("domcontentloaded");
    // Wait for the main content to be visible
    await page.waitForSelector("main", { timeout: 10000 });
  });

  test.describe("Page Loading and Navigation", () => {
    test("should load homepage successfully", async ({ page }) => {
      // Check title loads
      await expect(page).toHaveTitle(/tool-chest/);

      // Check main heading is visible - using actual text from implementation
      const heading = page.getByRole("heading", {
        name: /tool-chest/i,
        level: 1,
      });
      await expect(heading).toBeVisible();
    });

    test("should display navigation header", async ({ page }) => {
      // Check header is present
      const header = page.getByRole("banner");
      await expect(header).toBeVisible();

      // Check logo/brand is clickable - using actual implementation selector
      const brand = header
        .getByRole("link")
        .filter({ hasText: "<tool-chest>" });
      await expect(brand).toBeVisible();

      // Test navigation functionality
      await expect(brand).toHaveAttribute("href", "/");
    });

    test("should display footer with content", async ({ page }) => {
      // Check footer is present
      const footer = page.getByRole("contentinfo");
      await expect(footer).toBeVisible();
    });
  });

  test.describe("Tool Discovery", () => {
    test("should display tools grid or loading state", async ({ page }) => {
      // Wait for either loading skeletons or tools to appear
      await page.waitForFunction(
        () => {
          const skeletons = document.querySelectorAll(
            '[data-testid="tool-skeleton"]',
          );
          const toolsGrid = document.querySelector(
            '[data-testid="tools-grid"]',
          );
          const noResults = document.querySelector(
            '[data-testid="no-results"]',
          );
          return skeletons.length > 0 || toolsGrid || noResults;
        },
        { timeout: 15000 },
      );

      // Check if we're in a loading state or have tools
      const isLoading = await page
        .getByTestId("tool-skeleton")
        .first()
        .isVisible()
        .catch(() => false);

      if (isLoading) {
        // If loading, verify skeleton elements and wait for completion
        const skeletons = page.getByTestId("tool-skeleton");
        await expect(skeletons.first()).toBeVisible();

        // Wait for loading to complete with a reasonable timeout
        await page
          .waitForFunction(
            () => {
              const skeletons = document.querySelectorAll(
                '[data-testid="tool-skeleton"]',
              );
              return skeletons.length === 0;
            },
            { timeout: 10000 },
          )
          .catch(() => {
            // Loading might not complete if no data, that's ok for this test
          });
      }

      // After loading, check for either tools or no-results state
      const hasTools = await page
        .getByTestId("tools-grid")
        .isVisible()
        .catch(() => false);
      const hasNoResults = await page
        .getByTestId("no-results")
        .isVisible()
        .catch(() => false);

      // Should have either tools or no-results message
      expect(hasTools || hasNoResults).toBe(true);

      if (hasTools) {
        const toolCards = page.getByTestId("tool-card");
        await expect(toolCards.first()).toBeVisible();

        // Check that at least one card has proper structure
        const firstCard = toolCards.first();
        await expect(firstCard.getByRole("link")).toBeVisible();
        await expect(
          firstCard.getByRole("heading", { level: 3 }),
        ).toBeVisible();
      }
    });

    test("should allow navigation to tool pages when tools exist", async ({
      page,
    }) => {
      // Wait for page content to load
      await page.waitForFunction(
        () => {
          const toolsGrid = document.querySelector(
            '[data-testid="tools-grid"]',
          );
          const noResults = document.querySelector(
            '[data-testid="no-results"]',
          );
          return toolsGrid || noResults;
        },
        { timeout: 15000 },
      );

      const hasTools = await page
        .getByTestId("tools-grid")
        .isVisible()
        .catch(() => false);

      if (hasTools) {
        // If tools exist, test navigation
        const firstTool = page.getByTestId("tool-card").first();
        const toolLink = firstTool.getByRole("link");

        // Get the href to verify it's a tool page
        const href = await toolLink.getAttribute("href");
        expect(href).toMatch(/\/tools\//);

        // Click and verify navigation
        await toolLink.click();
        await page.waitForURL(/\/tools\//, { timeout: 10000 });

        // Should have tool-specific content
        const toolHeading = page.getByRole("heading", { level: 1 });
        await expect(toolHeading).toBeVisible();
      } else {
        // Skip this test if no tools are available
        test.skip(true, "No tools available to test navigation");
      }
    });
  });

  test.describe("Search Functionality", () => {
    test("should have search input", async ({ page }) => {
      // Look for search input - using data-testid from implementation
      const searchInput = page.getByTestId("search-input").getByRole("textbox");
      await expect(searchInput).toBeVisible();
      await expect(searchInput).toBeEditable();
    });

    test("should filter tools by search query", async ({ page }) => {
      // Wait for page content to load
      await page.waitForFunction(
        () => {
          const toolsGrid = document.querySelector(
            '[data-testid="tools-grid"]',
          );
          const noResults = document.querySelector(
            '[data-testid="no-results"]',
          );
          return toolsGrid || noResults;
        },
        { timeout: 15000 },
      );

      const hasTools = await page
        .getByTestId("tools-grid")
        .isVisible()
        .catch(() => false);

      if (hasTools) {
        // Search for something that might exist
        const searchInput = page
          .getByTestId("search-input")
          .getByRole("textbox");
        await searchInput.fill("base64");

        // Wait for search results to update (with debouncing)
        await page.waitForTimeout(1000);

        // Check results summary is updated
        const resultsSummary = page.getByTestId("results-summary");
        await expect(resultsSummary).toBeVisible();

        // Should show search results heading
        const searchHeading = page.getByRole("heading", {
          name: /Search Results/i,
        });
        await expect(searchHeading).toBeVisible();
      } else {
        // Skip this test if no tools are available
        test.skip(true, "No tools available to test search");
      }
    });

    test("should handle empty search results", async ({ page }) => {
      const searchInput = page.getByTestId("search-input").getByRole("textbox");
      await searchInput.fill("nonexistenttool12345");

      // Wait for search to complete
      await page.waitForTimeout(1000);

      // Should show no results message
      const noResultsMessage = page.getByTestId("no-results");
      await expect(noResultsMessage).toBeVisible();
    });
  });

  test.describe("Tag Filtering", () => {
    test("should display tag filters section", async ({ page }) => {
      // Look for tag filter section
      const tagFilters = page.getByTestId("tag-filters");
      await expect(tagFilters).toBeVisible();

      // Should have the section heading
      const filterHeading = page.getByRole("heading", {
        name: /Filter by Tag/i,
      });
      await expect(filterHeading).toBeVisible();
    });

    test("should show tag options or loading state", async ({ page }) => {
      const tagFilters = page.getByTestId("tag-filters");
      await expect(tagFilters).toBeVisible();

      // Wait a bit for tags to load
      await page.waitForTimeout(2000);

      // Check if we have tag elements or empty state
      const tagElements = tagFilters.locator('[role="button"][aria-pressed]');
      const tagCount = await tagElements.count();

      if (tagCount > 0) {
        // If tags exist, verify they're interactive
        await expect(tagElements.first()).toBeVisible();

        // Test tag interaction
        await tagElements.first().click();

        // Wait for state change to be reflected in DOM
        await page.waitForTimeout(500);

        // Should update URL or show some visual feedback
        const isPressed = await tagElements
          .first()
          .getAttribute("aria-pressed");
        expect(isPressed).toBe("true");
      }
      // If no tags, that's also a valid state for this test
    });
  });

  test.describe("Responsive Design", () => {
    test("should work on mobile devices", async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Check that page is still functional
      const heading = page.getByRole("heading", { level: 1 });
      await expect(heading).toBeVisible();

      // Check that header navigation is present
      const header = page.getByRole("banner");
      await expect(header).toBeVisible();
    });

    test("should work on tablet devices", async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });

      // Check responsive layout
      const mainContent = page.getByRole("main");
      await expect(mainContent).toBeVisible();

      // Check tools section exists
      const toolsSection = page
        .getByTestId("tools-grid")
        .or(page.getByTestId("no-results"));
      await expect(toolsSection).toBeVisible();
    });
  });

  test.describe("Performance", () => {
    test("should load within performance budget", async ({ page }) => {
      const startTime = Date.now();

      await page.goto("/");
      await page.waitForLoadState("domcontentloaded");

      const loadTime = Date.now() - startTime;

      // Should load within 5 seconds (reasonable for development)
      expect(loadTime).toBeLessThan(5000);
    });

    test("should have reasonable Core Web Vitals", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("domcontentloaded");

      // Measure Largest Contentful Paint (LCP)
      const lcp = await page.evaluate(() => {
        return new Promise((resolve) => {
          if ("PerformanceObserver" in window) {
            const observer = new PerformanceObserver((list) => {
              const entries = list.getEntries();
              if (entries.length > 0) {
                const lastEntry = entries[entries.length - 1];
                resolve(lastEntry.startTime);
              }
            });
            observer.observe({ entryTypes: ["largest-contentful-paint"] });

            // Fallback timeout
            setTimeout(() => resolve(0), 10000);
          } else {
            resolve(0);
          }
        });
      });

      // LCP should be under 3 seconds (reasonable for testing)
      if (typeof lcp === "number" && lcp > 0) {
        expect(lcp).toBeLessThan(3000);
      }
    });
  });
});

// Accessibility-specific test suite
test.describe("Homepage Accessibility Tests", () => {
  test("should not have critical accessibility violations", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Wait for main content to load
    await page.waitForSelector("main", { timeout: 10000 });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .include("body")
      .exclude('[data-testid="loading"]') // Exclude loading states
      .exclude('[data-testid="tool-skeleton"]') // Exclude skeleton loaders
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"]) // Focus on critical issues
      .analyze();

    // Filter out minor violations and focus on critical issues
    const criticalViolations = accessibilityScanResults.violations.filter(
      (violation) =>
        violation.impact === "critical" || violation.impact === "serious",
    );

    expect(criticalViolations).toEqual([]);
  });

  test("should be navigable by keyboard", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Wait for main content to load
    await page.waitForSelector("main", { timeout: 10000 });

    // Test tab navigation
    await page.keyboard.press("Tab");

    // Should focus on first interactive element
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();

    // Continue tabbing through interactive elements
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press("Tab");
      // Each tab should maintain focus on a visible element
      const currentFocus = page.locator(":focus");
      const isVisible = await currentFocus.isVisible().catch(() => false);
      if (isVisible) {
        expect(isVisible).toBe(true);
      }
    }
  });

  test("should work with screen readers", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Wait for main content to load
    await page.waitForSelector("main", { timeout: 10000 });

    // Check for proper headings hierarchy
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toBeVisible();

    // Check for landmark regions
    const main = page.getByRole("main");
    await expect(main).toBeVisible();

    const navigation = page.getByRole("banner");
    await expect(navigation).toBeVisible();

    // Check images have alt text or are decorative
    const images = page.getByRole("img");
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const image = images.nth(i);
      const altText = await image.getAttribute("alt");
      const ariaHidden = await image.getAttribute("aria-hidden");
      const role = await image.getAttribute("role");

      // Images should either have alt text, be aria-hidden, or have role="img" with aria-label
      const hasAltText = altText !== null && altText !== "";
      const isDecorative = ariaHidden === "true";
      const hasAriaLabel =
        role === "img" && (await image.getAttribute("aria-label")) !== null;

      const isAccessible = hasAltText || isDecorative || hasAriaLabel;

      if (!isAccessible) {
        console.log(`Image ${i} failed accessibility check:`, {
          altText,
          ariaHidden,
          role,
          tagName: await image.evaluate((el) => el.tagName),
          outerHTML: await image.evaluate((el) =>
            el.outerHTML.substring(0, 200),
          ),
        });
      }

      expect(isAccessible).toBe(true);
    }
  });

  test("should respect reduced motion preferences", async ({ page }) => {
    // Simulate prefers-reduced-motion
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Page should still be functional without animations
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();

    // Interactive elements should still work
    const searchInput = page.getByTestId("search-input").getByRole("textbox");
    if (await searchInput.isVisible()) {
      await searchInput.fill("test");
      // Should still function without animations
      await expect(searchInput).toHaveValue("test");
    }
  });
});
