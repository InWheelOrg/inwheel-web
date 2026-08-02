import { expect, test } from "@playwright/test";
import { GatePage } from "./pages/gate.page";
import { E2E_PAGE_PASSWORD } from "./constants";

test.describe("password gate", () => {
  test("redirects an unauthenticated visit to / over to /gate", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/gate$/);
  });

  test("shows an inline error on a wrong password and stays on /gate", async ({ page }) => {
    const gate = new GatePage(page);
    await gate.goto();
    await gate.login("definitely-wrong");

    await expect(gate.errorMessage()).toBeVisible();
    await expect(page).toHaveURL(/\/gate$/);
  });

  test("grants access on the correct password and reaches /", async ({ page }) => {
    const gate = new GatePage(page);
    await gate.goto();
    await gate.login(E2E_PAGE_PASSWORD);

    await expect(page).toHaveURL("/");
  });

  test("persists the session across a reload, without re-prompting", async ({ page }) => {
    const gate = new GatePage(page);
    await gate.goto();
    await gate.login(E2E_PAGE_PASSWORD);
    await expect(page).toHaveURL("/");

    await page.reload();
    await expect(page).toHaveURL("/");
  });

  test("serves a disallow-all robots.txt", async ({ page }) => {
    const response = await page.goto("/robots.txt");
    const body = await response?.text();
    expect(body).toContain("Disallow: /");
  });
});
