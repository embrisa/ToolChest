import { test, expect } from "@playwright/test";
import path from "path";
import { HomePage } from "./poms/HomePage";

test.describe("Favicon Generator E2E Tests", () => {
  let homePage: HomePage;
  const imagePath = path.join(__dirname, "assets", "test-image.png");
  const nonImagePath = path.join(__dirname, "assets", "test-file.txt");

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
    const faviconCard = await homePage.getToolCardBySlug("favicon-generator");
    await faviconCard.click();
    await page.waitForURL("**/favicon-generator");
  });

  test("should generate favicons from a valid image", async ({ page }) => {
    // 1. Upload a valid image
    await page.setInputFiles('input[type="file"]', imagePath);

    // 2. Wait for previews to be generated
    await page.waitForSelector('[data-testid="favicon-preview-grid"]');

    // 3. Verify that multiple previews are visible
    const previews = page.locator('[data-testid="favicon-preview-card"]');
    await expect(previews.first()).toBeVisible();
    expect(await previews.count()).toBeGreaterThan(5);

    // 4. Verify the download button is enabled and works
    const downloadButton = page.getByRole("button", { name: /download all/i });
    await expect(downloadButton).toBeEnabled();

    // 5. Verify the download starts (we don't need to complete it)
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      downloadButton.click(),
    ]);

    expect(download.suggestedFilename()).toBe("favicons.zip");
  });

  test("should show an error for non-image file uploads", async ({ page }) => {
    // 1. Upload a non-image file
    await page.setInputFiles('input[type="file"]', nonImagePath);

    // 2. Verify an error message is shown
    const errorMessage = page.locator("text=/invalid file type/i");
    await expect(errorMessage).toBeVisible();

    // 3. Verify the download button is disabled
    const downloadButton = page.getByRole("button", { name: /download all/i });
    await expect(downloadButton).toBeDisabled();
  });
});
