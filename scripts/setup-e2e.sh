#!/bin/bash
# Setup script for E2E testing environment

set -e

echo "🔧 Setting up E2E testing environment..."

# Check if .env.local exists
if [ -f ".env.local" ]; then
  echo "✅ .env.local already exists"
else
  echo "📝 Creating .env.local from .env.example..."
  cp .env.example .env.local
  echo ""
  echo "⚠️  You need to add the following to .env.local:"
  echo ""
  echo "VITE_CONVEX_URL=https://your-deployment.convex.cloud"
  echo "CLERK_JWT_ISSUER_DOMAIN=your-domain.clerk.accounts.dev"
  echo ""
  echo "Get these values from:"
  echo "  1. Run 'pnpm dev' and note the Convex URL"
  echo "  2. Get Clerk domain from: https://dashboard.clerk.com"
  echo ""
  exit 1
fi

# Check if Convex URL is set
if ! grep -q "^VITE_CONVEX_URL=" .env.local || grep -q "^VITE_CONVEX_URL=$" .env.local; then
  echo "❌ VITE_CONVEX_URL not set in .env.local"
  echo "   Run 'pnpm dev' to get your Convex deployment URL"
  exit 1
fi

# Check if Clerk JWT domain is set
if ! grep -q "^CLERK_JWT_ISSUER_DOMAIN=" .env.local || grep -q "^CLERK_JWT_ISSUER_DOMAIN=$" .env.local; then
  echo "❌ CLERK_JWT_ISSUER_DOMAIN not set in .env.local"
  echo "   Get this from https://dashboard.clerk.com"
  exit 1
fi

echo "✅ Environment variables configured"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  pnpm install
fi

# Check if Playwright browsers are installed
if [ ! -d "$HOME/.cache/ms-playwright" ]; then
  echo "🌐 Installing Playwright browsers..."
  pnpm exec playwright install chromium --with-deps
fi

# Check if Convex is authenticated
if [ ! -d ".convex" ]; then
  echo ""
  echo "⚠️  Convex not authenticated yet."
  echo "   Please run 'pnpm dev' in another terminal to authenticate."
  echo "   Then press Ctrl+C to stop it, and run this script again."
  echo ""
  exit 1
fi

echo ""
echo "✅ E2E environment is ready!"
echo ""
echo "To run tests:"
echo "  1. Start dev server: pnpm dev"
echo "  2. In another terminal: pnpm test:e2e"
echo ""
