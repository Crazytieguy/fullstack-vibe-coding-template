# Initialize New Application

Help a user initialize their new application using this template. Track progress using TodoWrite and @claude-notes.md throughout.

## Step 1: Requirements Gathering

- Create todos for the initialization process
- Start @claude-notes.md with current step (including instruction to reread this file if starting from a fresh session)
- Ask what they want to build - get a clear description of their app idea
- Ask 0-1 clarifying questions to understand:
  - Core functionality needed
  - Target users (if not obvious)
  - Key user flows
- Document responses, update project name in package.json, delete the first line of CLAUDE.md to remove the template instructions, and commit.

## Step 2: Implementation

- Plan the MVP implementation
- Remove demo content (user listing, placeholder text) but keep useful layout structure and auth unless explicitly requested otherwise
- Implement the MVP
- Test the implementation (install Playwright browser: run `mcp__playwright__browser_install`)
- Update notes and commit

## Notes

- Adapt workflow based on user needs
- Note in @claude-notes.md which step to continue from in future sessions
