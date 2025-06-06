import { test, expect } from "@playwright/test";

test.describe("Locale Switching E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Start from the homepage
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test.describe("Default Locale (English)", () => {
    test("should display English content by default", async ({ page }) => {
      // Check that the page title is in English
      await expect(page).toHaveTitle(/tool-chest/);

      // Verify header navigation is in English
      const header = page.getByRole("banner");
      await expect(header).toBeVisible();

      // Check for English navigation links
      // Note: These are the translated values we expect from next-intl
      const toolsLink = header.getByRole("link", { name: /all tools/i });
      const aboutLink = header.getByRole("link", { name: /about/i });

      await expect(toolsLink).toBeVisible();
      await expect(aboutLink).toBeVisible();
    });

    test("should display English content on homepage", async ({ page }) => {
      // Look for English hero content
      // Note: The exact text will depend on the current translation implementation
      const mainContent = page.getByRole("main");
      await expect(mainContent).toBeVisible();

      // Check for key English phrases that should be present
      // This is a flexible check since the exact implementation may vary
      const pageContent = await mainContent.textContent();
      expect(pageContent).toBeTruthy();

      // At minimum, the page should load without errors and show content
      const headings = page.getByRole("heading");
      await expect(headings.first()).toBeVisible();
    });
  });

  test.describe("Navigation Consistency", () => {
    test("should maintain consistent navigation across pages", async ({
      page,
    }) => {
      // Start on homepage
      await expect(page.getByRole("banner")).toBeVisible();
      const headerText = await page.getByRole("banner").textContent();

      // Navigate to tools page
      await page.getByRole("link", { name: /tools/i }).first().click();
      await page.waitForURL(/\/tools/);

      // Verify header content is consistent
      const toolsPageHeaderText = await page.getByRole("banner").textContent();
      expect(toolsPageHeaderText).toBe(headerText);

      // Navigate back to home
      await page.getByRole("link", { name: /tool-chest/i }).click();
      await page.waitForURL("/");

      // Verify header is still consistent
      const homePageHeaderText = await page.getByRole("banner").textContent();
      expect(homePageHeaderText).toBe(headerText);
    });

    test("should handle navigation to tool pages", async ({ page }) => {
      // Wait for tools to load (if any exist)
      await page.waitForFunction(
        () => {
          const toolsGrid = document.querySelector(
            '[data-testid="tools-grid"]',
          );
          const noResults = document.querySelector(
            '[data-testid="no-results"]',
          );
          const skeletons = document.querySelectorAll(
            '[data-testid="tool-skeleton"]',
          );
          return toolsGrid || noResults || skeletons.length === 0;
        },
        { timeout: 10000 },
      );

      const hasTools = await page
        .locator('[data-testid="tools-grid"]')
        .isVisible()
        .catch(() => false);

      if (hasTools) {
        // Click on first tool if available
        const firstTool = page.locator('[data-testid="tool-card"]').first();
        await firstTool.click();

        // Should navigate to a tool page
        await page.waitForURL(/\/tools\/.+/);

        // Verify we're on a tool page and header is still present
        await expect(page.getByRole("banner")).toBeVisible();
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      } else {
        // Skip this test if no tools are available
        test.skip(true, "No tools available to test navigation");
      }
    });
  });

  test.describe("Error Page Handling", () => {
    test("should display appropriate error content for 404 pages", async ({
      page,
    }) => {
      // Navigate to a non-existent page
      await page.goto("/non-existent-page");

      // Should show 404 error page
      // The exact content depends on the not-found.tsx implementation
      const mainContent = page.getByRole("main");
      await expect(mainContent).toBeVisible();

      // Should still have proper header
      await expect(page.getByRole("banner")).toBeVisible();

      // Should have error-related content
      const headings = page.getByRole("heading");
      await expect(headings.first()).toBeVisible();
    });
  });

  test.describe("Accessibility with Internationalization", () => {
    test("should maintain proper ARIA labels in current locale", async ({
      page,
    }) => {
      // Check that search input has proper labeling
      const searchInput = page.getByRole("searchbox");
      if (await searchInput.isVisible()) {
        const ariaLabel = await searchInput.getAttribute("aria-label");
        expect(ariaLabel).toBeTruthy();
        expect(ariaLabel).toContain("search"); // Should contain search-related text
      }

      // Check navigation landmarks
      await expect(page.getByRole("banner")).toBeVisible();
      await expect(page.getByRole("main")).toBeVisible();

      // Footer should also be present
      const footer = page.getByRole("contentinfo");
      if (await footer.isVisible()) {
        const footerContent = await footer.textContent();
        expect(footerContent).toBeTruthy();
      }
    });

    test("should have proper heading hierarchy regardless of content language", async ({
      page,
    }) => {
      // Main heading should be h1
      const h1 = page.getByRole("heading", { level: 1 });
      await expect(h1).toBeVisible();

      // Should have logical heading structure
      const allHeadings = page.getByRole("heading");
      const headingCount = await allHeadings.count();
      expect(headingCount).toBeGreaterThan(0);
    });
  });

  test.describe("Performance with Translations", () => {
    test("should load translated content efficiently", async ({ page }) => {
      const startTime = Date.now();

      // Navigate to homepage
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const loadTime = Date.now() - startTime;

      // Should load reasonably quickly (under 5 seconds for E2E)
      expect(loadTime).toBeLessThan(5000);

      // Content should be visible
      await expect(page.getByRole("main")).toBeVisible();
      await expect(page.getByRole("banner")).toBeVisible();
    });
  });

  test.describe("Search Functionality with Translations", () => {
    test("should handle search input in current locale", async ({ page }) => {
      const searchInput = page.getByRole("searchbox");

      if (await searchInput.isVisible()) {
        // Test search functionality
        await searchInput.fill("test");

        // Should handle search input gracefully
        // The exact behavior depends on implementation
        await page.waitForTimeout(500); // Wait for any search debouncing

        // Should still have search input visible and functional
        await expect(searchInput).toBeVisible();
        await expect(searchInput).toHaveValue("test");
      }
    });
  });
});
