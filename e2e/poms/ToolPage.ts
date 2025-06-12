import { type Page, type Locator } from "@playwright/test";

export class ToolPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly copyButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator("h1");
    this.copyButton = page.getByRole("button", { name: /copy/i });
  }

  async getPageTitle(): Promise<string | null> {
    return this.pageTitle.textContent();
  }

  async clickCopyButton(buttonText: string | RegExp = /copy/i): Promise<void> {
    await this.page.getByRole("button", { name: buttonText }).click();
  }
}
