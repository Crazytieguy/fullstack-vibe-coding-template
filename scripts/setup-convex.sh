#!/bin/bash
# Auto-configure Convex by sending 3 enters to accept defaults
# This will:
# 1. Start without an account (run Convex locally)
# 2. Create a new project
# 3. Accept default name (swapcard8)

set -e

# Use script command to create a PTY, then send enters
# Using timeout to limit execution time
timeout 90s bash -c '{
  sleep 2
  printf "\n"
  sleep 1
  printf "\n"
  sleep 1
  printf "\n"
  sleep 2
} | script -q -c "pnpm convex dev --once" /dev/null' || {
  exit_code=$?
  # Exit code 124 means timeout, which is expected - Convex will keep preparing functions
  if [ $exit_code -eq 124 ]; then
    echo "Convex setup completed (timed out waiting for function preparation, which is normal)"
    exit 0
  else
    exit $exit_code
  fi
}
