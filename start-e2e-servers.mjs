#!/usr/bin/env node

import { spawn } from 'child_process';

console.log('[Starting E2E test servers...]');

// Start Convex backend in non-interactive mode
const convexProcess = spawn('./start-local-convex.mjs', [], {
  stdio: ['pipe', 'pipe', 'pipe'],
  shell: true
});

let convexStarted = false;
let envVarSet = false;
let frontendProcess = null;

// Monitor Convex output
convexProcess.stdout.on('data', (data) => {
  const text = data.toString();
  process.stdout.write(text);

  // First, wait for Convex to start (backend listening)
  if (!convexStarted && text.includes('Started running a deployment locally')) {
    convexStarted = true;
    console.log('\n[Convex backend started, setting environment variable...]');

    // Set the Clerk JWT issuer domain
    const envProcess = spawn('pnpx', ['convex', 'env', 'set', 'CLERK_JWT_ISSUER_DOMAIN', 'workable-dog-93.clerk.accounts.dev'], {
      stdio: 'inherit'
    });

    envProcess.on('exit', (code) => {
      if (code === 0) {
        envVarSet = true;
        console.log('[Environment variable set, waiting for functions to deploy...]');
      } else {
        console.error('[Failed to set environment variable]');
        process.exit(1);
      }
    });
  }

  // Then wait for functions to be deployed
  if (envVarSet && text.includes('Convex functions ready!')) {
    console.log('\n[Convex functions deployed, starting frontend...]');

    // Start frontend
    frontendProcess = spawn('pnpm', ['run', 'dev:frontend'], {
      stdio: 'inherit',
      shell: true
    });
  }
});

convexProcess.stderr.on('data', (data) => {
  process.stderr.write(data);
});

convexProcess.on('exit', (code) => {
  console.log(`[Convex exited with code ${code}]`);
  if (frontendProcess) {
    frontendProcess.kill();
  }
  process.exit(code || 0);
});

// Handle shutdown signals
process.on('SIGINT', () => {
  console.log('\n[Shutting down E2E servers...]');
  if (frontendProcess) {
    frontendProcess.kill('SIGINT');
  }
  convexProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  if (frontendProcess) {
    frontendProcess.kill('SIGTERM');
  }
  convexProcess.kill('SIGTERM');
});
