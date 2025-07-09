- This is a template repository, and initializing a new application from it should be done by using the `init-app` custom command. If the user asks for anything else, instruct them to use that command. After the command is run, delete this line.
- Always follow the guidelines in this file, unless explicitly told otherwise by the user or overided in the CLAUDE.local.md file.

## Project Overview

- Full-stack TypeScript app: React + Vite + TanStack Router (frontend), Convex (backend), Clerk (auth)
- Development: Use `tmux new-session -d -s "$(jq -r .name package.json)-dev" 'pnpm dev'` to start servers in background session. Monitor outputs with `tmux capture-pane -t <session-name> -p` for validation
- Import alias: `@/` maps to `src/` directory
- Tailwind CSS 4, daisyUI 5: All config in `src/index.css` via CSS syntax, NOT tailwind.config.js
- Typography: Uses `@tailwindcss/typography` with `prose prose-invert` at root level, use `not-prose` to escape (e.g., for buttons/tables)
- Environment variables: Client vars need `VITE_` prefix, Convex vars set in dashboard
- Package manager: Always use `pnpm` and `pnpx`, NOT `npm` or `npx`

## Git Workflow

- **Commit after each user request**: When completing what the user asked for, immediately commit: `git add -A && git commit -m "[action]: [what was accomplished]"`
- Commits should happen WITHOUT asking - they're for checkpoints, not cleanliness (will be squashed later)
- Commits are restore points - if user says something like "let's go back to before X" or "Lets undo that", find the appropriate commit and run `git reset --hard [commit-hash]` to restore the state. Always verify the commit hash via `git log` or `git reflog` first.
- If you've reset to a previous commit and need to go forward again, use `git reflog` to see all recent commits (including those "lost" by reset), then `git reset --hard [commit-hash]` to jump forward to any commit shown in the reflog.
- When feature complete and user approves or asks to push perform a squash: run `pnpm run lint` first, then find the first commit for the session/feature, then `git reset --soft [starting-commit]` then commit with `"feat: [complete feature description]"`
- Before major feature work: Tell user "Starting [feature], will make frequent commits as checkpoints then squash when complete"

## Testing & Validation

- Always follow these steps before squashing or pushing
- Check tmux session output for TypeScript/compilation errors from both Vite and Convex using `tmux capture-pane -t "$(jq -r .name package.json)-dev" -p`
- Test UI with Playwright MCP: full browser automation with element interaction and console access
  - The playwright mcp server is unreliable, if it doesn't work ask the user to test manually
- Responsive testing: Use `mcp__playwright__browser_resize` to test mobile (375x667), tablet (768x1024), desktop (1200x800)
- Clerk verification: sign in with `claude+clerk_test@example.com` and 424242 as the verification code. Type all 6 digits at once in first field with slowly: true - UI auto-distributes to separate inputs
- Debug with `mcp__playwright__browser_console_messages` to view all browser console output
- If you run into an issue you don't know how to fix, look for relevant documentation or a reference implementation

## Convex

- `_creationTime` and `_id` are automatically added to all documents.
- Adding required fields breaks existing data - if early in development, ask the user to clear the database. Otherwise, plan migration.
- Use `ConvexError` for client-friendly errors, not generic Error
- Queries have 16MB/10s limits - always use indexes, never full table scans
- Paginated queries: use `.paginate(paginationOpts)` with `paginationOptsValidator`
- Scheduled tasks: `ctx.scheduler.runAfter(delay, internal.module.function, args)` or `ctx.scheduler.runAt(timestamp, ...)`
- Unique fields: enforce in mutation logic, indexes don't guarantee uniqueness
- Soft delete: add `deletedAt: v.optional(v.number())` field instead of `.delete()`
- System tables: access `_scheduled_functions` and `_storage` with `ctx.db.system.get` and `ctx.db.system.query`
- Default query order is ascending by `_creationTime`
- Transactions are per-mutation - can't span multiple mutations. Calling multiple queries/mutation in a single action may introduce race conditions.
- Hot reload issues: Restart if schema changes don't apply or types are stuck
- Use `import { Doc, Id } from "./_generated/dataModel";` and `v.id("table")` for type safety.
- Always add `"use node";` to the top of files containing actions that use Node.js built-in modules.
- Convex + Clerk: Always use Convex's auth hooks (`useConvexAuth`) and components (`<Authenticated>`, `<Unauthenticated>`, `<AuthLoading>`) instead of Clerk's hooks/components. This ensures auth tokens are properly validated by the Convex backend.

