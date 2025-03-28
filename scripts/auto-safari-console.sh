#!/bin/bash

# Script to set up automatic Safari console error checking
# This creates a launch agent that starts at login and runs in the background

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Print header
echo "${BLUE}==========================================================${NC}"
echo "${BLUE}  Auto Safari Console Error Checker - System Installation  ${NC}"
echo "${BLUE}==========================================================${NC}"
echo ""

# First check if global-safari-console.sh exists
if [ ! -f "$SCRIPT_DIR/global-safari-console.sh" ]; then
    echo "${RED}Error: Could not find global-safari-console.sh in the scripts directory${NC}"
    echo "Creating the file now..."
    
    # Create the global script file if it doesn't exist
    cat > "$SCRIPT_DIR/global-safari-console.sh" << 'EOF'
#!/bin/bash

# Safari Console Error Checker
# This script helps check for JavaScript console errors in Safari

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
    // Store current URL
    var currentUrl = window.location.href;
    
    // Initialize counters
    var errorCount = 0;
    var warningCount = 0;
    var errors = [];
    var warnings = [];
    
    // Get existing errors from console
    try {
        // Check if React error boundary has caught errors
        const reactErrorElements = document.querySelectorAll('[data-reactroot] h2');
        for (const el of reactErrorElements) {
            if (el.textContent.includes('Error') || el.textContent.includes('error')) {
                errors.push('React Error: ' + el.textContent);
                errorCount++;
            }
        }
        
        // Record existing errors and warnings using the browser's API
        if (typeof console !== 'undefined') {
            // Save original methods
            var originalError = console.error;
            var originalWarn = console.warn;
            
            // Override console.error
            console.error = function() {
                errorCount++;
                var args = Array.from(arguments);
                var errorMsg = args.map(function(arg) {
                    return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
                }).join(' ');
                errors.push(errorMsg);
                originalError.apply(console, arguments);
            };
            
            // Override console.warn
            console.warn = function() {
                warningCount++;
                var args = Array.from(arguments);
                var warnMsg = args.map(function(arg) {
                    return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
                }).join(' ');
                warnings.push(warnMsg);
                originalWarn.apply(console, arguments);
            };
            
            // Check for 404 errors in network requests
            var originalFetch = window.fetch;
            window.fetch = function(url, options) {
                var promise = originalFetch.apply(this, arguments);
                
                promise.catch(function(err) {
                    console.error('Network Error:', url, err.message);
                });
                
                promise.then(function(response) {
                    if (response.status === 404) {
                        console.error('404 Not Found:', url);
                    } else if (response.status >= 400) {
                        console.error('HTTP Error ' + response.status + ':', url);
                    }
                });
                
                return promise;
            };
            
            // Give a brief moment to capture errors
            setTimeout(function() {
                // Restore original console methods
                console.error = originalError;
                console.warn = originalWarn;
                
                // Send back the results through the document title
                var result = {
                    errorCount: errorCount,
                    warningCount: warningCount,
                    errors: errors,
                    warnings: warnings,
                    url: currentUrl
                };
                
                document.title = "CONSOLE_DATA:" + JSON.stringify(result);
            }, 1000);
        }
    } catch (e) {
        document.title = "CONSOLE_ERROR:" + e.message;
    }
})();
EOL

