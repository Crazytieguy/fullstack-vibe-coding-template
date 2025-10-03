# Initialize New Application

Help a user initialize their new application using this template.

## Step 1: Requirements Gathering

- Ask what they want to build - get a clear description of their app idea
- Ask 0-1 clarifying questions to understand:
  - Core functionality needed
  - Target users (if not obvious)
  - Key user flows
- Update project name in package.json, remove the Claude note at the bottom of README.md, and commit.

## Step 2: Implementation

- Plan the MVP implementation
- Lanuch the app with `pnpm dev`
- Set the required environment variables: `pnpm convex env set CLERK_JWT_ISSUER_DOMAIN https://workable-dog-93.clerk.accounts.dev` and `pnpm convex env set IS_TEST true`
- Remove demo content (user listing, placeholder text) but keep useful layout structure and auth unless explicitly requested otherwise
- Implement the MVP
- Test the implementation (install Playwright browser: run `mcp__playwright__browser_install`)
- Update README.md with the new app name, description, codebase structure. Be concise.
- commit

## Notes

- Adapt workflow based on user needs
