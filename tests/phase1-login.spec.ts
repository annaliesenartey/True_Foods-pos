import { test, expect } from "@playwright/test";

/**
 * Phase 1 — Login screen smoke tests
 * These run against a real dev server with Supabase connected.
 * Until Supabase is configured (see TODO.md), the redirect-to-login
 * and form validation tests will still pass.
 */

test.describe("Login page", () => {
  test("renders login form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByTestId("login-form")).toBeVisible();
    await expect(page.getByTestId("email-input")).toBeVisible();
    await expect(page.getByTestId("password-input")).toBeVisible();
    await expect(page.getByTestId("login-button")).toBeVisible();
  });

  test("shows validation errors for empty submit", async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("login-button").click();
    await expect(page.getByText("Enter a valid email address")).toBeVisible();
  });

  test("shows validation error for short password", async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("email-input").fill("test@example.com");
    await page.getByTestId("password-input").fill("123");
    await page.getByTestId("login-button").click();
    await expect(page.getByText("Password must be at least 6 characters")).toBeVisible();
  });

  test("unauthenticated user is redirected to login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
  });

  test("toggle password visibility", async ({ page }) => {
    await page.goto("/login");
    const input = page.getByTestId("password-input");
    await expect(input).toHaveAttribute("type", "password");
    await page.locator("button[aria-label*='assword'], button[tabindex='-1']").first().click();
    await expect(input).toHaveAttribute("type", "text");
  });
});