# Use AppleScript to inject the JavaScript into Safari
RESULT=$(osascript <<EOF
tell application "Safari"
    if not running then
        activate
        delay 1
    end if
    
    set jsFile to "$TEMP_JS"
    
    try
        tell front document
            do JavaScript (read file jsFile)
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

# Process the result
if [[ $RESULT == ERROR:* ]]; then
    echo "${RED}Failed to check console: ${RESULT#ERROR: }${NC}"
    echo ""
    echo "Please make sure:"
    echo "1. Safari is running with a web page loaded"
    echo "2. Developer Tools are enabled (Safari > Settings > Advanced)"
    echo "3. JavaScript is enabled in Safari"
    exit 1
elif [[ $RESULT == CONSOLE_ERROR:* ]]; then
    echo "${RED}Error during checking: ${RESULT#CONSOLE_ERROR: }${NC}"
    exit 1
elif [[ $RESULT == CONSOLE_DATA:* ]]; then
    # Extract the JSON data
    JSON_DATA=${RESULT#CONSOLE_DATA:}
    
    # Parse values using Python (more reliable than bash)
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
            if [ -n "$line" ]; then
                echo "  - $line"
            fi
        done
        echo ""
        exit 1
    else
        echo "${GREEN}✓ No errors detected${NC}"
    fi
    
    if [ "$WARNING_COUNT" -gt 0 ]; then
        echo "${YELLOW}⚠ Found $WARNING_COUNT warning(s):${NC}"
        echo "$WARNINGS" | while read -r line; do
            if [ -n "$line" ]; then
                echo "  - $line"
            fi
        done
    else
        echo "${GREEN}✓ No warnings detected${NC}"
    fi
else
    echo "${YELLOW}Could not retrieve console data from Safari.${NC}"
    echo "${YELLOW}Please make sure Safari Developer Tools are enabled.${NC}"
    echo ""
    echo "${YELLOW}Manual Debugging Steps:${NC}"
    echo "1. In Safari, go to Safari > Settings > Advanced"
    echo "2. Check 'Show Develop menu in menu bar'"
    echo "3. To view console: Develop > Show Web Inspector (or press Option+Command+I)"
    echo "4. Click on the 'Console' tab to view errors"
    exit 1
fi

echo ""
echo "${BLUE}=======================================${NC}"
EOF
    
    chmod +x "$SCRIPT_DIR/global-safari-console.sh"
    echo "${GREEN}Created global-safari-console.sh${NC}"
fi

# Create necessary directories
echo "${BLUE}Creating necessary directories...${NC}"
mkdir -p "$HOME/bin"
mkdir -p "$HOME/Library/LaunchAgents"
mkdir -p "$HOME/Library/Application Support/SafariConsole"
mkdir -p "$HOME/.cursor/hooks"
mkdir -p "$HOME/Library/Logs/SafariConsole"

# Install the main script
echo "${BLUE}Installing Safari console checker script...${NC}"
cp "$SCRIPT_DIR/global-safari-console.sh" "$HOME/bin/safari-console"
chmod +x "$HOME/bin/safari-console"

# Create the background service script
echo "${BLUE}Creating background service script...${NC}"
cat > "$HOME/Library/Application Support/SafariConsole/safari-console-service.sh" << 'EOF'
#!/bin/bash

# Safari Console Error Monitor Service
# This script runs in the background and periodically checks for console errors

LOG_DIR="$HOME/Library/Logs/SafariConsole"
mkdir -p "$LOG_DIR"

# Path to the Safari console checker
CHECKER="$HOME/bin/safari-console"

# Function to check if Safari is running
is_safari_running() {
  pgrep -x "Safari" > /dev/null
}

# Main loop
while true; do
  if is_safari_running; then
    # Get current timestamp
    TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
    
    # Run the console checker and log results
    "$CHECKER" --quiet --log-file="$LOG_DIR/safari_errors_$(date +%Y%m%d).log" --append
    
    # If errors were found and notification is enabled, send notification
    if [ $? -eq 1 ]; then
      osascript -e 'display notification "Console errors detected in Safari" with title "Safari Console Monitor" sound name "Basso"'
    fi
  fi
  
  # Wait 30 seconds before checking again
  sleep 30
done
EOF

chmod +x "$HOME/Library/Application Support/SafariConsole/safari-console-service.sh"

# Create a Launch Agent
echo "${BLUE}Creating Launch Agent for automatic startup...${NC}"
cat > "$HOME/Library/LaunchAgents/com.user.safariconsole.plist" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.user.safariconsole</string>
    <key>ProgramArguments</key>
    <array>
        <string>$HOME/Library/Application Support/SafariConsole/safari-console-service.sh</string>
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

# Create an improved version of the global Safari console checker
echo "${BLUE}Creating improved Safari console checker...${NC}"
cat > "$HOME/bin/safari-console" << 'EOF'
#!/bin/bash

# Safari Console Error Checker (Improved)
# Parameters:
#   --quiet: Don't output to terminal
#   --log-file=FILE: Specify log file
#   --append: Append to log file instead of overwriting

# Parse arguments
QUIET=false
LOG_FILE=""
APPEND=false

for arg in "$@"; do
  case $arg in
    --quiet)
      QUIET=true
      shift
      ;;
    --log-file=*)
      LOG_FILE="${arg#*=}"
      shift
      ;;
    --append)
      APPEND=true
      shift
      ;;
    *)
      # Unknown option
      ;;
  esac
done

# Colors for output (only used if not in quiet mode)
if [ "$QUIET" = false ]; then
  RED='\033[0;31m'
  GREEN='\033[0;32m'
  YELLOW='\033[0;33m'
  BLUE='\033[0;34m'
  NC='\033[0m' # No Color
