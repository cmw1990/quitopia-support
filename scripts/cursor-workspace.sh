#!/bin/bash

# Cursor Workspace Safari Setup
# This script creates configurations for new Cursor workspaces
# to automatically set up Safari console error checking

# Colors for better output readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "${BLUE}=== Setting up Safari Console Error Checking for Cursor Workspaces ===${NC}"

# Create Cursor configuration directories
CURSOR_DIR="$HOME/.cursor"
CURSOR_TEMPLATES_DIR="$CURSOR_DIR/templates"
CURSOR_HOOKS_DIR="$CURSOR_DIR/hooks"

mkdir -p "$CURSOR_TEMPLATES_DIR"
mkdir -p "$CURSOR_HOOKS_DIR"

# Create workspace template with a scripts directory
TEMPLATE_DIR="$CURSOR_TEMPLATES_DIR/safari-console-template"
TEMPLATE_SCRIPTS_DIR="$TEMPLATE_DIR/scripts"

mkdir -p "$TEMPLATE_SCRIPTS_DIR"

# Create the Safari console script in the template
echo "Creating Safari console script template..."
cat > "$TEMPLATE_SCRIPTS_DIR/safari-console.sh" << 'EOL'
#!/bin/bash

# Safari Console Error Checker
# Checks for JavaScript console errors in Safari

# Colors for better output readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Safari is running
if ! pgrep -x "Safari" > /dev/null; then
    echo "${YELLOW}Safari is not running. Opening Safari...${NC}"
    open -a Safari
    sleep 2
fi

# Create a temporary JavaScript file for console error detection
TEMP_JS_FILE=$(mktemp)

cat > "$TEMP_JS_FILE" << 'JSEOF'
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
        document.title = "SAFARI_LOG:" + JSON.stringify({
            errors: capturedErrors,
            warnings: capturedWarnings,
            url: window.location.href,
            errorCount: capturedErrors.length,
            warningCount: capturedWarnings.length
        });
    }, 1000);
})();
JSEOF

