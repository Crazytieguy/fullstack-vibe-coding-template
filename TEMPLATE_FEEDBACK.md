# Code Bloom Template Evaluation Feedback

This document contains feedback from building OpenConference, a full-featured conferencing platform, using the Code Bloom template.

## Summary

**Overall Experience**: Excellent ⭐⭐⭐⭐⭐

The template provided a solid foundation for building a complex application quickly. The stack choices (React 19, Convex, TanStack Router, Clerk) work very well together, and the dev experience is smooth once properly set up.

## What Worked Well

### 1. **Tech Stack Integration**
- Convex + Clerk integration worked seamlessly
- TanStack Router's file-based routing is intuitive
- TanStack Form + Zod v4 validation works great
- daisyUI 5 components are clean and easy to use

### 2. **CLAUDE.md Guidelines**
- Clear, comprehensive instructions for AI assistants
- Good examples of import patterns and best practices
- Helpful warnings about common pitfalls (e.g., filter vs withIndex)

### 3. **Type Safety**
- Full TypeScript coverage is excellent
- Convex's generated types (`Id<"table">`) are very helpful
- TanStack Router type generation is powerful

### 4. **Project Structure**
- Clean separation of concerns
- Easy to understand file organization
- Good starting point for expansion

## What Could Be Improved

### 1. **CI/Non-Interactive Development**

**Issue**: The template doesn't work well in CI or non-interactive environments because:
- `pnpm dev` requires interactive Convex login
- Can't test the full app without Convex setup
- TanStack Router codegen doesn't run without the dev server

**Suggestion**: Add to template:
- `dev:noninteractive` script or environment variable support
- Mock Convex provider for testing
- Standalone codegen script that doesn't need the server running

**Code to add**:
```json
// package.json
{
  "scripts": {
    "codegen": "tsr generate && tsr watch",
    "dev:ci": "CONVEX_SKIP_AUTH=1 pnpm dev" // if Convex supports this
  }
}
```

### 2. **Missing Helper Utilities**

**Issue**: Common patterns had to be re-implemented:
- Date formatting utilities
- Form error display patterns
- Loading states handling

**Suggestion**: Add to `src/lib/` directory:
```tsx
// src/lib/date.ts
export const formatDate = (date: Date) => date.toLocaleDateString();
export const formatDateTime = (date: Date) => date.toLocaleString();

// src/lib/form.ts
export const FormError = ({ errors }: { errors: Array<{ message: string }> }) => (
  <label className="label">
    <span className="label-text-alt text-error">
      {errors.map(e => e.message).join(", ")}
    </span>
  </label>
);
```

### 3. **E2E Test Utilities**

**Issue**: Had to create auth helpers for each test file

**Suggestion**: Add shared test utilities:
```tsx
// e2e/helpers/auth.ts
export async function signIn(page, email = "claude+clerk_test@example.com") {
  await page.goto("/");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.getByRole("textbox", { name: "Email address" }).fill(email);
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("textbox", { name: "Enter verification code" })
    .pressSequentially("424242");
  await page.waitForSelector('button[aria-label="Open user button"]');
}
```

### 4. **Component Examples**

**Issue**: Template only has basic examples (user list)

**Suggestion**: Add more complex component examples:
- Form with validation
- Data table with sorting/filtering
- Modal/dialog pattern
- Tab navigation pattern
- Calendar/date picker example

### 5. **Database Patterns**

**Issue**: No guidance on common Convex patterns

**Suggestion**: Add to CLAUDE.md:
- Pagination examples
- Search implementation
- Aggregation patterns
- Relationship handling (join patterns)

**Example to add**:
```tsx
// Example: Fetching related data efficiently
export const getConferenceWithAttendees = query({
  args: { conferenceId: v.id("conferences") },
  handler: async (ctx, args) => {
    const conference = await ctx.db.get(args.conferenceId);
    if (!conference) return null;

    // Fetch all attendees in parallel
    const attendees = await ctx.db
      .query("conferenceAttendees")
      .withIndex("by_conference", q => q.eq("conferenceId", args.conferenceId))
      .collect();

    const users = await Promise.all(
      attendees.map(a => ctx.db.get(a.userId))
    );

    return { ...conference, attendees: users };
  },
});
```

