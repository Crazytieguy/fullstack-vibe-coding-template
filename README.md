# Full-Stack Web Application Starter Template

This starter template accelerates full-stack web app development, emphasizing an excellent Developer Experience (DX), especially for LLM-assisted coding. It integrates Convex, TanStack Router, Clerk, Vite, React, and Tailwind CSS to provide a robust foundation.

## Quick Start for Humans

Follow these steps to get your development environment set up:

1.  **Install pnpm:**

    ```bash
    curl -fsSL https://get.pnpm.io/install.sh | sh -
    ```

    _Restart your terminal after installation for `pnpm` to be available._

2.  **Install/Manage Node.js:**

    ```bash
    pnpm env use --global lts
    ```

3.  **Clone Template with `degit`:**

    ```bash
    pnpx degit crazytieguy/fullstack-vibe-coding-template
    ```

4.  **Initialize the project:**

    ```bash
    pnpm run init
    ```

    This will:

    - Install all dependencies
    - Initialize Convex
    - Set up a preconfigured Clerk JWT issuer domain for quick testing

5.  **Run the app:**

    ```bash
    pnpm dev
    ```

6.  **Clerk Configuration:**

    For using your own Clerk account instead of the preconfigured one:

    - Follow steps 1 to 3 in the [Clerk onboarding guide](https://docs.convex.dev/auth/clerk#get-started)
    - Paste the Issuer URL as `CLERK_JWT_ISSUER_DOMAIN` to your dev deployment environment variable settings on the Convex dashboard (see [docs](https://docs.convex.dev/auth/clerk#configuring-dev-and-prod-instances))
    - Paste your publishable key as `VITE_CLERK_PUBLISHABLE_KEY="<your publishable key>"` to the `.env.local` file in this directory.

## Tech Stack

- **Backend:** [Convex](https://convex.dev/) (Real-time DB, Serverless Functions)
- **Frontend:** [React](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Routing:** [TanStack Router](https://tanstack.com/router/latest) (Type-safe, File-based)
- **Authentication:** [Clerk](https://clerk.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/)
- **Validation:** [Zod](https://zod.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Package Manager:** [pnpm](https://pnpm.io/)

## Project Structure Overview

```
.
├── convex/                   # Backend: Schema, queries, mutations, actions
│   ├── schema.ts             # Database schema
│   └── (e.g., messages.ts)   # Backend functions
├── public/                   # Static assets (served directly)
├── src/                      # Frontend (React + Vite)
│   ├── routes/               # TanStack file-based routing
│   │   ├── __root.tsx        # Root layout
│   │   └── index.tsx         # Home page route (/)
│   │   └── (e.g., chat.tsx)  # Other routes
│   ├── index.css             # Tailwind CSS entry point
│   └── main.tsx              # React app entry point
├── .env.local                # Frontend env vars (VITE_CLERK_PUBLISHABLE_KEY, gitignored)
├── .vscode/                  # VSCode editor settings & recommended extensions
├── index.html                # Vite entry HTML
├── vite.config.ts            # Vite configuration
└── package.json              # Dependencies & pnpm scripts
```

## Key Dependencies & Further Reading

Brief overview and links to official documentation for core technologies. Useful for understanding roles and for LLM context.

- **Convex:**

  - **Role:** Backend platform (real-time DB, serverless TypeScript functions, file storage).
  - **Docs:** [Convex Docs](https://docs.convex.dev/), [Schema](https://docs.convex.dev/database/schemas), [Queries](https://docs.convex.dev/functions/queries), [Mutations](https://docs.convex.dev/functions/mutations), [Actions](https://docs.convex.dev/functions/actions), [Auth w/ Clerk](https://docs.convex.dev/auth/clerk)

- **TanStack Router:**

  - **Role:** Type-safe, file-based routing for React (`src/routes/`).
  - **Docs:** [TanStack Router Docs](https://tanstack.com/router/latest), [File-Based Routing Guide](https://tanstack.com/router/latest/docs/framework/react/file-based-routing)

- **TanStack Form:**

  - **Role:** (Recommended) For managing form state, validation (with Zod), and submission.
  - **Docs:** [TanStack Form Docs](https://tanstack.com/form/latest)

- **Clerk:**

  - **Role:** User authentication and management, with UI components and Convex backend integration.
  - **Docs:** [Clerk Documentation](https://clerk.com/docs), [Convex + Clerk Guide](https://docs.convex.dev/auth/clerk)

- **Zod:**

  - **Role:** TypeScript-first schema declaration and validation (API args, form inputs).
  - **Docs:** [Zod GitHub & Docs](https://zod.dev/)

- **Core Frontend & Build:**
  - [React](https://react.dev/): UI library.
  - [Vite](https://vitejs.dev/): Frontend tooling (dev server, build).
  - [Tailwind CSS](https://tailwindcss.com/): Utility-first CSS.
  - [DaisyUI](https://daisyui.com/): Tailwind CSS components.
  - [TypeScript](https://www.typescriptlang.org/): Static typing.

## Deployment

### Netlify

This template includes a `netlify.toml` file configured for Convex deployments. To deploy:

1. Connect your repository to Netlify via their GitHub integration
2. Set `CONVEX_DEPLOY_KEY` in Netlify environment variables (generate in Convex dashboard)
3. Set `VITE_CLERK_PUBLISHABLE_KEY` for your production environment

For detailed instructions, see [Convex Netlify Deployment Guide](https://docs.convex.dev/production/hosting/netlify).

## License

MIT