### Function guidelines

- Import `query`, `internalQuery`, `mutation`, `internalMutation`, `action`, `internalAction` from `./_generated/server` and call to register functions.
- Use `ctx.runQuery`, `ctx.runMutation`, `ctx.runAction` to call functions from other functions. e.g.: `import { api, internal } from "./_generated/api";` and then `ctx.runQuery(internal.module.function, { arg })`.
- If calling functions causes unexpected type errors, try adding a type annotation (helps circularity): `const result: string = await ctx.runQuery(api.module.function, { arg });`
- Actions can't directly access DB - use `ctx.runQuery` / `ctx.runMutation`

### Validator guidelines

- Always use an args validator for functions
- `v.bigint()` is deprecated for representing signed 64-bit integers. Use `v.int64()` instead.
- Use `v.record()` for defining a record type. `v.map()` and `v.set()` are not supported.

### Query guidelines

- Do NOT use `filter` in queries. Instead, define an index in the schema and use `withIndex` instead.
- Convex queries do NOT support `.delete()`. Instead, `.collect()` the results, iterate over them, and call `ctx.db.delete(row._id)` on each result.
- Use `.unique()` to get a single document from a query. This method will throw an error if there are multiple documents that match the query.
- When using async iteration, don't use `.collect()` or `.take(n)` on the result of a query. Instead, use the `for await (const row of query)` syntax.

### Mutation guidelines

- Use `ctx.db.replace` to fully replace an existing document.
- Use `ctx.db.patch` to shallow merge updates into an existing document.

### File uploads

- generate upload URL in mutation (`ctx.storage.generateUploadUrl()`)
- POST from client
- store ID (take `v.id("_storage")`)
- serve with `ctx.storage.getUrl(fileId)` in queries

### Other Convex Features (refer to docs and install as necessary)

- Text search: docs.convex.dev/search/text-search
- Crons: docs.convex.dev/scheduling/cron-jobs
- Durable long-running code flows with retries and delays: convex.dev/components/workflow
- Organize AI workflows with message history and vector search: convex.dev/components/ai-agent
- Prioritize tasks with separate customizable queues: convex.dev/components/workpool
- Sync engine for ProseMirror-based editors: convex.dev/components/collaborative-text-editor-sync
- Send and receive SMS with queryable status: convex.dev/components/twilio-sms
- Add subscriptions and billing integration: convex.dev/components/polar
- Stream text to browser while storing to database (good for LLM calls): convex.dev/components/persistent-text-streaming
- Type-safe application-layer rate limits with sharding: convex.dev/components/rate-limiter
- Framework for long-running data migrations: convex.dev/components/migrations
- Distributed counter for high-throughput operations: convex.dev/components/sharded-counter
- Cache action results to improve performance: convex.dev/components/action-cache
- Data aggregation and denormalization operations: convex.dev/components/aggregate
- Register and manage cron jobs at runtime: convex.dev/components/crons

## TanStack Router

- Avoid `const search = useSearch()` - use `select` option instead
- Route params update quirks - preserve location when updating
- Search params as filters: validate with zod schema in route definition
- Navigate programmatically: `const navigate = useNavigate()` then `navigate({ to: '/path' })`
- Type-safe links: always use `<Link to="/path">` not `<a href>`
- Nested routes require parent to have `<Outlet />`, use `.index.tsx` files to show content at parent paths

## TanStack Query + Convex Integration

- Use `convexQuery()` from `@convex-dev/react-query` to create query options: `const queryOptions = convexQuery(api.module.function, { status: "active" })`
- Preload in route loaders: `loader: async ({ context: { queryClient } }) => await queryClient.ensureQueryData(queryOptions)`
- Use `useSuspenseQuery` in components: `const { data } = useSuspenseQuery(queryOptions)`
- For mutations, continue using Convex's `useMutation` directly

## TanStack Form

- Field validation can override form validation - design hierarchy carefully
- Submit handler: `onSubmit: async ({ value }) => { await mutate(value); form.reset(); }`
- Field errors: `{field.state.meta.errors && <span>{field.state.meta.errors}</span>}`
- Disable during submit: `<button disabled={!form.state.canSubmit || form.state.isSubmitting}>`
- Async validation: use `onChangeAsync` for server-side checks

## Styling with DaisyUI

