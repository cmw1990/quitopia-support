#!/bin/bash

# Simple setup script for global Safari console error checking
# This creates a launch agent that starts at login and runs in the background

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "${BLUE}===============================================${NC}"
echo "${BLUE}  Global Safari Console Checker Installation   ${NC}"
echo "${BLUE}===============================================${NC}"
echo ""

# Create necessary directories
echo "${BLUE}Creating necessary directories...${NC}"
mkdir -p "$HOME/bin"
mkdir -p "$HOME/Library/LaunchAgents"
mkdir -p "$HOME/Library/Logs/SafariConsole"

# Create the Safari console checker script
echo "${BLUE}Creating Safari console checker script...${NC}"
cat > "$HOME/bin/safari-console" << 'EOF'
#!/bin/bash

# Safari Console Error Checker
# This script captures JavaScript errors and warnings from Safari

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "${BLUE}=======================================${NC}"
echo "${BLUE}  Safari Console Error Checker        ${NC}"
echo "${BLUE}=======================================${NC}"
echo ""
echo "Checking for console errors in Safari..."
echo ""

# Create temporary JavaScript file
TEMP_JS="/tmp/safari_console_check_$$.js"

cat > "$TEMP_JS" << 'EOL'
(function() {
    var currentUrl = window.location.href;
    var errorCount = 0;
    var warningCount = 0;
    var errors = [];
    var warnings = [];
    
    try {
        // Check for React error boundaries
        var reactErrors = document.querySelectorAll('[data-reactroot] h2');
        for (var i = 0; i < reactErrors.length; i++) {
            if (reactErrors[i].textContent.includes('Error')) {
                errorCount++;
                errors.push('React Error: ' + reactErrors[i].textContent);
            }
        }
        
        // Save original console methods
        var originalConsoleError = console.error;
        var originalConsoleWarn = console.warn;
        
        // Override console.error
        console.error = function() {
            errorCount++;
            var errorMsg = Array.prototype.slice.call(arguments).join(' ');
            errors.push(errorMsg);
            originalConsoleError.apply(console, arguments);
        };
        
        // Override console.warn
        console.warn = function() {
            warningCount++;
            var warnMsg = Array.prototype.slice.call(arguments).join(' ');
            warnings.push(warnMsg);
            originalConsoleWarn.apply(console, arguments);
        };
        
        // Check the page for a moment to catch errors
        setTimeout(function() {
            // Restore original methods
            console.error = originalConsoleError;
            console.warn = originalConsoleWarn;
            
            // Send results via document title
            document.title = "CONSOLE_DATA:" + JSON.stringify({
                errorCount: errorCount,
                warningCount: warningCount,
                errors: errors,
                warnings: warnings,
                url: currentUrl
            });
        }, 1000);
    } catch (e) {
        document.title = "CONSOLE_ERROR:" + e.message;
    }
})();
EOL

# Run the JavaScript in Safari
RESULT=$(osascript <<EOF
tell application "Safari"
    if not running then
        activate
        delay 1
    end if
    
    try
        tell front document
            do JavaScript (read file "$TEMP_JS")
            delay 2
            return name
        end tell
    on error errMsg
        return "ERROR: " & errMsg
    end try
end tell
EOF
)

# Clean up temporary file
rm -f "$TEMP_JS"

# Process results
if [[ $RESULT == ERROR:* ]]; then
    echo "${RED}Error: ${RESULT#ERROR: }${NC}"
    echo "Please make sure Safari is running with a webpage open."
    exit 1
elif [[ $RESULT == CONSOLE_ERROR:* ]]; then
    echo "${RED}JavaScript Error: ${RESULT#CONSOLE_ERROR: }${NC}"
    exit 1
