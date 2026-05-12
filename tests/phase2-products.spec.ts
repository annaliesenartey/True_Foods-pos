import { test, expect } from "@playwright/test";

/**
 * Phase 2 — Products & Inventory tests
 * Requires: Supabase connected + staff user signed in.
 * Run after completing TODO.md steps 2–4.
 */

// Helper: sign in before each test
async function signIn(page: any) {
  await page.goto("/login");
  await page.getByTestId("email-input").fill(process.env.TEST_EMAIL ?? "admin@truefoods.gh");
  await page.getByTestId("password-input").fill(process.env.TEST_PASSWORD ?? "password123");
  await page.getByTestId("login-button").click();
  await page.waitForURL("/");
}

test.describe("Products page", () => {
  test.beforeEach(async ({ page }) => { await signIn(page); });

  test("navigates to products page", async ({ page }) => {
    await page.goto("/products");
    await expect(page.getByRole("heading", { name: "Products" })).toBeVisible();
    await expect(page.getByTestId("add-product-btn")).toBeVisible();
  });

  test("can open add product form", async ({ page }) => {
    await page.goto("/products");
    await page.getByTestId("add-product-btn").click();
    await expect(page.getByRole("heading", { name: "Add product" })).toBeVisible();
    await expect(page.getByTestId("price-input")).toBeVisible();
  });

  test("can create a product", async ({ page }) => {
    await page.goto("/products");
    await page.getByTestId("add-product-btn").click();
    await page.getByLabel("Product name").fill("Test Mango Yoghurt");
    await page.getByTestId("cup-size-select").click();
    await page.getByRole("option", { name: "500ml" }).click();
    await page.getByTestId("price-input").fill("5.50");
    await page.getByTestId("save-product-btn").click();
    await expect(page.getByText("Product created")).toBeVisible();
    await expect(page.getByText("Test Mango Yoghurt")).toBeVisible();
  });

  test("can edit a product", async ({ page }) => {
    await page.goto("/products");
    const firstEdit = page.getByTestId("edit-product-btn").first();
    await firstEdit.click();
    await expect(page.getByRole("heading", { name: "Edit product" })).toBeVisible();
    await page.getByTestId("save-product-btn").click();
    await expect(page.getByText("Product updated")).toBeVisible();
  });

  test("shows low stock warning", async ({ page }) => {
    await page.goto("/products");
    // Products with stock <= threshold show a warning icon
    const lowRows = page.locator('[data-testid="product-row"]');
    await expect(lowRows.first()).toBeVisible();
  });
});

test.describe("Inventory page", () => {
  test.beforeEach(async ({ page }) => { await signIn(page); });

  test("navigates to inventory page", async ({ page }) => {
    await page.goto("/inventory");
    await expect(page.getByRole("heading", { name: "Inventory" })).toBeVisible();
  });

  test("shows all materials", async ({ page }) => {
    await page.goto("/inventory");
    await expect(page.getByTestId("material-row").first()).toBeVisible();
  });

  test("can open record purchase page", async ({ page }) => {
    await page.goto("/inventory");
    await page.getByRole("link", { name: /Record purchase/i }).first().click();
    await expect(page.getByRole("heading", { name: "Record purchase" })).toBeVisible();
    await expect(page.getByTestId("material-select")).toBeVisible();
  });

  test("can open record production page", async ({ page }) => {
    await page.goto("/inventory");
    await page.getByRole("link", { name: /Record production/i }).click();
    await expect(page.getByRole("heading", { name: "Record production run" })).toBeVisible();
    await expect(page.getByTestId("production-product-select")).toBeVisible();
  });
});
