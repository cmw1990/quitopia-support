#!/bin/bash

# check-console.sh
# 
# This script starts Chrome with remote debugging and runs the console checker.
# It will capture all console errors from your application.
#
# Usage: ./check-console.sh [url]

# Default URL if not provided
URL=${1:-"http://localhost:5176"}

echo "🔍 Chrome Console Error Checker"
echo "==============================="
echo "This tool will check console errors from: $URL"

# Kill any existing Chrome processes with remote debugging
echo "🛑 Stopping any existing Chrome instances with remote debugging..."
pkill -f "Google Chrome.*remote-debugging-port"

# Start Chrome with remote debugging in the background
echo "🚀 Starting Chrome with remote debugging..."
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --no-first-run \
  --user-data-dir=/tmp/chrome-debug-profile \
  "$URL" &

# Give Chrome a moment to start
echo "⏳ Waiting for Chrome to initialize..."
sleep 3

# Run the console checker
echo "📊 Starting console error monitoring..."
cd "$(dirname "$0")/.." || exit
node scripts/chrome-console-checker.js "$URL"

# Cleanup Chrome instance when the script is interrupted
cleanup() {
  echo "🧹 Cleaning up..."
  pkill -f "Google Chrome.*remote-debugging-port"
  exit 0
}

trap cleanup INT TERM

# Keep the script running until Ctrl+C
echo "Press Ctrl+C to stop monitoring and close Chrome."
wait 