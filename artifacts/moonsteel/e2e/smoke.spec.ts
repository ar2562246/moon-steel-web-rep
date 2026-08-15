import { expect, test } from "@playwright/test";

test.describe("marketing site smoke tests", () => {
  test("homepage loads with hero heading", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Commercial kitchen equipment");
  });

  test("products catalog page loads", async ({ page }) => {
    await page.goto("/products");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("product cards are visible on first load without interaction", async ({ page }) => {
    await page.goto("/products");
    const firstCard = page.getByRole("heading", { level: 2 }).first();
    await expect(firstCard).toBeVisible();
    await expect(page.locator(".motion-reveal").first()).toHaveCSS("opacity", "1");
  });

  test("projects index page loads", async ({ page }) => {
    await page.goto("/projects");
    await expect(page.getByRole("heading", { level: 1, name: "Our Projects" })).toBeVisible();
  });

  test("clients page loads", async ({ page }) => {
    await page.goto("/clients");
    await expect(page.getByRole("heading", { level: 1, name: "Our Clients" })).toBeVisible();
  });

  test("process page loads with the four stages", async ({ page }) => {
    await page.goto("/process");
    await expect(page.getByRole("heading", { level: 1, name: "From Concept to Kitchen." })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Consultation" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Design / Drawing" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Fabrication" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Delivery & Installation" })).toBeVisible();
    await expect(page.getByRole("link", { name: /back to home/i })).toBeVisible();
  });

  test("about page loads with company history", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByRole("heading", { level: 1, name: "About Moon Steel" })).toBeVisible();
    await expect(page.getByText("Ghulam Haider").first()).toBeVisible();
  });

  test("food fusion collaboration page loads with products", async ({ page }) => {
    await page.goto("/collaboration/food-fusion");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Food Fusion");
    await expect(page.getByRole("heading", { name: "Connect Loop Trivet" })).toBeVisible();
  });

  test("homepage links to the food fusion collaboration", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("link", { name: /Explore the collaboration/i }).first(),
    ).toBeVisible();
  });

  test("login page loads", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Admin Login" })).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in with passkey/i })).toBeVisible();
  });

  test("admin security page redirects to login", async ({ page }) => {
    await page.goto("/admin/security");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("heading", { name: "Admin Login" })).toBeVisible();
  });

  test("grease traps hub loads with Pakistan manufacturer heading", async ({ page }) => {
    await page.goto("/grease-traps");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Grease Traps");
    await expect(page.getByRole("link", { name: /upload drawings/i }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Built to your specification." })).toBeVisible();
  });

  test("contact page loads", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.locator("#contact")).toBeVisible();
    await expect(page.getByRole("button", { name: /submit request/i })).toBeVisible();
  });
});
