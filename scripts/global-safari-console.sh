#!/bin/bash

# Global Safari Console Error Checker
# This script can be installed globally and used in any Cursor workspace
# It captures and displays console errors from Safari without needing additional setup

# Get current directory for relative references
CURRENT_DIR=$(pwd)

# Colors for better output readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "${BLUE}=== Safari Console Error Checker ===${NC}"
echo "Checking Safari for console errors..."

# Check if Safari is running
if ! pgrep -x "Safari" > /dev/null; then
    echo "${YELLOW}Safari is not running. Opening Safari...${NC}"
    open -a Safari
    sleep 2
fi

# Create a temporary JavaScript file for console error detection
TEMP_JS_FILE=$(mktemp)

cat > "$TEMP_JS_FILE" << 'EOL'
(function() {
    // Store original console methods
    const originalConsole = {
        log: console.log,
        warn: console.warn,
        error: console.error
    };
    
    // Capture arrays for console messages
    const capturedErrors = [];
    const capturedWarnings = [];
    
    // Override console methods to capture messages
    console.error = function() {
        capturedErrors.push(Array.from(arguments).join(' '));
        originalConsole.error.apply(console, arguments);
    };
    
    console.warn = function() {
        capturedWarnings.push(Array.from(arguments).join(' '));
        originalConsole.warn.apply(console, arguments);
    };
    
    // Wait a moment to capture existing errors
    setTimeout(() => {
        // Check for common React errors
        const reactErrors = [];
        const reactWarnings = [];
        
        // Scan DOM for React error boundaries
        const errorBoundaries = document.querySelectorAll('[data-react-error-boundary]');
        if (errorBoundaries.length > 0) {
            for (const boundary of errorBoundaries) {
                reactErrors.push('React Error Boundary triggered: ' + boundary.textContent);
            }
        }
        
        // Also capture any 404 errors from network requests
        const networkErrors = [];
        const resources = performance.getEntriesByType('resource');
        for (const resource of resources) {
            if (resource.responseStatus >= 400) {
                networkErrors.push(`Failed to load: ${resource.name} (${resource.responseStatus})`);
            }
        }
        
        // Send the collected errors back through the document title
        document.title = "SAFARI_CONSOLE_LOG:" + JSON.stringify({
            errors: capturedErrors,
            warnings: capturedWarnings,
            reactErrors: reactErrors,
            reactWarnings: reactWarnings,
            networkErrors: networkErrors,
            url: window.location.href,
            errorCount: capturedErrors.length + reactErrors.length + networkErrors.length,
            warningCount: capturedWarnings.length + reactWarnings.length
        });
    }, 1000);
})();
EOL

# Apply the script to Safari
echo "${BLUE}Injecting error detection script...${NC}"
osascript -e 'tell application "Safari"
    set currentURL to URL of current tab of front window
    tell front document to do JavaScript (read file "'"$TEMP_JS_FILE"'")
    delay 1
end tell' 2>/dev/null

# Get results from the document title
RESULT=$(osascript -e 'tell application "Safari" to get name of front document' 2>/dev/null)

# Clean up
rm -f "$TEMP_JS_FILE"

