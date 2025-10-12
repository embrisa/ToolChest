import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";
import { HomePage } from "./poms/HomePage";

test.describe("Import/Export Refactor — E2E", () => {
  let homePage: HomePage;
  const txtPath = path.join(__dirname, "assets", "test-file.txt");

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test("Base64: paste text, copy, and download", async ({ page }) => {
    const base64Card = await homePage.getToolCardBySlug("base64");
    await base64Card.click();
    await page.waitForURL("**/base64");

    // Stub clipboard read and copy fallback for consistent behavior
    await page.evaluate(() => {
      // @ts-ignore
      if (!navigator.clipboard) {
        // @ts-ignore
        navigator.clipboard = {} as any;
      }
      // @ts-ignore
      navigator.clipboard.readText = async () => "Hello Import Panel";
      // Ensure fallback copy succeeds even on insecure context
      // @ts-ignore
      document.execCommand = () => true;
    });

    // Paste from clipboard in text mode
    await page.getByRole("button", { name: /paste from clipboard/i }).click();

    // Textarea should be populated and auto-processed
    const textArea = page.getByLabel(/text input/i);
    await expect(textArea).toHaveValue("Hello Import Panel");

    // Wait until copy is enabled (result rendered)
    const copyBtn = page.getByRole("button", { name: /^copy(?!.*json)/i });
    await expect(copyBtn).toBeEnabled();

    // Copy should flip to "Copied!" briefly
    await copyBtn.click();
    await expect(
      page.getByRole("button", { name: /copied!/i })
    ).toBeVisible();

    // Download should trigger browser download
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: /download result/i }).click(),
    ]);
    const suggest = download.suggestedFilename();
    expect(suggest).toMatch(/tool-chest_base64_/i);
    expect(suggest).toMatch(/\.txt$/i);
  });

  test("Base64: file upload via picker", async ({ page }) => {
    const base64Card = await homePage.getToolCardBySlug("base64");
    await base64Card.click();
    await page.waitForURL("**/base64");

    // Switch to File mode
    await page.getByRole("button", { name: /^file$/i }).click();

    // Upload using the system picker (hidden input)
    await page.setInputFiles('input[type="file"]', txtPath);

    // Result should render and copy enabled
    const copyBtn = page.getByRole("button", { name: /^copy(?!.*json)/i });
    await expect(copyBtn).toBeEnabled();

    // Download event should fire
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: /download result/i }).click(),
    ]);
    const suggest = download.suggestedFilename();
    expect(suggest).toMatch(/tool-chest_base64_/i);
    expect(suggest).toMatch(/\.txt$/i);
  });

  test("Base64: drag-and-drop file to upload", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Drag-drop file simulation is Chromium-only");

    const base64Card = await homePage.getToolCardBySlug("base64");
    await base64Card.click();
    await page.waitForURL("**/base64");

    // Switch to File mode
    await page.getByRole("button", { name: /^file$/i }).click();

    // Find the wrapper that handles paste/drag events
    const tip = page.getByText(/Tip: You can also paste a file here\./i);
    const wrapper = tip.locator("..");

    // Prepare file bytes as base64 in Node and pass to browser
    const bytes = fs.readFileSync(txtPath).toString("base64");
    await (await wrapper.elementHandle())!.evaluate((el, { name, b64 }) => {
      const uint8 = new Uint8Array(
        atob(b64)
          .split("")
          .map((c) => c.charCodeAt(0)),
      );
      const file = new File([uint8], name, { type: "text/plain" });
      const dt = new DataTransfer();
      dt.items.add(file);

      // Dispatch drop with a populated DataTransfer
      const evt = new Event("drop", { bubbles: true });
      Object.defineProperty(evt, "dataTransfer", { value: dt });
      el.dispatchEvent(evt);
    }, { name: "dropped.txt", b64: bytes });

    // Result should render and copy enabled
    const copyBtn = page.getByRole("button", { name: /^copy(?!.*json)/i });
    await expect(copyBtn).toBeEnabled();
  });

  test("Base64: paste a file into ImportPanel (file mode)", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Programmatic paste with file is Chromium-only");

    const base64Card = await homePage.getToolCardBySlug("base64");
    await base64Card.click();
    await page.waitForURL("**/base64");

    // Switch to File mode
    await page.getByRole("button", { name: /^file$/i }).click();

    const tip = page.getByText(/Tip: You can also paste a file here\./i);
    const wrapper = tip.locator("..");

    const bytes = fs.readFileSync(txtPath).toString("base64");
    await (await wrapper.elementHandle())!.evaluate((el, { name, b64 }) => {
      const uint8 = new Uint8Array(
        atob(b64)
          .split("")
          .map((c) => c.charCodeAt(0)),
      );
      const file = new File([uint8], name, { type: "text/plain" });
      const dt = new DataTransfer();
      dt.items.add(file);

      // Create a cancellable paste event and inject clipboardData
      const evt = new Event("paste", { bubbles: true, cancelable: true });
      Object.defineProperty(evt, "clipboardData", { value: dt });
      el.dispatchEvent(evt);
    }, { name: "pasted.txt", b64: bytes });

    const copyBtn = page.getByRole("button", { name: /^copy(?!.*json)/i });
    await expect(copyBtn).toBeEnabled();
  });

  test("Format Converter: Copy JSON with feedback", async ({ page }) => {
    // Navigate directly (dynamic route supports this slug even if not listed on homepage)
    await page.goto("/tools/format-converter");
    await page.waitForURL("**/format-converter");

    // Provide JSON input in text mode
    const input = page.getByLabel(/text input/i);
    await input.fill("{\n  \"hello\": \"world\"\n}");

    // Convert action
    await page.getByRole("button", { name: /convert/i }).click();

    // Ensure output rendered and Copy JSON is enabled
    const copyJsonBtn = page.getByRole("button", { name: /copy json/i });
    await expect(copyJsonBtn).toBeEnabled();

    // Stub fallback copy path for consistent success
    await page.evaluate(() => {
      // @ts-ignore
      document.execCommand = () => true;
    });

    await copyJsonBtn.click();
    await expect(page.getByRole("button", { name: /copied!/i })).toBeVisible();
  });
});
