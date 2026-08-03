import type { Locator, Page } from "@playwright/test";

export class SearchPage {
  readonly page: Page;
  readonly searchInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByPlaceholder("Nom du lieu…");
  }

  async goto() {
    await this.page.goto("/");
  }

  async search(query: string) {
    await this.searchInput.fill(query);
  }

  results() {
    return this.page.getByRole("link");
  }
}
