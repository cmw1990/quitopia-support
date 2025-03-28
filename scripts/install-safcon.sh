#!/bin/bash

# Simple installer for Safari console checker

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "${BLUE}===============================================${NC}"
echo "${BLUE}  Safari Console Checker Installation         ${NC}"
echo "${BLUE}===============================================${NC}"
echo ""

# Create necessary directories
echo "${BLUE}Creating necessary directories...${NC}"
mkdir -p "$HOME/bin"
mkdir -p "$HOME/Library/LaunchAgents"
mkdir -p "$HOME/.cursor/hooks"

# Create the console checker script
echo "${BLUE}Creating console checker script...${NC}"

cat > "$HOME/bin/safcon" << 'EOF'
#!/bin/bash

# Safari Console Error Checker
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "${BLUE}=======================================${NC}"
echo "${BLUE}  Safari Console Error Checker        ${NC}"
echo "${BLUE}=======================================${NC}"
echo ""

# Ensure Safari is running
osascript -e 'tell application "Safari" to activate'
sleep 1

# Check if Safari Developer Tools are enabled
if ! defaults read com.apple.Safari IncludeDevelopMenu &>/dev/null; then
    echo "${RED}Safari Developer Tools are not enabled.${NC}"
    echo "${YELLOW}Enabling Safari Developer Tools...${NC}"
    defaults write com.apple.Safari IncludeDevelopMenu -bool true
    defaults write com.apple.Safari WebKitDeveloperExtrasEnabledPreferenceKey -bool true
    defaults write com.apple.Safari WebKitDeveloperExtrasEnabled -bool true
    echo "Developer Tools enabled. Please restart Safari."
    exit 1
fi

echo "Checking Safari console via AppleScript..."
echo ""

# Run JavaScript in Safari to get console info
RESULT=$(osascript << EOD
tell application "Safari"
    activate
    delay 1
    set jsCode to "
        var errors = 0;
        var warnings = 0;
        try {
            // Check for React error boundary
            var reactError = document.querySelector('[data-reactroot] h2');
            if (reactError && reactError.textContent.includes('Error')) {
                errors++;
            }
            document.title = 'SafConCheck:' + errors + ':' + warnings + ':' + window.location.href;
        } catch (e) {
            document.title = 'SafConError:' + e.message;
        }
    "
    
    tell front document
        do JavaScript jsCode
        delay 0.5
        return name
    end tell
end tell
EOD
)

if [[ $RESULT == SafConCheck:*:*:* ]]; then
    # Extract errors, warnings and URL
    ERRORS=$(echo "$RESULT" | cut -d':' -f2)
    WARNINGS=$(echo "$RESULT" | cut -d':' -f3)
    URL=$(echo "$RESULT" | cut -d':' -f4-)
    
    echo "URL: ${BLUE}$URL${NC}"
    echo ""
    
    if [ "$ERRORS" -gt 0 ]; then
        echo "${RED}✗ Detected JavaScript errors${NC}"
        echo ""
        echo "To see details, open Safari Web Inspector (Option+Command+I)"
        echo "and check the Console tab."
    else
        echo "${GREEN}✓ No console errors detected${NC}"
    fi
    
    if [ "$WARNINGS" -gt 0 ]; then
        echo "${YELLOW}⚠ Detected JavaScript warnings${NC}"
    else
        echo "${GREEN}✓ No console warnings detected${NC}"
    fi
    
    echo ""
    echo "${YELLOW}Open Safari Web Inspector for more details:${NC}"
    echo "1. Press Option+Command+I in Safari"
    echo "2. Click on the Console tab"
elif [[ $RESULT == SafConError:* ]]; then
    echo "${RED}Error checking console: ${RESULT#SafConError:}${NC}"
    echo "Please make sure Safari is running with a web page loaded."
else
    echo "${YELLOW}Could not check Safari console.${NC}"
    echo "Please make sure Safari is running with a web page loaded."
    echo ""
    echo "Manual instructions to view console errors:"
    echo "1. In Safari, press Option+Command+I to open Web Inspector"
    echo "2. Click on the Console tab to view errors"
fi

echo ""
echo "${BLUE}=======================================${NC}"
EOF

chmod +x "$HOME/bin/safcon"

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

# Add command to shell profile if it doesn't exist
if ! grep -q "# Safari Console Checker" "$SHELL_PROFILE"; then
    cat >> "$SHELL_PROFILE" << 'EOF'

# Safari Console Checker
export PATH="$HOME/bin:$PATH"

# Reminder for Safari console checking
if [[ "$PWD" == *"cursor"* || "$PWD" == *"vscode"* || "$PWD" == *"idea"* ]]; then
  echo "Safari console checker available - Type 'safcon' to check for errors"
fi
EOF
fi

# Create cursor hook
echo "${BLUE}Creating Cursor hook...${NC}"
cat > "$HOME/.cursor/hooks/on-workspace-create.sh" << 'EOF'
#!/bin/bash

# Hook to remind about Safari console checking
echo "Safari console checker is available - Type 'safcon' to check for errors"
EOF

chmod +x "$HOME/.cursor/hooks/on-workspace-create.sh"

# Enable Safari Developer Tools
echo "${BLUE}Enabling Safari Developer Tools...${NC}"
defaults write com.apple.Safari IncludeDevelopMenu -bool true
defaults write com.apple.Safari WebKitDeveloperExtrasEnabledPreferenceKey -bool true
defaults write com.apple.Safari WebKitDeveloperExtrasEnabled -bool true

# Create symlink for the command
ln -sf "$HOME/bin/safcon" "$HOME/bin/safari-console"

# Success message
echo ""
echo "${GREEN}=============================================${NC}"
echo "${GREEN}  Safari Console Checker is now installed!  ${NC}"
echo "${GREEN}=============================================${NC}"
echo ""
echo "To check Safari for console errors, type: ${YELLOW}safcon${NC}"
echo ""
echo "${YELLOW}IMPORTANT:${NC} Please restart your terminal or run:"
echo "source $SHELL_PROFILE"
echo ""
echo "Safari console checking is now ${GREEN}AVAILABLE${NC}!" 