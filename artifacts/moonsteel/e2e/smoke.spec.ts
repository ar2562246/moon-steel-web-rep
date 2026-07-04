import { expect, test } from "@playwright/test";

test.describe("marketing site smoke tests", () => {
  test("homepage loads with hero heading", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Precision Stainless Steel");
  });

  test("products catalog page loads", async ({ page }) => {
    await page.goto("/products");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("projects index page loads", async ({ page }) => {
    await page.goto("/projects");
    await expect(page.getByRole("heading", { level: 1, name: "Our Projects" })).toBeVisible();
  });

  test("login page loads", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Admin Login" })).toBeVisible();
  });

  test("contact section is reachable from homepage", async ({ page }) => {
    await page.goto("/#contact");
    await expect(page.locator("#contact")).toBeVisible();
    await expect(page.getByRole("button", { name: /submit request/i })).toBeVisible();
  });
});