### Class Organization

- `component`: Main class (btn), `part`: Child elements (card-title), `style`: Visual variants (btn-outline)
- `behavior`: State (btn-active), `color`: Colors (btn-primary), `size`: Sizes (btn-lg)
- `placement`: Position (dropdown-top), `direction`: Orientation (menu-horizontal), `modifier`: Special (btn-wide)

### v4 → v5 Breaking Changes

- artboard / phone-\* → (removed) ➔ use Tailwind w-/h- classes
- btm-nav / btm-nav-\*/btm-nav-active → dock / dock-\*/dock-active
- online / offline / placeholder (avatars) → avatar-online / avatar-offline / avatar-placeholder
- card-bordered → card-border
- card-compact → (removed) ➔ use card-sm (or card-xs, etc.)
- .active/.disabled (menus) → menu-active / menu-disabled (add w-full if needed)
- tabs-bordered / tabs-boxed / tabs-lifted → tabs-border / tabs-box / tabs-lift
- btn-group / input-group → join + join-item on each child
- form-control / label-text / label-text-alt → (removed) ➔ use fieldset/legend or new DaisyUI form-group utilities
- input-bordered / select-bordered / file-input-bordered / textarea-border → (removed) ➔ base classes include border; use –ghost variants for no border
- footer (horizontal by default) → add footer-horizontal at desired breakpoint
- .hover on <tr> → (removed) ➔ use Tailwind hover:bg-\* (e.g., hover:bg-base-300)
- mask-parallelogram / mask-parallelogram-2/3/4 → (removed) ➔ implement with custom CSS
- .menu (vertical) no longer w-full by default → add w-full if you need full width

### Key or Unfamiliar Components Reference

- When using a component you aren't familiar with, always check its docs page.
- `dock`: Bottom navigation bar with `dock-label` parts, see [docs](https://daisyui.com/components/dock/)
- `filter`: Radio button groups with `filter-reset` for clearing selection, see [docs](https://daisyui.com/components/filter/)
- `list`: Vertical layout for data rows using `list-row` class for each item
- `fieldset`: Form grouping with `fieldset-legend` for titles and `label` for descriptions
- `floating-label`: Labels that float above inputs when focused, use as parent wrapper
- `status`: Tiny status indicators (`status-success`, `status-error`, etc.)
- `validator`: Automatic form validation styling with `validator-hint` for error messages
- `theme-controller`: Controls page theme via checkbox/radio with `value="{theme-name}"`
- `diff`: Side-by-side comparison with `diff-item-1`, `diff-item-2`, `diff-resizer` parts
- `calendar`: Apply `cally`, `pika-single`, or `react-day-picker` classes to respective libraries
- `swap`: Toggle visibility of elements using `swap-on`/`swap-off` with checkbox or `swap-active` class
- [Modal](https://daisyui.com/components/modal/): use with HTML dialog
- [Drawer](https://daisyui.com/components/drawer/): Grid layout with sidebar toggle using `drawer-toggle` checkbox
- [Dropdown](https://daisyui.com/components/dropdown/): Details/summary, popover API, or CSS focus methods
- [Accordion](https://daisyui.com/components/accordion/): Radio inputs for exclusive opening using `collapse` class

### Usage Rules

- Responsive patterns: `lg:menu-horizontal`, `sm:card-horizontal`
- Prefer daisyUI colors (`bg-primary`) over Tailwind colors (`bg-blue-500`) for theme consistency
- Use `*-content` colors for text on colored backgrounds
- Typography plugin adds default margins to headings (h1, h2, h3, etc.) - use `mt-0` to override when precise spacing is needed

### Color System

- Semantic colors: `primary`, `secondary`, `accent`, `neutral`, `base-100/200/300`
- Status colors: `info`, `success`, `warning`, `error`
- Each color has matching `-content` variant for contrasting text
- Custom themes use OKLCH format, create at [theme generator](https://daisyui.com/theme-generator/)

## Other Guidelines

- When stuck: check official docs first (docs.convex.dev, tanstack.com, daisyui.com)
- Ask before installing new dependencies
- Verify responsive design at multiple breakpoints
- Document non-obvious implementation choices in this file
- Import icons from `lucide-react`
- When making identical changes to multiple occurrences, use Edit with `replace_all: true` instead of MultiEdit. Avoid MultiEdit whenever possible, it is unreliable.
- Never leave floating promisses, use void when needed
