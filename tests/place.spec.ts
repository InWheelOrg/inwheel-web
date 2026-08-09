import { expect, test } from "@playwright/test";
import { GatePage } from "./pages/gate.page";
import { SearchPage } from "./pages/search.page";
import { PlaceDetailPage } from "./pages/place-detail.page";
import { E2E_PAGE_PASSWORD } from "./constants";

test.describe("search and accessibility form", () => {
  test.beforeEach(async ({ page }) => {
    const gate = new GatePage(page);
    await gate.goto();
    await gate.login(E2E_PAGE_PASSWORD);
    await expect(page).toHaveURL("/");
  });

  test("search -> select a place -> toggle one field -> submit shows a toast", async ({ page }) => {
    const search = new SearchPage(page);
    await search.search("Saint Moritz");
    await expect(search.results().first()).toBeVisible();
    await search.results().first().click();
    await expect(page).toHaveURL(/\/places\/.+/, { timeout: 15_000 });

    const detail = new PlaceDetailPage(page);
    await detail.firstYesToggle("Entrée").click();
    await detail.submit();

    await expect(detail.toast("Modifications enregistrées.")).toBeVisible();
    await expect(page).toHaveURL("/");
  });

  test("marking a section as doesn't apply submits successfully and reads back empty", async ({ page }) => {
    const search = new SearchPage(page);
    await search.search("Telecabina");
    await expect(search.results().first()).toBeVisible();
    await search.results().first().click();
    await expect(page).toHaveURL(/\/places\/.+/, { timeout: 15_000 });
    const placeUrl = page.url();

    const detail = new PlaceDetailPage(page);
    await detail.doesNotApplySwitch("Cheminements").click();
    await detail.submit();
    await expect(detail.toast("Modifications enregistrées.")).toBeVisible();

    await page.goto(placeUrl);
    await expect(detail.doesNotApplySwitch("Cheminements")).toHaveAttribute("aria-checked", "false");
    await expect(detail.firstYesToggle("Cheminements")).not.toHaveAttribute("aria-pressed", "true");
  });
});
