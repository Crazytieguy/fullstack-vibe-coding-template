#!/usr/bin/env node

import { spawn } from 'child_process';

console.log('[Starting convex dev...]');

// List of prompts to auto-answer with Enter
const prompts = [
  'Would you like to login to your account?',
  'Which project would you like to use?',
  'Choose a name:'
];

let buffer = '';

// Use 'script' command to create a pseudo-TTY so convex CLI thinks it's interactive
const childProcess = spawn('script', [
  '-q',  // quiet mode
  '-c', 'pnpm run dev:backend',
  '/dev/null'
], {
  stdio: ['pipe', 'pipe', 'pipe'],
  shell: false
});

let setupTimeout = null;

const resetTimeout = () => {
  if (setupTimeout) clearTimeout(setupTimeout);
  setupTimeout = setTimeout(() => {
    console.log('\n[Setup complete, running dev server...]');
    // Stop checking for prompts, just forward everything
    childProcess.stdout.removeAllListeners('data');
    childProcess.stderr.removeAllListeners('data');
    childProcess.stdout.pipe(process.stdout);
    childProcess.stderr.pipe(process.stderr);
  }, 3000);
};

childProcess.stdout.on('data', (data) => {
  const text = data.toString();
  process.stdout.write(text);

  buffer += text;

  // Check if any prompt matches
  for (const prompt of prompts) {
    if (buffer.includes(prompt)) {
      console.log(`\n[Matched '${prompt}' - sending Enter]`);
      childProcess.stdin.write('\n');
      buffer = ''; // Clear buffer after match
      resetTimeout();
      break;
    }
  }

  // Keep buffer from growing too large
  if (buffer.length > 1000) {
    buffer = buffer.slice(-500);
  }
});

childProcess.stderr.on('data', (data) => {
  process.stderr.write(data);
});

childProcess.on('exit', (code) => {
  if (setupTimeout) clearTimeout(setupTimeout);
  process.exit(code);
});

// Start timeout
resetTimeout();

// Handle Ctrl+C
process.on('SIGINT', () => {
  childProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  childProcess.kill('SIGTERM');
});