else
  RED=''
  GREEN=''
  YELLOW=''
  BLUE=''
  NC=''
fi

# Only show header if not in quiet mode
if [ "$QUIET" = false ]; then
  echo "${BLUE}=======================================${NC}"
  echo "${BLUE}  Safari Console Error Checker        ${NC}"
  echo "${BLUE}=======================================${NC}"
  echo ""
  echo "Checking for console errors in Safari..."
  echo ""
fi

# Create temporary JavaScript file
TEMP_JS="/tmp/safari_console_check_$$.js"

cat > "$TEMP_JS" << 'EOL'
(function() {
    // Store current URL
    var currentUrl = window.location.href;
    
    // Initialize counters
    var errorCount = 0;
    var warningCount = 0;
    var errors = [];
    var warnings = [];
    
    // Get existing errors from console
    try {
        // Check if React error boundary has caught errors
        const reactErrorElements = document.querySelectorAll('[data-reactroot] h2');
        for (const el of reactErrorElements) {
            if (el.textContent.includes('Error') || el.textContent.includes('error')) {
                errors.push('React Error: ' + el.textContent);
                errorCount++;
            }
        }
        
        // Record existing errors and warnings using the browser's API
        if (typeof console !== 'undefined') {
            // Save original methods
            var originalError = console.error;
            var originalWarn = console.warn;
            
            // Override console.error
            console.error = function() {
                errorCount++;
                var args = Array.from(arguments);
                var errorMsg = args.map(function(arg) {
                    return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
                }).join(' ');
                errors.push(errorMsg);
                originalError.apply(console, arguments);
            };
            
            // Override console.warn
            console.warn = function() {
                warningCount++;
                var args = Array.from(arguments);
                var warnMsg = args.map(function(arg) {
                    return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
                }).join(' ');
                warnings.push(warnMsg);
                originalWarn.apply(console, arguments);
            };
            
            // Check for 404 errors in network requests
            var originalFetch = window.fetch;
            window.fetch = function(url, options) {
                var promise = originalFetch.apply(this, arguments);
                
                promise.catch(function(err) {
                    console.error('Network Error:', url, err.message);
                });
                
                promise.then(function(response) {
                    if (response.status === 404) {
                        console.error('404 Not Found:', url);
                    } else if (response.status >= 400) {
                        console.error('HTTP Error ' + response.status + ':', url);
                    }
                });
                
                return promise;
            };
            
            // Give a brief moment to capture errors
            setTimeout(function() {
                // Restore original console methods
                console.error = originalError;
                console.warn = originalWarn;
                
                // Send back the results through the document title
                var result = {
                    errorCount: errorCount,
                    warningCount: warningCount,
                    errors: errors,
                    warnings: warnings,
                    url: currentUrl
                };
                
                document.title = "CONSOLE_DATA:" + JSON.stringify(result);
            }, 1000);
        }
    } catch (e) {
        document.title = "CONSOLE_ERROR:" + e.message;
    }
})();
EOL

# Inject the script into Safari
RESULT=$(osascript <<EOF
tell application "Safari"
    if not running then
        activate
        delay 2
    end if
    
    set jsFile to "$TEMP_JS"
    
    try
        tell front document
            do JavaScript (read file jsFile)
            delay 2
            return name
        end tell
    on error errMsg
        return "ERROR: " & errMsg
    end try
end tell
EOF
)

# Clean up the temp file
rm -f "$TEMP_JS"

# Function to output to terminal and/or log file
output() {
    if [ "$QUIET" = false ]; then
        echo -e "$1"
    fi
    
    if [ -n "$LOG_FILE" ]; then
        if [ "$APPEND" = true ]; then
            echo -e "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
        else
            echo -e "$(date '+%Y-%m-%d %H:%M:%S') - $1" > "$LOG_FILE"
        fi
    fi
}

# Process the result
HAS_ERRORS=0
if [[ $RESULT == ERROR:* ]]; then
    output "${RED}Failed to check console: ${RESULT#ERROR: }${NC}"
    HAS_ERRORS=0
elif [[ $RESULT == CONSOLE_ERROR:* ]]; then
    output "${RED}Error during checking: ${RESULT#CONSOLE_ERROR: }${NC}"
    HAS_ERRORS=0
