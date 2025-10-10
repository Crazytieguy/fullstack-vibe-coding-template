# E2E Testing Guide

## Overview

The OpenConference project includes comprehensive end-to-end tests using Playwright and Convex. These tests verify full user flows from authentication to conference management.

## Prerequisites

1. **Convex Deployment**: You need a Convex deployment (dev or prod)
2. **Clerk Authentication**: Clerk must be configured with Convex
3. **Environment Variables**: Create `.env.local` with:
   ```bash
   VITE_CONVEX_URL=https://your-deployment.convex.cloud
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_JWT_ISSUER_DOMAIN=your-domain.clerk.accounts.dev
   ```

## Running Tests Locally

### First Time Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Start the development server** (in a separate terminal):
   ```bash
   pnpm dev
   ```

   This will:
   - Prompt you to log in to Convex (first time only)
   - Start the Convex backend
   - Start the Vite frontend on `http://localhost:5173`

3. **Run the tests** (in another terminal):
   ```bash
   pnpm test:e2e
   ```

### Subsequent Runs

Once you've authenticated with Convex (creates `.convex/` directory), you can run:

```bash
pnpm test:e2e
```

The test runner will automatically start the dev server if it's not already running.

## Test Structure

### Test Suites

1. **app.spec.ts** - Basic authentication flow
2. **openconference.spec.ts** - OpenConference user flows:
   - Conference creation and management
   - Meeting scheduling (public/private)
   - Attendee discovery and invitations
   - Calendar navigation
   - RSVP flows

### Test Account

Tests use a Clerk test account:
- Email: `claude+clerk_test@example.com`
- Verification code: `424242` (auto-filled in test mode)

## CI/CD Testing

### Challenge

E2E tests require a Convex backend, but `pnpm dev` needs interactive authentication which doesn't work in CI environments like GitHub Actions.

### Solutions

#### Option 1: GitHub Secrets (Recommended)

Add these secrets to your GitHub repository:

```yaml
VITE_CONVEX_URL: https://your-deployment.convex.cloud
VITE_CLERK_PUBLISHABLE_KEY: pk_test_...
CLERK_JWT_ISSUER_DOMAIN: your-domain.clerk.accounts.dev
```

Then update `.github/workflows/claude.yml` to pass them as environment variables.

#### Option 2: Convex Deploy Key

Use Convex deploy keys for non-interactive deployment:

1. Generate a deploy key in Convex dashboard
2. Add as `CONVEX_DEPLOY_KEY` secret
3. Modify playwright.config.ts to use deployed URL

#### Option 3: Separate Test Workflow

Create a dedicated test workflow that runs on `push` with access to secrets:

```yaml
name: E2E Tests
on: push
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install
      - run: pnpm test:e2e
        env:
          VITE_CONVEX_URL: ${{ secrets.VITE_CONVEX_URL }}
          VITE_CLERK_PUBLISHABLE_KEY: ${{ secrets.VITE_CLERK_PUBLISHABLE_KEY }}
          CLERK_JWT_ISSUER_DOMAIN: ${{ secrets.CLERK_JWT_ISSUER_DOMAIN }}
```

## Debugging Tests

### View Playwright Report

```bash
pnpm exec playwright show-report
```

### Run in Headed Mode

```bash
pnpm exec playwright test --headed
```

### Run Single Test

```bash
pnpm exec playwright test -g "Conference Creation Flow"
```

### Debug Mode

```bash
pnpm exec playwright test --debug
```

## Test Data Cleanup

Tests automatically clean up after themselves using the `testingFunctions.deleteTestUser` mutation. If you need to manually clean up:

```bash
pnpx convex run testingFunctions:deleteTestUser '{"name": "Claude Test"}'
```

## Common Issues

### "Cannot prompt for input in non-interactive terminals"

This means Convex needs authentication. Run `pnpm dev` manually first.

### Tests failing with "Element not found"

1. Check that the dev server is running
2. Verify Clerk test mode is enabled
3. Check browser console for errors: `pnpm exec playwright test --headed`

### Flaky tests due to timing

Increase timeout in specific tests or use `page.waitForLoadState()`:

```typescript
await page.waitForLoadState('networkidle');
```

## Best Practices

1. **Keep tests independent**: Each test should work in isolation
2. **Use data-testid for complex selectors**: Avoid brittle CSS selectors
3. **Clean up test data**: Always use afterAll/afterEach hooks
4. **Test user flows, not implementation**: Focus on what users do
5. **Mock external services when possible**: Use Convex testing helpers

## Adding New Tests

1. Add test to `e2e/openconference.spec.ts`
2. Use the existing `signIn()` helper
3. Follow existing patterns for navigation and assertions
4. Run locally to verify
5. Ensure cleanup happens in afterAll

Example:

```typescript
test("My New Flow", async ({ page }) => {
  await signIn(page);

  // Your test code here

  // Verify outcome
  await expect(page.getByText("Success")).toBeVisible();
});
```
