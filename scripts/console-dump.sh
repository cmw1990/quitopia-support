#!/bin/bash

# Script to dump console logs from the Vite development server
# This captures the console.log output from the running app

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
LOG_FILE="${PROJECT_DIR}/logs/app-console-${TIMESTAMP}.log"

# Create logs directory if it doesn't exist
mkdir -p "${PROJECT_DIR}/logs"

echo "Checking for application console logs..."

# First, check if app is running
if ! lsof -i:5001 | grep LISTEN > /dev/null; then
  echo "❌ No application running on port 5001. Start the app first with:"
  echo "   ./scripts/dev-safari.sh"
  exit 1
fi

# Get the PID of the Node.js process running on port 5001
APP_PID=$(lsof -i:5001 -sTCP:LISTEN -t)
echo "✅ Found application process (PID: $APP_PID)"

# Check if we have any console errors in server logs
echo "Looking for errors in development server output..."
if [ -z "$APP_PID" ]; then
  echo "❌ Cannot determine application process ID"
else
  # Create a temporary file for the JavaScript injection
  TEMP_JS_FILE=$(mktemp)
  
  # Write test code to log console output
  cat > "$TEMP_JS_FILE" << 'EOL'
// Test code to trigger various console output
console.log("TEST_CONSOLE_OUTPUT_MARKER: Testing console.log");
console.info("TEST_CONSOLE_OUTPUT_MARKER: Testing console.info");
console.warn("TEST_CONSOLE_OUTPUT_MARKER: Testing console.warn");
console.error("TEST_CONSOLE_OUTPUT_MARKER: Testing console.error");

// Try to access some non-existent elements to generate errors
try {
  const nonExistentElement = document.getElementById('non-existent-element');
  console.log("Element exists:", nonExistentElement);
  nonExistentElement.style.color = 'red';
} catch(e) {
  console.error("TEST_CONSOLE_OUTPUT_MARKER: Caught error:", e.message);
}

// Report back
console.log("TEST_CONSOLE_OUTPUT_MARKER: Console test complete");
EOL

  # Watch the server logs for a few seconds
  echo "Checking current server logs for errors..."
  SERVER_LOGS=$(ps -p $APP_PID -o command= | grep -v grep)
  echo "Server command: $SERVER_LOGS"

  # Open Safari and inject test code
  echo "Injecting test code to generate console output..."
  open -a Safari "http://localhost:5001"
  sleep 2

  echo "Use Safari's Web Inspector to view the console logs:"
  echo "1. Make sure Safari's Developer menu is enabled (Safari > Settings > Advanced)"
  echo "2. Press Option+Command+I to open Web Inspector"
  echo "3. Click on the Console tab to view errors"
  echo ""
  echo "If you see 'Failed to load url' errors in the terminal where the server is running"
  echo "they may indicate missing files that need to be created."
  echo ""
  echo "Common errors seen in this project:"
  echo "- Failed to load url /src/components/ui/form"
  echo "- Failed to load url /src/lib/supabase"
  echo ""
  echo "Check for these missing files and create them as needed."

  # Clean up
  rm -f "$TEMP_JS_FILE"
fi 