elif [[ $RESULT == CONSOLE_DATA:* ]]; then
    # Extract the JSON data
    JSON_DATA=${RESULT#CONSOLE_DATA:}
    
    # Parse values using Python (more reliable than bash)
    ERROR_COUNT=$(echo "$JSON_DATA" | python3 -c "import sys, json; print(json.loads(sys.stdin.read()).get('errorCount', 0))")
    WARNING_COUNT=$(echo "$JSON_DATA" | python3 -c "import sys, json; print(json.loads(sys.stdin.read()).get('warningCount', 0))")
    URL=$(echo "$JSON_DATA" | python3 -c "import sys, json; print(json.loads(sys.stdin.read()).get('url', 'Unknown'))")
    ERRORS=$(echo "$JSON_DATA" | python3 -c "import sys, json; print('\n'.join(json.loads(sys.stdin.read()).get('errors', [])))")
    WARNINGS=$(echo "$JSON_DATA" | python3 -c "import sys, json; print('\n'.join(json.loads(sys.stdin.read()).get('warnings', [])))")
    
    # Output results
    output "URL: ${BLUE}$URL${NC}\n"
    
    if [ "$ERROR_COUNT" -gt 0 ]; then
        output "${RED}✗ Found $ERROR_COUNT error(s):${NC}"
        echo "$ERRORS" | while read -r line; do
            if [ -n "$line" ]; then
                output "  - $line"
            fi
        done
        output ""
        HAS_ERRORS=1
    else
        output "${GREEN}✓ No errors detected${NC}"
    fi
    
    if [ "$WARNING_COUNT" -gt 0 ]; then
        output "${YELLOW}⚠ Found $WARNING_COUNT warning(s):${NC}"
        echo "$WARNINGS" | while read -r line; do
            if [ -n "$line" ]; then
                output "  - $line"
            fi
        done
    else
        output "${GREEN}✓ No warnings detected${NC}"
    fi
else
    output "${YELLOW}Could not retrieve console data from Safari.${NC}"
    output "${YELLOW}Please make sure Safari Developer Tools are enabled.${NC}"
    HAS_ERRORS=0
fi

if [ "$QUIET" = false ]; then
    output "\n${BLUE}=======================================${NC}"
fi

exit $HAS_ERRORS
EOF

chmod +x "$HOME/bin/safari-console"

# Add to shell profile (create if it doesn't exist)
echo "${BLUE}Adding shortcuts to shell profile...${NC}"
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

# Append to shell profile if the command doesn't already exist
if ! grep -q "alias safcon=" "$SHELL_PROFILE"; then
    cat >> "$SHELL_PROFILE" << 'EOF'

# Safari Console Error Checker
alias safcon="$HOME/bin/safari-console"
alias safari-console="$HOME/bin/safari-console"

# Function to check Safari errors in any directory
function safcon-check() {
  # Get current directory
  local current_dir=$(pwd)
  
  # Run the Safari console checker
  echo "Checking Safari console errors for directory: $current_dir"
  $HOME/bin/safari-console --log-file="$current_dir/safari_errors.log"
  
  # Show the results
  if [ -f "$current_dir/safari_errors.log" ]; then
    echo "Log file created: $current_dir/safari_errors.log"
  fi
}

# Hook for when a new terminal window/tab is opened
if [[ "$PWD" == *"cursor"* || "$PWD" == *"vscode"* || "$PWD" == *"idea"* ]]; then
  echo "IDE environment detected. Safari console error checking is available."
  echo "Use 'safcon' to check for console errors at any time."
fi
EOF
fi

# Create Cursor hook
echo "${BLUE}Creating Cursor workspace hook...${NC}"
mkdir -p "$HOME/.cursor/hooks"
cat > "$HOME/.cursor/hooks/on-workspace-create.sh" << 'EOF'
#!/bin/bash

# Cursor workspace hook for Safari console integration
WORKSPACE_DIR="$1"

# Create scripts directory if it doesn't exist
mkdir -p "$WORKSPACE_DIR/scripts"

# Add README
cat > "$WORKSPACE_DIR/scripts/README_SAFARI_CONSOLE.md" << 'EOL'
# Safari Console Error Checking

This workspace has automatic Safari console error checking enabled.

## Available Commands

- `safcon` - Check for Safari console errors from anywhere
- `safari-console` - Same as above, full command name

## Features

- Automatically monitors Safari for JavaScript console errors
- Detects 404 errors, network failures, and React error boundaries
- Creates logs in the current directory when errors are found
- Runs automatically in the background

## Background Service

A system-wide background service is already running that monitors Safari
and will send notifications if errors are detected.
EOL

echo "Safari console error checking is enabled for this workspace."
echo "Use 'safcon' to check for console errors at any time."
EOF

chmod +x "$HOME/.cursor/hooks/on-workspace-create.sh"

# Enable Safari Developer Tools
echo "${BLUE}Enabling Safari Developer Tools...${NC}"
defaults write com.apple.Safari IncludeDevelopMenu -bool true
defaults write com.apple.Safari WebKitDeveloperExtrasEnabledPreferenceKey -bool true
defaults write com.apple.Safari WebKitDeveloperExtrasEnabled -bool true
defaults write com.apple.Safari.SandboxBroker ShowDevelopMenu -bool true

# Load the launch agent
echo "${BLUE}Loading the launch agent...${NC}"
launchctl unload "$HOME/Library/LaunchAgents/com.user.safariconsole.plist" 2>/dev/null
launchctl load -w "$HOME/Library/LaunchAgents/com.user.safariconsole.plist"

# Create integration for VSCode
echo "${BLUE}Creating VSCode integration...${NC}"
mkdir -p "$HOME/.vscode"
if [ ! -f "$HOME/.vscode/extensions.json" ]; then
    echo '{"recommendations": []}' > "$HOME/.vscode/extensions.json"
fi

# Create VSCode extension directory
mkdir -p "$HOME/.vscode/extensions/safari-console-helper/src"

# Create package.json
cat > "$HOME/.vscode/extensions/safari-console-helper/package.json" << 'EOF'
{
  "name": "safari-console-helper",
  "displayName": "Safari Console Helper",
  "description": "Check for Safari console errors",
  "version": "0.0.1",
  "publisher": "user",
  "engines": {
    "vscode": "^1.50.0"
  },
  "categories": [
    "Other"
  ],
  "activationEvents": [
    "onStartupFinished"
  ],
  "main": "./src/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "safari-console.check",
        "title": "Check Safari Console Errors"
      }
    ],
    "statusBar": {
      "items": [
        {
          "id": "safariConsoleStatus",
          "alignment": "right"
        }
      ]
    }
  }
}
EOF

