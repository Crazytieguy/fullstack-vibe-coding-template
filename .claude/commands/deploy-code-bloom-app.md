---
description: Deploy Code Bloom application to Vercel
argument-hint: None required
---

# Deploy to Vercel

Guide a user through deploying their application to Vercel

## Step 1: Prepare Repository (executed by claude code)

- Ensure the build is successful: `pnpm build` should complete without errors
- Ensure all changes are committed: `git status` should show clean working tree
- Push to your remote repository: `git push origin main`
- Verify the push was successful

## Step 2: Set Up Convex Production (executed by user)

- Go to [Convex Dashboard](https://dashboard.convex.dev)
- Navigate to your project
- Create a production deployment
- Set the CLERK_JWT_ISSUER_DOMAIN environment variable with `pnpm convex env --prod set CLERK_JWT_ISSUER_DOMAIN https://clerk.code-bloom.app`
- Generate a production deployment key
  - Select your project -> production
  - Settings
  - "Generate Production Deployment Key"
- Copy the deployment key (you'll need it for Vercel environment variables)

## Step 3: Deploy to Vercel (executed by user)

- Go to [Vercel Dashboard](https://vercel.com/dashboard)
- Log in to your Vercel account
- Click "New Project" or "Add New..."
- Connect your GitHub/GitLab/Bitbucket repository
- Select the repository containing your application
- Project settings will be auto detected from vercel.json

## Step 4: Configure Environment Variables (executed by user)

In the Vercel project settings, add these environment variables:

- `CONVEX_DEPLOY_KEY`: Use the production deployment key from Step 2
- `VITE_CLERK_PUBLISHABLE_KEY`: pk_live_Y2xlcmsuY29kZS1ibG9vbS5hcHAk

## Step 5: Configure Custom code-bloom.app Subdomain (executed by user)

- Click "Deploy" to start the deployment
- Wait for the build to complete
- In your Vercel project, go to Settings → Domains
- Click "Add Domain"
- Enter your subdomain: `[your-app-name].code-bloom.app`
- Click "Add" to configure the domain
- Vercel will provide DNS configuration (usually a CNAME record and a TXT record)
- Send the DNS configuration to the code-bloom.app administrator
- Wait for confirmation that the DNS record has been added
- Vercel will automatically provision SSL certificate once DNS propagates

## Step 6: Verify Deployment

- Once the domain is configured, visit `https://[your-app-name].code-bloom.app`
- Test that your application loads correctly
- Verify authentication works properly
