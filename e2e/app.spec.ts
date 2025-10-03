import { expect, test } from "@playwright/test";
import { ConvexTestingHelper } from "convex-helpers/testing";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { api } from "../convex/_generated/api";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

test.describe("Full Stack", () => {
  let convex: ConvexTestingHelper;
  const testEmail = "e2e+clerk_test@example.com";
  const testUserName = "E2E";

  test.beforeAll(async () => {
    convex = new ConvexTestingHelper({
      backendUrl: process.env.VITE_CONVEX_URL!
    });
  });

  test.afterAll(async () => {
    await convex.mutation(api.testingFunctions.deleteTestUser, { name: testUserName });
    await convex.close();
  });

  test("authentication and data flow", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Sign in", exact: true }).click();

    await page.getByRole("textbox", { name: "Email address" }).fill(testEmail);
    await page.getByRole("button", { name: "Continue" }).click();

    await page.getByRole("textbox", { name: "Enter verification code" }).pressSequentially("424242");

    await page.waitForSelector('button[aria-label="Open user button"]');

    await page.getByRole("button", { name: "Open user button" }).click();
    await page.getByRole("menuitem", { name: "Sign out" }).click();

    await page.waitForSelector('button:has-text("Sign in")');
  });
});