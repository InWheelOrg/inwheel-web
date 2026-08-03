import type { Locator, Page } from "@playwright/test";

export class PlaceDetailPage {
  readonly page: Page;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.submitButton = page.getByRole("button", { name: "Enregistrer" });
  }

  private sectionPanel(sectionLabel: string): Locator {
    return this.page
      .getByRole("button", { name: sectionLabel })
      .locator("xpath=ancestor::*[@data-slot='accordion-item']");
  }

  doesNotApplySwitch(sectionLabel: string): Locator {
    return this.sectionPanel(sectionLabel).getByRole("switch", { name: "Ne s'applique pas" });
  }

  firstYesToggle(sectionLabel: string): Locator {
    return this.sectionPanel(sectionLabel).getByRole("button", { name: "Oui" }).first();
  }

  async submit() {
    await this.submitButton.click();
  }

  toast(text: string | RegExp) {
    return this.page.getByText(text);
  }
}
