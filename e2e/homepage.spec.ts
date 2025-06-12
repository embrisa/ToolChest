import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { HomePage } from "./poms/HomePage";
import { ToolPage } from "./poms/ToolPage";

test.describe("Homepage E2E Tests", () => {
  let homePage: HomePage;
  let toolPage: ToolPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    toolPage = new ToolPage(page);
    await homePage.goto();
    await expect(page).toHaveTitle(/tool-chest/);
  });

  test.describe("Page Loading and Navigation", () => {
    test("should load homepage successfully and display header", async ({
      page,
    }) => {
      const heading = page.getByRole("heading", {
        name: /tool-chest/i,
        level: 1,
      });
      await expect(heading).toBeVisible();
      const header = page.getByRole("banner");
      await expect(header).toBeVisible();
    });

    test("should display footer with content", async ({ page }) => {
      const footer = page.getByRole("contentinfo");
      await expect(footer).toBeVisible();
    });

    test("should allow navigation to a tool page", async ({ page }) => {
      const firstTool = homePage.toolCard.first();
      const toolLink = firstTool.getByRole("link");
      const href = await toolLink.getAttribute("href");
      expect(href).toMatch(/\/tools\//);

      await toolLink.click();
      await page.waitForURL(/\/tools\//);

      const toolHeading = await toolPage.getPageTitle();
      expect(toolHeading).not.toBeNull();
    });
  });

  test.describe("Search and Filtering", () => {
    test("should filter tools by search query", async () => {
      const initialCount = await homePage.toolCard.count();
      await homePage.search("base64");
      await expect(homePage.toolCard).not.toHaveCount(initialCount);
      const base64Card = await homePage.getToolCardBySlug("base64");
      await expect(base64Card).toBeVisible();
      await expect(homePage.toolCard).toHaveCount(1);
    });

    test("should show no results for a valid search with no matches", async ({
      page,
    }) => {
      await homePage.search("nonexistenttool12345");
      const noResultsMessage = page.getByTestId("no-results");
      await expect(noResultsMessage).toBeVisible();
    });

    test("should filter tools by tag", async () => {
      await homePage.applyTagFilter("Encoding");
      const base64Card = await homePage.getToolCardBySlug("base64");
      await expect(base64Card).toBeVisible();
    });
  });

  test.describe("Responsive Design", () => {
    test("should display a single column of tools on mobile", async ({
      page,
    }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Check that the tools grid is in a single-column layout
      const toolsGrid = homePage.toolCard.first().locator("..");
      const gridStyles = await toolsGrid.evaluate((element) => {
        return window.getComputedStyle(element);
      });

      // On mobile, the grid should be a single column
      expect(
        gridStyles.getPropertyValue("grid-template-columns"),
      ).not.toContain(" ");
    });
  });

  test.describe("Accessibility", () => {
    test("should have no accessibility violations on load", async ({
      page,
    }) => {
      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });
});
