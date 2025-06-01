# Test info

- Name: Homepage Debug Tests >> capture homepage screenshot to debug CSS issues
- Location: /Users/philippetillheden/ToolChest/e2e/debug-homepage.spec.ts:4:9

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3001/
Call log:
  - navigating to "http://localhost:3001/", waiting until "load"

    at /Users/philippetillheden/ToolChest/e2e/debug-homepage.spec.ts:6:20
```

# Page snapshot

```yaml
- heading "This site can’t be reached" [level=1]
- paragraph:
    - strong: localhost
    - text: refused to connect.
- paragraph: "Try:"
- list:
    - listitem: Checking the connection
    - listitem:
        - link "Checking the proxy and the firewall":
            - /url: "#buttons"
- text: ERR_CONNECTION_REFUSED
- button "Reload"
- button "Details"
```

# Test source

```ts
   1 | import { test, expect } from "@playwright/test";
   2 |
   3 | test.describe("Homepage Debug Tests", () => {
   4 |     test("capture homepage screenshot to debug CSS issues", async ({ page }) => {
   5 |         // Navigate to homepage on the correct port
>  6 |         await page.goto("http://localhost:3001/");
     |                    ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3001/
   7 |
   8 |         // Wait for the page to load
   9 |         await page.waitForLoadState("domcontentloaded");
   10 |
   11 |         // Wait a bit for any dynamic content
   12 |         await page.waitForTimeout(2000);
   13 |
   14 |         // Take a full page screenshot
   15 |         await page.screenshot({
   16 |             path: "test-results/homepage-debug.png",
   17 |             fullPage: true
   18 |         });
   19 |
   20 |         // Check if there are any CSS loading issues
   21 |         const stylesheets = await page.evaluate(() => {
   22 |             return Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(link => {
   23 |                 const linkElement = link as HTMLLinkElement;
   24 |                 return {
   25 |                     href: linkElement.href,
   26 |                     loaded: !!linkElement.sheet,
   27 |                     rulesCount: linkElement.sheet ? linkElement.sheet.cssRules.length : 0
   28 |                 };
   29 |             });
   30 |         });
   31 |
   32 |         console.log("Stylesheets found:", stylesheets);
   33 |
   34 |         // Check for any CSS loading errors
   35 |         const cssErrors = await page.evaluate(() => {
   36 |             const errors: string[] = [];
   37 |             const links = document.querySelectorAll('link[rel="stylesheet"]');
   38 |             links.forEach(link => {
   39 |                 const linkElement = link as HTMLLinkElement;
   40 |                 if (!linkElement.sheet) {
   41 |                     errors.push(`Failed to load: ${linkElement.href}`);
   42 |                 }
   43 |             });
   44 |             return errors;
   45 |         });
   46 |
   47 |         if (cssErrors.length > 0) {
   48 |             console.log("CSS loading errors:", cssErrors);
   49 |         }
   50 |
   51 |         // Check if Tailwind classes are being applied
   52 |         const hasStyles = await page.evaluate(() => {
   53 |             const body = document.body;
   54 |             const computedStyles = window.getComputedStyle(body);
   55 |             return {
   56 |                 backgroundColor: computedStyles.backgroundColor,
   57 |                 fontFamily: computedStyles.fontFamily,
   58 |                 hasClasses: body.className,
   59 |                 htmlClasses: document.documentElement.className
   60 |             };
   61 |         });
   62 |
   63 |         // Check for multiple search bars
   64 |         const searchBars = await page.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="Search" i]').count();
   65 |         console.log("Number of search bars found:", searchBars);
   66 |
   67 |         // List all input elements to debug
   68 |         const allInputs = await page.evaluate(() => {
   69 |             return Array.from(document.querySelectorAll('input')).map(input => ({
   70 |                 type: input.type,
   71 |                 placeholder: input.placeholder,
   72 |                 className: input.className,
   73 |                 id: input.id
   74 |             }));
   75 |         });
   76 |
   77 |         console.log("All input elements:", allInputs);
   78 |         console.log("Body styles applied:", hasStyles);
   79 |
   80 |         // Check page structure
   81 |         const pageStructure = await page.evaluate(() => {
   82 |             const main = document.querySelector('main');
   83 |             const header = document.querySelector('header');
   84 |             const footer = document.querySelector('footer');
   85 |
   86 |             return {
   87 |                 hasMain: !!main,
   88 |                 hasHeader: !!header,
   89 |                 hasFooter: !!footer,
   90 |                 mainContent: main ? main.innerHTML.substring(0, 500) + '...' : 'No main element',
   91 |                 bodyClasses: document.body.className,
   92 |                 htmlClasses: document.documentElement.className
   93 |             };
   94 |         });
   95 |
   96 |         console.log("Page structure:", pageStructure);
   97 |
   98 |         // Check for any errors in console
   99 |         const logs: string[] = [];
  100 |         page.on('console', (msg) => {
  101 |             if (msg.type() === 'error') {
  102 |                 logs.push(msg.text());
  103 |             }
  104 |         });
  105 |
  106 |         // Wait for any console errors to appear
```