### 6. **Error Handling Patterns**

**Issue**: No standard error handling or toast notifications

**Suggestion**: Add error boundary and toast system:
```tsx
// src/components/ErrorBoundary.tsx
// src/lib/toast.ts (using something like react-hot-toast)
```

### 7. **Loading States**

**Issue**: No standard loading component or pattern

**Suggestion**: Add loading components:
```tsx
// src/components/Loading.tsx
export const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-8">
    <span className="loading loading-spinner loading-lg"></span>
  </div>
);

export const LoadingCard = () => (
  <div className="card bg-base-200">
    <div className="card-body">
      <LoadingSpinner />
    </div>
  </div>
);
```

### 8. **Documentation**

**Issue**: No examples of complex workflows

**Suggestion**: Add to docs:
- How to handle file uploads
- How to implement real-time features
- How to add cron jobs
- How to implement search
- How to handle permissions

## What's Missing from the Template

### 1. **Environment Variables Validation**
Use zod to validate env vars at startup:
```tsx
// src/lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  VITE_CLERK_PUBLISHABLE_KEY: z.string(),
  VITE_CONVEX_URL: z.string().url(),
});

export const env = envSchema.parse(import.meta.env);
```

### 2. **SEO/Meta Tags**
Add helmet or similar for meta tags management

### 3. **Error Tracking**
Sentry integration example

### 4. **Analytics**
Basic analytics setup (PostHog, Plausible, etc.)

### 5. **Feature Flags**
Simple feature flag system

### 6. **API Client Pattern**
Pattern for calling external APIs from actions

## Specific Issues Encountered

### 1. **TanStack Form + Zod v4 Type Mismatch**

**Issue**: Optional fields in Zod schemas cause type errors with TanStack Form
```tsx
// This causes type errors:
const schema = z.object({
  description: z.string().optional(),
});
```

**Workaround**: Handle in form default values
```tsx
const form = useForm({
  defaultValues: { description: "" },
  // ...
});
```

**Suggestion**: Document this pattern or provide a form wrapper helper

### 2. **DaisyUI v4 → v5 Migration**

**Finding**: CLAUDE.md documents daisyUI v5 changes well
**Note**: The migration guide in CLAUDE.md was very helpful

### 3. **Convex Query Patterns**

**Learning**: Always use indexes, never filter without them
**Note**: CLAUDE.md warns about this, which was helpful

## Commits Added to Template (Suggestions)

During development, I identified several patterns that could be added permanently:

### Commit 1: Add Pure Component Example
**File**: `src/components/Calendar.tsx`
**Why**: Shows how to build reusable, testable, pure components
**Benefits**:
- No coupling to Convex
- Easy to test
- Reusable across projects

### Commit 2: Add Form Helpers
**Files**:
- `src/lib/form.ts`
- `src/lib/date.ts`

### Commit 3: Add E2E Test Helpers
**File**: `e2e/helpers/auth.ts`

### Commit 4: Add Loading Components
**File**: `src/components/Loading.tsx`

## Recommendations

### For the Template

1. **Add a `src/lib/` directory** with common utilities
2. **Add more component examples** beyond the basic user list
3. **Improve CI/CD support** for non-interactive environments
4. **Add test helpers** in `e2e/helpers/`
5. **Document common patterns** in CLAUDE.md

### For AI Assistants Using the Template

1. Start by reading CLAUDE.md thoroughly
2. Run `pnpm dev` early to check for setup issues
3. Use indexes for all Convex queries
4. Follow the pure component pattern (like Calendar.tsx)
5. Write e2e tests for critical user flows

## Conclusion

The Code Bloom template is excellent for rapid full-stack development. With the suggested improvements (mostly adding examples and utilities), it would be even more powerful. The core stack choices are solid and work well together.

**Would I use this template again?** Absolutely! ✅

**Estimated time saved:** Building OpenConference from scratch would take ~3-4 days. With this template: ~6-8 hours (including learning curve).

**Best for:** MVPs, hackathons, internal tools, SaaS products

---

Generated while building OpenConference
Evaluator: Claude (Anthropic)
Date: 2025-10-10
