import { test, expect } from "@playwright/test";

test.describe("Markdown to PDF smoke", () => {
  test("generates a PDF and exposes download", async ({ page }) => {
    test.slow();

    await page.goto("/tools/markdown-to-pdf");

    const editor = page.getByLabel(/markdown content editor/i);
    await editor.fill("# Hello PDF\n\nThis is a short test document.");

    const generateButton = page.getByRole("button", { name: /generate pdf/i });
    await generateButton.click();

    await expect(
      page.getByText(/PDF Generated Successfully!/i),
    ).toBeVisible({ timeout: 30000 });

    const downloadButton = page.getByRole("button", { name: /download result/i });
    await expect(downloadButton).toBeEnabled();

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      downloadButton.click(),
    ]);

    expect(download.suggestedFilename()).toMatch(/tool-chest_markdown/i);
    expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
  });
});

