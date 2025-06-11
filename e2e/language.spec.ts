import { test, expect } from "@playwright/test";
import { HomePage } from "./poms/HomePage";

test.describe("Language Switching E2E Tests", () => {
    let homePage: HomePage;

    test.beforeEach(async ({ page }) => {
        homePage = new HomePage(page);
        await homePage.goto();
    });

    test("should switch language and translate content", async ({ page }) => {
        // 1. Check initial language (English)
        const initialHeading = page.getByRole("heading", { name: "Essential Computer Tools" });
        await expect(initialHeading).toBeVisible();

        // 2. Switch language to Spanish
        await page.getByRole('combobox', { name: 'Language' }).selectOption('es');

        // 3. Verify the URL has updated
        await page.waitForURL("**/es");

        // 4. Check that the heading is now in Spanish
        const translatedHeading = page.getByRole("heading", { name: "Herramientas Informáticas Esenciales" });
        await expect(translatedHeading).toBeVisible();

        // 5. Switch back to English
        await page.getByRole('combobox', { name: 'Language' }).selectOption('en');
        await page.waitForURL("**/en");
        await expect(initialHeading).toBeVisible();
    });
}); 