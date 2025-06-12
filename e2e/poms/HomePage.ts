import { type Page, type Locator } from "@playwright/test";

export class HomePage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly tagFilter: Locator;
  readonly toolCard: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByPlaceholder("Search tools...");
    this.tagFilter = page.locator('[data-testid="tag-filter"]');
    this.toolCard = page.locator('[data-testid="tool-card"]');
  }

  async goto() {
    await this.page.goto("/");
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForSelector('[data-testid="search-results"]');
  }

  async applyTagFilter(tagName: string) {
    await this.tagFilter.getByText(tagName).click();
  }

  async getToolCardBySlug(slug: string): Promise<Locator> {
    return this.toolCard.filter({
      has: this.page.locator(`a[href$="/${slug}"]`),
    });
  }
}
