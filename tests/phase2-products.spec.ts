import { test, expect } from "@playwright/test";

/**
 * Phase 2 — Products & Inventory tests
 * Uses dedicated test account: anna@truefoods.com
 */

const TEST_EMAIL = process.env.TEST_EMAIL ?? "anna@truefoods.com";
const TEST_PASSWORD = process.env.TEST_PASSWORD ?? "test12345";

async function signIn(page: any) {
  await page.goto("/login");
  await page.getByTestId("email-input").fill(TEST_EMAIL);
  await page.getByTestId("password-input").fill(TEST_PASSWORD);
  await page.getByTestId("login-button").click();
  // Wait for redirect away from login
  await page.waitForURL((url: URL) => !url.pathname.includes("/login"), { timeout: 15000 });
}

test.describe("Products page", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test("navigates to products page", async ({ page }) => {
    await page.goto("/products");
    await expect(page.getByRole("heading", { name: "Products" })).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId("add-product-btn")).toBeVisible();
  });

  test("can open add product form", async ({ page }) => {
    await page.goto("/products");
    await page.getByTestId("add-product-btn").click();
    await expect(page.getByRole("heading", { name: "Add product" })).toBeVisible({ timeout: 10000 });
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
    await expect(page.getByText("Product created")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Test Mango Yoghurt")).toBeVisible();
  });

  test("can edit a product", async ({ page }) => {
    await page.goto("/products");
    await expect(page.getByTestId("edit-product-btn").first()).toBeVisible({ timeout: 15000 });
    await page.getByTestId("edit-product-btn").first().click();
    await expect(page.getByRole("heading", { name: "Edit product" })).toBeVisible({ timeout: 10000 });
    await page.getByTestId("save-product-btn").click();
    await expect(page.getByText("Product updated")).toBeVisible({ timeout: 10000 });
  });

  test("shows product rows in table", async ({ page }) => {
    await page.goto("/products");
    await expect(page.getByRole("heading", { name: "Products" })).toBeVisible({ timeout: 15000 });
    // Table should be present
    await expect(page.locator("table")).toBeVisible();
  });
});

test.describe("Inventory page", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test("navigates to inventory page", async ({ page }) => {
    await page.goto("/inventory");
    await expect(page.getByRole("heading", { name: "Inventory" })).toBeVisible({ timeout: 15000 });
  });

  test("shows all materials table", async ({ page }) => {
    await page.goto("/inventory");
    await expect(page.getByRole("heading", { name: "Inventory" })).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId("material-row").first()).toBeVisible({ timeout: 10000 });
  });

  test("can open record purchase page", async ({ page }) => {
    await page.goto("/inventory");
    await expect(page.getByRole("heading", { name: "Inventory" })).toBeVisible({ timeout: 15000 });
    await page.getByRole("link", { name: /Record purchase/i }).first().click();
    await expect(page.getByRole("heading", { name: "Record purchase" })).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId("material-select")).toBeVisible();
  });

  test("can open record production page", async ({ page }) => {
    await page.goto("/inventory/production/new");
    await expect(page.getByRole("heading", { name: "Record production run" })).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId("production-product-select")).toBeVisible();
  });
});