# Apply the script to Safari
echo "${BLUE}Checking Safari for console errors...${NC}"
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
if [[ $RESULT == SAFARI_LOG:* ]]; then
    # Extract the JSON data
    JSON_DATA=${RESULT#SAFARI_LOG:}
    
    # Extract values using Python (more reliable than bash for JSON)
    ERROR_COUNT=$(echo "$JSON_DATA" | python3 -c "import json, sys; data=json.loads(sys.stdin.read()); print(data.get('errorCount', 0))")
    WARNING_COUNT=$(echo "$JSON_DATA" | python3 -c "import json, sys; data=json.loads(sys.stdin.read()); print(data.get('warningCount', 0))")
    URL=$(echo "$JSON_DATA" | python3 -c "import json, sys; data=json.loads(sys.stdin.read()); print(data.get('url', 'Unknown'))")
    
    echo "${BLUE}Current URL:${NC} $URL"
    
    # Display errors if any
    if [ "$ERROR_COUNT" -gt 0 ]; then
        echo "${RED}❌ ERRORS DETECTED ($ERROR_COUNT):${NC}"
        echo "$JSON_DATA" | python3 -c "
import json, sys
data = json.loads(sys.stdin.read())
for i, err in enumerate(data.get('errors', [])):
    print(f'\033[0;31m{i+1}.\033[0m {err}')
"
    else
        echo "${GREEN}✅ No errors detected${NC}"
    fi
    
    # Display warnings if any
    if [ "$WARNING_COUNT" -gt 0 ]; then
        echo "${YELLOW}⚠️ WARNINGS DETECTED ($WARNING_COUNT):${NC}"
        echo "$JSON_DATA" | python3 -c "
import json, sys
data = json.loads(sys.stdin.read())
for i, warn in enumerate(data.get('warnings', [])):
    print(f'\033[0;33m{i+1}.\033[0m {warn}')
"
    else
        echo "${GREEN}✅ No warnings detected${NC}"
    fi
    
else
    echo "${RED}❌ Error: Could not retrieve console data from Safari.${NC}"
    echo "Make sure Safari Developer Tools are enabled:"
    echo "1. Open Safari"
    echo "2. Go to Safari > Settings > Advanced"
    echo "3. Check 'Show Develop menu in menu bar'"
    echo "4. Try running this script again"
fi

echo ""
echo "${BLUE}For more detailed debugging:${NC}"
echo "1. Press Option+Command+I to open Safari Web Inspector"
echo "2. Click on the 'Console' tab to view live console output"
EOL

chmod +x "$TEMPLATE_SCRIPTS_DIR/safari-console.sh"

# Create Safari dev server script
echo "Creating Safari dev server script..."
cat > "$TEMPLATE_SCRIPTS_DIR/safari-dev.sh" << 'EOL'
#!/bin/bash

# Safari Development Server
# Starts the development server and opens Safari

# PORT to use (default: 3000)
PORT=${1:-3000}

# Check if the port is already in use
if lsof -i :$PORT > /dev/null; then
    echo "Port $PORT is already in use."
    echo "Killing the process using port $PORT..."
    lsof -ti :$PORT | xargs kill -9
    sleep 1
fi

# Start the development server based on what's available
if [ -f "package.json" ]; then
    # Determine the start command
    if grep -q "\"dev\"" package.json; then
        START_CMD="npm run dev"
    elif grep -q "\"start\"" package.json; then
        START_CMD="npm start"
    else
        echo "No dev or start script found in package.json"
        exit 1
    fi
    
    # Start the server
    echo "Starting the development server on port $PORT..."
    export PORT=$PORT
    $START_CMD &
    SERVER_PID=$!
    
    # Wait for the server to start
    echo "Waiting for server to start..."
    for i in {1..30}; do
        if curl -s http://localhost:$PORT > /dev/null; then
            break
        fi
        sleep 1
        echo -n "."
        if [ $i -eq 30 ]; then
            echo "Server did not start within 30 seconds."
            exit 1
        fi
    done
    
    echo ""
    echo "Server started successfully!"
    
    # Open Safari
    echo "Opening Safari..."
    open -a Safari "http://localhost:$PORT"
    
    # Enable Safari Developer Tools if not already enabled
    defaults write com.apple.Safari IncludeDevelopMenu -bool true
    defaults write com.apple.Safari WebKitDeveloperExtrasEnabledPreferenceKey -bool true
    
    echo ""
    echo "To check for console errors, run:"
    echo "./scripts/safari-console.sh"
    
    # Wait for the server process
    wait $SERVER_PID
else
    echo "No package.json found. Is this a JavaScript/TypeScript project?"
    exit 1
fi
EOL

chmod +x "$TEMPLATE_SCRIPTS_DIR/safari-dev.sh"

# Create a workspace hook to copy these scripts to new workspaces
echo "Creating Cursor workspace hook..."
cat > "$CURSOR_HOOKS_DIR/on-workspace-create.sh" << 'EOL'
#!/bin/bash

# This script runs when a new Cursor workspace is created
# It copies the Safari console scripts to the new workspace

# Get the workspace directory from the first argument
WORKSPACE_DIR="$1"
if [ -z "$WORKSPACE_DIR" ]; then
    echo "No workspace directory provided"
    exit 1
fi

# Create scripts directory in the workspace
SCRIPTS_DIR="$WORKSPACE_DIR/scripts"
mkdir -p "$SCRIPTS_DIR"

# Copy the Safari console scripts
TEMPLATE_DIR="$HOME/.cursor/templates/safari-console-template/scripts"
if [ -d "$TEMPLATE_DIR" ]; then
    cp "$TEMPLATE_DIR/"*.sh "$SCRIPTS_DIR/"
    chmod +x "$SCRIPTS_DIR/"*.sh
    echo "Safari console scripts copied to $SCRIPTS_DIR"
fi

# Create a README in the scripts directory
cat > "$SCRIPTS_DIR/README.md" << 'README_EOF'
# Development Scripts

This directory contains helpful scripts for development.

## Safari Console Checking

Safari provides excellent developer tools but requires some setup. These scripts help with that:

### `safari-console.sh`

Checks for JavaScript console errors in the current Safari window.

```bash
./scripts/safari-console.sh
```

### `safari-dev.sh`

Starts the development server and opens Safari with developer tools enabled.

```bash
# Start on default port (3000)
./scripts/safari-dev.sh

# Start on specific port
./scripts/safari-dev.sh 8080
```

## Setup

To use these scripts, make sure they are executable:

```bash
chmod +x scripts/*.sh
```

For the best debugging experience, enable Safari's Developer Tools:
1. Open Safari
2. Go to Safari > Settings > Advanced
3. Check "Show Develop menu in menu bar"
README_EOF

# Enable Safari Developer Tools
defaults write com.apple.Safari IncludeDevelopMenu -bool true
defaults write com.apple.Safari WebKitDeveloperExtrasEnabledPreferenceKey -bool true
defaults write com.apple.Safari WebKitPreferences.developerExtrasEnabled -bool true
EOL

chmod +x "$CURSOR_HOOKS_DIR/on-workspace-create.sh"

# Create a global shell alias for all workspaces
if [ -f "$HOME/.zshrc" ]; then
    SHELL_RC="$HOME/.zshrc"
elif [ -f "$HOME/.bashrc" ]; then
    SHELL_RC="$HOME/.bashrc"
else
    SHELL_RC=""
fi

if [ -n "$SHELL_RC" ]; then
    echo "Adding global Safari console checking alias to $SHELL_RC..."
    cat >> "$SHELL_RC" << 'EOL'

# Safari console checking alias
alias safcon='
if [ -f "./scripts/safari-console.sh" ]; then
    ./scripts/safari-console.sh
elif command -v safari-console &>/dev/null; then
    safari-console
else
    echo "Safari console checker not found."
    echo "Run inside a workspace with ./scripts/safari-console.sh"
    echo "Or install globally using the install-safari-console.sh script."
fi
'
EOL
    echo "${GREEN}Added safcon alias to $SHELL_RC${NC}"
    echo "Please restart your terminal or run 'source $SHELL_RC' for changes to take effect"
fi

echo "${GREEN}Setup complete!${NC}"
echo ""
echo "Safari console error checking will be automatically set up for new Cursor workspaces."
echo "You can use the ${YELLOW}safcon${NC} alias to check Safari console errors from any directory."
echo ""
echo "${BLUE}Usage:${NC}"
echo "1. In any new Cursor workspace, start the dev server with Safari:"
echo "   ${YELLOW}./scripts/safari-dev.sh${NC}"
echo "2. Check for console errors with:"
echo "   ${YELLOW}./scripts/safari-console.sh${NC}   or   ${YELLOW}safcon${NC}"
EOL 