import { expect, test } from "@playwright/test";
import { ConvexTestingHelper } from "convex-helpers/testing";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { api } from "../convex/_generated/api";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

test.describe("OpenConference User Flows", () => {
  let convex: ConvexTestingHelper;
  const testEmail = "claude+clerk_test@example.com";
  const testUserName = "Claude Test";

  test.beforeAll(async () => {
    convex = new ConvexTestingHelper({
      backendUrl: process.env.VITE_CONVEX_URL!,
    });
  });

  test.afterAll(async () => {
    // Clean up test data
    await convex.mutation(api.testingFunctions.deleteTestUser, {
      name: testUserName,
    });
    await convex.close();
  });

  async function signIn(page: any) {
    await page.goto("/");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await page
      .getByRole("textbox", { name: "Email address" })
      .fill(testEmail, { slowly: true });
    await page.getByRole("button", { name: "Continue" }).click();
    await page
      .getByRole("textbox", { name: "Enter verification code" })
      .pressSequentially("424242");
    await page.waitForSelector('button[aria-label="Open user button"]');
  }

  test("Conference Creation Flow", async ({ page }) => {
    await signIn(page);

    // Navigate to create conference page
    await page.getByRole("link", { name: "Create Conference" }).first().click();

    // Fill conference form
    await page.getByLabel("Conference Name").fill("Tech Summit 2025");
    await page
      .getByLabel("Description (optional)")
      .fill("A conference about emerging technologies");

    // Set dates (3 days from now)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 3);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 2);

    const formatDate = (date: Date) => date.toISOString().split("T")[0];
    await page.getByLabel("Start Date").fill(formatDate(startDate));
    await page.getByLabel("End Date").fill(formatDate(endDate));

    // Submit form
    await page.getByRole("button", { name: "Create Conference" }).click();

    // Verify navigation to conference detail page
    await expect(page.getByRole("heading", { name: "Tech Summit 2025" })).toBeVisible();
    await expect(page.getByText("A conference about emerging technologies")).toBeVisible();
  });

  test("Conference Join and Attendee Browsing Flow", async ({ page }) => {
    await signIn(page);

    // Go to conferences list
    await page.goto("/");

    // Find and click on a conference
    const conferenceCard = page.locator(".card").first();
    await conferenceCard.click();

    // Check if we need to join
    const joinButton = page.getByRole("button", { name: "Join Conference" });
    if (await joinButton.isVisible()) {
      await joinButton.click();
      await page.waitForTimeout(500); // Wait for join to complete
    }

    // Navigate to attendees tab
    await page.getByRole("tab", { name: "Attendees" }).click();

    // Verify attendees are displayed
    await expect(page.locator(".card").first()).toBeVisible();
  });

  test("Meeting Creation Flow", async ({ page }) => {
    await signIn(page);

    // Navigate to a conference
    await page.goto("/");
    const conferenceCard = page.locator(".card").first();
    await conferenceCard.click();

    // Ensure we're a member
    const joinButton = page.getByRole("button", { name: "Join Conference" });
    if (await joinButton.isVisible()) {
      await joinButton.click();
      await page.waitForTimeout(500);
    }

    // Click create meeting
    await page.getByRole("link", { name: "New Meeting" }).click();

    // Fill meeting form
    await page.getByLabel("Meeting Title").fill("Coffee Chat");
    await page
      .getByLabel("Description (optional)")
      .fill("Casual networking session");

    // Set meeting time (tomorrow at 10 AM)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formatDate = (date: Date) => date.toISOString().split("T")[0];
    await page.getByLabel("Date").fill(formatDate(tomorrow));
    await page.getByLabel("Start Time").fill("10:00");
    await page.getByLabel("Duration (minutes)").fill("60");

    // Make it public
    await page.getByLabel("Public Meeting").check();

    // Submit
    await page.getByRole("button", { name: "Create Meeting" }).click();

    // Verify meeting details page
    await expect(page.getByRole("heading", { name: "Coffee Chat" })).toBeVisible();
    await expect(page.getByText("Casual networking session")).toBeVisible();
    await expect(page.getByText("Public")).toBeVisible();
  });

  test("Meeting Invitation Flow", async ({ page }) => {
    await signIn(page);

    // Navigate to a conference
    await page.goto("/");
    const conferenceCard = page.locator(".card").first();
    await conferenceCard.click();

    // Ensure we're a member
    const joinButton = page.getByRole("button", { name: "Join Conference" });
    if (await joinButton.isVisible()) {
      await joinButton.click();
      await page.waitForTimeout(500);
    }

    // Go to attendees tab
    await page.getByRole("tab", { name: "Attendees" }).click();

    // Click invite on first attendee
    const inviteButton = page.getByRole("link", { name: "Invite to Meeting" }).first();
    if (await inviteButton.isVisible()) {
      await inviteButton.click();

      // Verify we're on the create meeting page
      await expect(page.getByRole("heading", { name: "Create New Meeting" })).toBeVisible();
    }
  });

  test("My Meetings Tab Flow", async ({ page }) => {
    await signIn(page);

    // Navigate to a conference
    await page.goto("/");
    const conferenceCard = page.locator(".card").first();
    await conferenceCard.click();

    // Ensure we're a member
    const joinButton = page.getByRole("button", { name: "Join Conference" });
    if (await joinButton.isVisible()) {
      await joinButton.click();
      await page.waitForTimeout(500);
    }

    // Navigate to My Meetings tab
    await page.getByRole("tab", { name: "My Meetings" }).click();

    // Should see either meetings or empty state
    const emptyState = page.getByText("You don't have any meetings yet");
    const meetingCard = page.locator(".card").first();

    // One of them should be visible
    await expect(
      emptyState.or(meetingCard)
    ).toBeVisible();
  });

  test("Public Meetings Tab Flow", async ({ page }) => {
    await signIn(page);

    // Navigate to a conference
    await page.goto("/");
    const conferenceCard = page.locator(".card").first();
    await conferenceCard.click();

    // Ensure we're a member
    const joinButton = page.getByRole("button", { name: "Join Conference" });
    if (await joinButton.isVisible()) {
      await joinButton.click();
      await page.waitForTimeout(500);
    }

    // Navigate to Public Meetings tab
    await page.getByRole("tab", { name: "Public Meetings" }).click();

    // Should see either meetings or empty state
    const emptyState = page.getByText("No public meetings yet");
    const meetingCard = page.locator(".card").first();

    await expect(
      emptyState.or(meetingCard)
    ).toBeVisible();
  });

  test("Calendar View Flow", async ({ page }) => {
    await signIn(page);

    // Navigate to a conference
    await page.goto("/");
    const conferenceCard = page.locator(".card").first();
    await conferenceCard.click();

    // Ensure we're a member
    const joinButton = page.getByRole("button", { name: "Join Conference" });
    if (await joinButton.isVisible()) {
      await joinButton.click();
      await page.waitForTimeout(500);
    }

    // Navigate to Calendar tab
    await page.getByRole("tab", { name: "Calendar" }).click();

    // Verify calendar components are visible
    await expect(page.getByRole("button", { name: "Today" })).toBeVisible();

    // Test navigation
    const nextButton = page.locator("button").filter({ hasText: "›" }).or(
      page.getByRole("button").filter({ has: page.locator('svg') }).nth(1)
    );

    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(200);
    }
  });

  test("Join Public Meeting Flow", async ({ page }) => {
    await signIn(page);

    // Navigate to a conference
    await page.goto("/");
    const conferenceCard = page.locator(".card").first();
    await conferenceCard.click();

    // Ensure we're a member
    const joinButton = page.getByRole("button", { name: "Join Conference" });
    if (await joinButton.isVisible()) {
      await joinButton.click();
      await page.waitForTimeout(500);
    }

    // Navigate to Public Meetings tab
    await page.getByRole("tab", { name: "Public Meetings" }).click();

    // If there's a public meeting, try to join it
    const viewButton = page.getByRole("link", { name: "View" }).first();
    if (await viewButton.isVisible()) {
      await viewButton.click();

      // Check if we can join
      const joinMeetingButton = page.getByRole("button", { name: "Join Meeting" });
      if (await joinMeetingButton.isVisible()) {
        await joinMeetingButton.click();
        await page.waitForTimeout(500);

        // Verify we're now part of the meeting
        await expect(page.getByText("Accepted").or(page.getByText("Owner"))).toBeVisible();
      }
    }
  });

  test("Leave Conference Flow", async ({ page }) => {
    await signIn(page);

    // Navigate to a conference
    await page.goto("/");
    const conferenceCard = page.locator(".card").first();
    await conferenceCard.click();

    // Ensure we're a member first
    const joinButton = page.getByRole("button", { name: "Join Conference" });
    if (await joinButton.isVisible()) {
      await joinButton.click();
      await page.waitForTimeout(500);
    }

    // Now leave
    const leaveButton = page.getByRole("button", { name: "Leave" });
    if (await leaveButton.isVisible()) {
      await leaveButton.click();
      await page.waitForTimeout(500);

      // Verify we see "Join to see more" message
      await expect(page.getByText("Join to see more")).toBeVisible();
    }
  });

  test("End-to-End Conference Lifecycle", async ({ page }) => {
    await signIn(page);

    // 1. Create a conference
    await page.getByRole("link", { name: "Create Conference" }).first().click();
    await page.getByLabel("Conference Name").fill("Full E2E Test Conference");
    await page.getByLabel("Description (optional)").fill("Testing the full lifecycle");

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 2);

    const formatDate = (date: Date) => date.toISOString().split("T")[0];
    await page.getByLabel("Start Date").fill(formatDate(startDate));
    await page.getByLabel("End Date").fill(formatDate(endDate));
    await page.getByRole("button", { name: "Create Conference" }).click();

    // 2. Create a public meeting
    await page.getByRole("link", { name: "New Meeting" }).click();
    await page.getByLabel("Meeting Title").fill("Keynote Session");
    await page.getByLabel("Date").fill(formatDate(startDate));
    await page.getByLabel("Start Time").fill("09:00");
    await page.getByLabel("Duration (minutes)").fill("90");
    await page.getByLabel("Public Meeting").check();
    await page.getByRole("button", { name: "Create Meeting" }).click();

    // 3. Verify meeting appears in My Meetings
    await page.getByRole("button", { name: "Back to Conference" }).click();
    await page.getByRole("tab", { name: "My Meetings" }).click();
    await expect(page.getByText("Keynote Session")).toBeVisible();
    await expect(page.getByText("Owner")).toBeVisible();

    // 4. Check it appears in Public Meetings
    await page.getByRole("tab", { name: "Public Meetings" }).click();
    await expect(page.getByText("Keynote Session")).toBeVisible();

    // 5. Verify it appears in Calendar
    await page.getByRole("tab", { name: "Calendar" }).click();
    await expect(page.getByText("Keynote Session")).toBeVisible();
  });
});
