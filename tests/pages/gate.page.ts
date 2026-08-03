import type { Locator, Page } from "@playwright/test";

export class GatePage {
  readonly page: Page;
  readonly passwordInput: Locator;
  readonly privacyCheckbox: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.passwordInput = page.getByLabel("Mot de passe");
    this.privacyCheckbox = page.getByRole("checkbox");
    this.submitButton = page.getByRole("button", { name: "Entrer" });
  }

  async goto() {
    await this.page.goto("/gate");
  }

  async login(password: string) {
    await this.passwordInput.fill(password);
    await this.privacyCheckbox.click();
    await this.submitButton.click();
  }

  errorMessage() {
    return this.page.getByText(/Mot de passe|tentatives/);
  }
}