# Process and display results
if [[ $RESULT == SAFARI_CONSOLE_LOG:* ]]; then
    # Extract the JSON data
    JSON_DATA=${RESULT#SAFARI_CONSOLE_LOG:}
    
    # Extract values using Python (more reliable than bash for JSON)
    ERROR_COUNT=$(echo "$JSON_DATA" | python3 -c "import json, sys; data=json.loads(sys.stdin.read()); print(data.get('errorCount', 0))")
    WARNING_COUNT=$(echo "$JSON_DATA" | python3 -c "import json, sys; data=json.loads(sys.stdin.read()); print(data.get('warningCount', 0))")
    URL=$(echo "$JSON_DATA" | python3 -c "import json, sys; data=json.loads(sys.stdin.read()); print(data.get('url', 'Unknown'))")
    
    echo "${BLUE}Current URL:${NC} $URL"
    echo ""
    
    # Display errors if any
    if [ "$ERROR_COUNT" -gt 0 ]; then
        echo "${RED}❌ ERRORS DETECTED ($ERROR_COUNT):${NC}"
        echo "$JSON_DATA" | python3 -c "
import json, sys
data = json.loads(sys.stdin.read())
errors = data.get('errors', [])
reactErrors = data.get('reactErrors', [])
networkErrors = data.get('networkErrors', [])

# Console errors
if errors:
    print('\033[0;31m== Console Errors ==\033[0m')
    for i, err in enumerate(errors):
        print(f'\033[0;31m{i+1}.\033[0m {err}')

# React errors
if reactErrors:
    print('\033[0;31m== React Errors ==\033[0m')
    for i, err in enumerate(reactErrors):
        print(f'\033[0;31m{i+1}.\033[0m {err}')
        
# Network errors
if networkErrors:
    print('\033[0;31m== Network Errors ==\033[0m')
    for i, err in enumerate(networkErrors):
        print(f'\033[0;31m{i+1}.\033[0m {err}')
"
    else
        echo "${GREEN}✅ No errors detected${NC}"
    fi
    
    # Display warnings if any
    if [ "$WARNING_COUNT" -gt 0 ]; then
        echo ""
        echo "${YELLOW}⚠️ WARNINGS DETECTED ($WARNING_COUNT):${NC}"
        echo "$JSON_DATA" | python3 -c "
import json, sys
data = json.loads(sys.stdin.read())
warnings = data.get('warnings', [])
reactWarnings = data.get('reactWarnings', [])

# Console warnings
if warnings:
    print('\033[0;33m== Console Warnings ==\033[0m')
    for i, warn in enumerate(warnings):
        print(f'\033[0;33m{i+1}.\033[0m {warn}')

# React warnings
if reactWarnings:
    print('\033[0;33m== React Warnings ==\033[0m')
    for i, warn in enumerate(reactWarnings):
        print(f'\033[0;33m{i+1}.\033[0m {warn}')
"
    else
        echo "${GREEN}✅ No warnings detected${NC}"
    fi
    
    # Capture these results to a log file in the current directory
    LOG_DIR="$CURRENT_DIR/logs"
    mkdir -p "$LOG_DIR"
    TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
    LOG_FILE="$LOG_DIR/safari-console-$TIMESTAMP.log"
    
    echo "==== Safari Console Log ($TIMESTAMP) ====" > "$LOG_FILE"
    echo "URL: $URL" >> "$LOG_FILE"
    echo "Error Count: $ERROR_COUNT" >> "$LOG_FILE"
    echo "Warning Count: $WARNING_COUNT" >> "$LOG_FILE"
    echo "====================================" >> "$LOG_FILE"
    echo "$JSON_DATA" | python3 -c "
import json, sys
data = json.loads(sys.stdin.read())
print('== ERRORS ==')
for err in data.get('errors', []):
    print(f'- {err}')
print('\n== REACT ERRORS ==')
for err in data.get('reactErrors', []):
    print(f'- {err}')
print('\n== NETWORK ERRORS ==')
for err in data.get('networkErrors', []):
    print(f'- {err}')
print('\n== WARNINGS ==')
for warn in data.get('warnings', []):
    print(f'- {warn}')
print('\n== REACT WARNINGS ==')
for warn in data.get('reactWarnings', []):
    print(f'- {warn}')
" >> "$LOG_FILE"
    
    echo ""
    echo "${BLUE}Log file saved to:${NC} $LOG_FILE"
    
else
    echo "${RED}❌ Error: Could not retrieve console data from Safari.${NC}"
    echo "Make sure Safari Developer Tools are enabled:"
    echo "1. Open Safari"
    echo "2. Go to Safari > Settings > Advanced"
    echo "3. Check 'Show Develop menu in menu bar'"
    echo "4. Try running this script again"
fi

echo ""
echo "${BLUE}=== Manual Steps for Better Debugging ===${NC}"
echo "1. Press Option+Command+I to open Safari Web Inspector"
echo "2. Click on the 'Console' tab to view live console output"
echo "3. Click on the 'Network' tab to monitor network requests"
echo "4. Refresh the page to see new errors in real-time" 