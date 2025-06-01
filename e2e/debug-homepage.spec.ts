import { test, expect } from "@playwright/test";

test.describe("Homepage Debug Tests", () => {
    test("capture homepage screenshot to debug CSS issues", async ({ page }) => {
        // Navigate to homepage on the correct port
        await page.goto("http://localhost:3000/");

        // Wait for the page to load
        await page.waitForLoadState("domcontentloaded");

        // Wait a bit for any dynamic content
        await page.waitForTimeout(2000);

        // Take a full page screenshot
        await page.screenshot({
            path: "test-results/homepage-debug.png",
            fullPage: true
        });

        // Check if there are any CSS loading issues
        const stylesheets = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(link => {
                const linkElement = link as HTMLLinkElement;
                return {
                    href: linkElement.href,
                    loaded: !!linkElement.sheet,
                    rulesCount: linkElement.sheet ? linkElement.sheet.cssRules.length : 0
                };
            });
        });

        console.log("Stylesheets found:", stylesheets);

        // Check for any CSS loading errors
        const cssErrors = await page.evaluate(() => {
            const errors: string[] = [];
            const links = document.querySelectorAll('link[rel="stylesheet"]');
            links.forEach(link => {
                const linkElement = link as HTMLLinkElement;
                if (!linkElement.sheet) {
                    errors.push(`Failed to load: ${linkElement.href}`);
                }
            });
            return errors;
        });

        if (cssErrors.length > 0) {
            console.log("CSS loading errors:", cssErrors);
        }

        // Check if Tailwind classes are being applied
        const hasStyles = await page.evaluate(() => {
            const body = document.body;
            const computedStyles = window.getComputedStyle(body);
            return {
                backgroundColor: computedStyles.backgroundColor,
                fontFamily: computedStyles.fontFamily,
                hasClasses: body.className,
                htmlClasses: document.documentElement.className
            };
        });

        // Check for multiple search bars
        const searchBars = await page.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="Search" i]').count();
        console.log("Number of search bars found:", searchBars);

        // List all input elements to debug
        const allInputs = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('input')).map(input => ({
                type: input.type,
                placeholder: input.placeholder,
                className: input.className,
                id: input.id
            }));
        });

        console.log("All input elements:", allInputs);
        console.log("Body styles applied:", hasStyles);

        // Check page structure
        const pageStructure = await page.evaluate(() => {
            const main = document.querySelector('main');
            const header = document.querySelector('header');
            const footer = document.querySelector('footer');

            return {
                hasMain: !!main,
                hasHeader: !!header,
                hasFooter: !!footer,
                mainContent: main ? main.innerHTML.substring(0, 500) + '...' : 'No main element',
                bodyClasses: document.body.className,
                htmlClasses: document.documentElement.className
            };
        });

        console.log("Page structure:", pageStructure);

        // Check for any errors in console
        const logs: string[] = [];
        page.on('console', (msg) => {
            if (msg.type() === 'error') {
                logs.push(msg.text());
            }
        });

        // Wait for any console errors to appear
        await page.waitForTimeout(1000);

        if (logs.length > 0) {
            console.log("Console errors found:", logs);
        }

        // Basic assertion that page loaded
        await expect(page).toHaveTitle(/tool-chest/);
    });
}); 