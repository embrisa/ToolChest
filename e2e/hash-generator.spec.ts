import { test, expect } from "@playwright/test";

test.describe("Hash Generator smoke", () => {
  test("hashes text input and enables copy/download actions", async ({ page }) => {
    await page.goto("/tools/hash-generator");

    const input = page.getByLabel(/text input/i);
    await input.fill("hash me");

    const resultOutput = page.getByLabel("Result output");
    await expect(resultOutput).toHaveValue(/SHA-256:/i, { timeout: 10000 });

    const copyButton = page.getByRole("button", { name: /copy result/i });
    await expect(copyButton).toBeEnabled();
    await copyButton.click();
    await expect(copyButton).toHaveText(/copied!/i);

    const downloadButton = page.getByRole("button", { name: /download result/i });
    await expect(downloadButton).toBeEnabled();

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      downloadButton.click(),
    ]);

    expect(download.suggestedFilename()).toMatch(/hashes\.txt$/i);
  });
});