elif [[ $RESULT == CONSOLE_DATA:* ]]; then
    # Extract the JSON data
    JSON_DATA=${RESULT#CONSOLE_DATA:}
    
    # Parse values
    ERROR_COUNT=$(echo "$JSON_DATA" | python3 -c "import sys, json; print(json.loads(sys.stdin.read()).get('errorCount', 0))")
    WARNING_COUNT=$(echo "$JSON_DATA" | python3 -c "import sys, json; print(json.loads(sys.stdin.read()).get('warningCount', 0))")
    URL=$(echo "$JSON_DATA" | python3 -c "import sys, json; print(json.loads(sys.stdin.read()).get('url', 'Unknown'))")
    ERRORS=$(echo "$JSON_DATA" | python3 -c "import sys, json; print('\n'.join(json.loads(sys.stdin.read()).get('errors', [])))")
    WARNINGS=$(echo "$JSON_DATA" | python3 -c "import sys, json; print('\n'.join(json.loads(sys.stdin.read()).get('warnings', [])))")
    
    # Output results
    echo "URL: ${BLUE}$URL${NC}"
    echo ""
    
    if [ "$ERROR_COUNT" -gt 0 ]; then
        echo "${RED}✗ Found $ERROR_COUNT error(s):${NC}"
        echo "$ERRORS" | while read -r line; do
            echo "  - $line"
        done
        echo ""
        HAS_ERRORS=1
    else
        echo "${GREEN}✓ No errors detected${NC}"
        HAS_ERRORS=0
    fi
    
    if [ "$WARNING_COUNT" -gt 0 ]; then
        echo "${YELLOW}⚠ Found $WARNING_COUNT warning(s):${NC}"
        echo "$WARNINGS" | while read -r line; do
            echo "  - $line"
        done
    else
        echo "${GREEN}✓ No warnings detected${NC}"
    fi
else
    echo "${YELLOW}Could not retrieve console data from Safari.${NC}"
    echo "${YELLOW}Please make sure Safari Developer Tools are enabled:${NC}"
    echo "1. In Safari, go to Safari > Settings > Advanced"
    echo "2. Check 'Show Develop menu in menu bar'"
    echo "3. Open Web Inspector with Option+Command+I"
    HAS_ERRORS=0
fi

echo ""
echo "${BLUE}=======================================${NC}"
exit $HAS_ERRORS
EOF

chmod +x "$HOME/bin/safari-console"

# Create the launch agent script
echo "${BLUE}Creating service script...${NC}"
cat > "$HOME/Library/LaunchAgents/safari-console-service.sh" << 'EOF'
#!/bin/bash

# Safari Console Error Monitor Service

LOG_DIR="$HOME/Library/Logs/SafariConsole"
mkdir -p "$LOG_DIR"

# Helper functions
is_safari_running() {
  pgrep -x "Safari" > /dev/null
}

check_safari_console() {
  # Run the console checker and log the results
  LOG_FILE="$LOG_DIR/safari_console_$(date +%Y%m%d_%H%M%S).log"
  $HOME/bin/safari-console > "$LOG_FILE" 2>&1
  
  # If errors were found, send a notification
  if [ $? -eq 1 ]; then
    osascript -e 'display notification "Console errors detected in Safari" with title "Safari Console Monitor" sound name "Basso"'
  fi
}

# Main loop - check every minute if Safari is running
while true; do
  if is_safari_running; then
    check_safari_console
  fi
  sleep 60
done
EOF

chmod +x "$HOME/Library/LaunchAgents/safari-console-service.sh"

# Create the launch agent plist
echo "${BLUE}Creating LaunchAgent...${NC}"
cat > "$HOME/Library/LaunchAgents/com.user.safariconsole.plist" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.user.safariconsole</string>
    <key>ProgramArguments</key>
    <array>
        <string>$HOME/Library/LaunchAgents/safari-console-service.sh</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>$HOME/Library/Logs/SafariConsole/service.log</string>
    <key>StandardErrorPath</key>
    <string>$HOME/Library/Logs/SafariConsole/service_error.log</string>
</dict>
</plist>
EOF

# Add to shell profile
echo "${BLUE}Adding to shell profile...${NC}"
SHELL_PROFILE=""
if [ -f "$HOME/.zshrc" ]; then
    SHELL_PROFILE="$HOME/.zshrc"
elif [ -f "$HOME/.bashrc" ]; then
    SHELL_PROFILE="$HOME/.bashrc"
elif [ -f "$HOME/.bash_profile" ]; then
    SHELL_PROFILE="$HOME/.bash_profile"
else
    SHELL_PROFILE="$HOME/.zshrc"
    touch "$SHELL_PROFILE"
fi

# Add the alias to the profile if it doesn't exist
if ! grep -q "alias safcon=" "$SHELL_PROFILE"; then
    cat >> "$SHELL_PROFILE" << 'EOF'

# Safari Console Error Checker
alias safcon="$HOME/bin/safari-console"

# Auto-checker for IDEs
if [[ "$PWD" == *"cursor"* || "$PWD" == *"vscode"* || "$PWD" == *"idea"* ]]; then
  echo "IDE environment detected. Safari console checker is available."
  echo "Type 'safcon' to check Safari for console errors."
fi
EOF
fi

# Create Cursor workspace hook directory
echo "${BLUE}Setting up Cursor integration...${NC}"
mkdir -p "$HOME/.cursor/hooks"

# Create Cursor workspace hook
cat > "$HOME/.cursor/hooks/on-workspace-create.sh" << 'EOF'
#!/bin/bash

# Safari Console integration for Cursor
echo "Safari console error checking is available."
echo "Type 'safcon' to check Safari for console errors."
EOF

chmod +x "$HOME/.cursor/hooks/on-workspace-create.sh"

# Enable Safari Developer Tools
echo "${BLUE}Enabling Safari Developer Tools...${NC}"
defaults write com.apple.Safari IncludeDevelopMenu -bool true
defaults write com.apple.Safari WebKitDeveloperExtrasEnabledPreferenceKey -bool true
defaults write com.apple.Safari WebKitDeveloperExtrasEnabled -bool true

# Load the launch agent
echo "${BLUE}Loading the launch agent...${NC}"
launchctl unload "$HOME/Library/LaunchAgents/com.user.safariconsole.plist" 2>/dev/null
launchctl load -w "$HOME/Library/LaunchAgents/com.user.safariconsole.plist"

# Success message
echo ""
echo "${GREEN}=============================================${NC}"
echo "${GREEN}  Safari Console Checker is now installed!  ${NC}"
echo "${GREEN}=============================================${NC}"
echo ""
echo "The Safari console error checker will:"
echo "1. ${YELLOW}Start automatically when you log in${NC}"
echo "2. ${YELLOW}Run in the background and monitor Safari for errors${NC}"
echo "3. ${YELLOW}Send notifications if errors are detected${NC}"
echo "4. ${YELLOW}Work with all your Cursor workspaces${NC}"
echo ""
echo "To check for errors manually, type: ${YELLOW}safcon${NC}"
echo ""
echo "${YELLOW}IMPORTANT:${NC} Please restart your terminal or run:"
echo "source $SHELL_PROFILE"
echo ""
echo "Safari console monitoring is now ${GREEN}ACTIVE${NC}!" 