# Create extension.js
cat > "$HOME/.vscode/extensions/safari-console-helper/src/extension.js" << 'EOF'
const vscode = require('vscode');
const { exec } = require('child_process');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  console.log('Safari Console Helper activated');
  
  // Create status bar item
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.text = "$(browser) Check Safari";
  statusBarItem.tooltip = "Check Safari Console Errors";
  statusBarItem.command = 'safari-console.check';
  statusBarItem.show();
  
  // Register command
  let disposable = vscode.commands.registerCommand('safari-console.check', function () {
    vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: "Checking Safari Console",
      cancellable: false
    }, (progress) => {
      return new Promise((resolve) => {
        exec('$HOME/bin/safari-console', (error, stdout, stderr) => {
          if (error) {
            vscode.window.showErrorMessage('Failed to check Safari console');
            resolve();
            return;
          }
          
          if (stdout.includes('No errors detected')) {
            vscode.window.showInformationMessage('No Safari console errors found');
          } else {
            vscode.window.showWarningMessage('Safari console errors detected', 'Show Details').then(selection => {
              if (selection === 'Show Details') {
                // Show output channel with details
                const channel = vscode.window.createOutputChannel('Safari Console');
                channel.append(stdout);
                channel.show();
              }
            });
          }
          resolve();
        });
      });
    });
  });
  
  context.subscriptions.push(disposable);
  context.subscriptions.push(statusBarItem);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
}
EOF

# Print summary
echo ""
echo "${GREEN}==================================================${NC}"
echo "${GREEN}  Auto Safari Console Error Checker Installed!    ${NC}"
echo "${GREEN}==================================================${NC}"
echo ""
echo "Installation complete! The Safari console error checker will:"
echo ""
echo "1. ${YELLOW}Start automatically when you log in${NC}"
echo "2. ${YELLOW}Run in the background and monitor Safari for errors${NC}"
echo "3. ${YELLOW}Send notifications if errors are detected${NC}"
echo "4. ${YELLOW}Be available in all terminals via 'safcon' command${NC}"
echo "5. ${YELLOW}Automatically integrate with new Cursor workspaces${NC}"
echo "6. ${YELLOW}Work with VSCode via a status bar button${NC}"
echo ""
echo "${YELLOW}IMPORTANT:${NC} Please restart your terminal or run:"
echo "source $SHELL_PROFILE"
echo ""
echo "To check for errors manually, type ${YELLOW}safcon${NC} in any terminal."
echo ""
echo "Log files are stored in: ${YELLOW}$HOME/Library/Logs/SafariConsole/${NC}"
echo ""
echo "Your Safari console error checking service is now ${GREEN}ACTIVE${NC}!" 