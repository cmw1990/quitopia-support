#!/bin/bash

# Installer for Global Safari Console Error Checker
# This script installs the Safari console error checker globally
# so it can be used in any directory or Cursor workspace

# Colors for better output readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "${BLUE}=== Installing Global Safari Console Error Checker ===${NC}"

# Define the install directory (~/bin is typically in PATH)
INSTALL_DIR="$HOME/bin"

# Create the install directory if it doesn't exist
if [ ! -d "$INSTALL_DIR" ]; then
    echo "Creating directory $INSTALL_DIR..."
    mkdir -p "$INSTALL_DIR"
fi

# Check if the directory is in PATH
if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
    echo "${YELLOW}Warning: $INSTALL_DIR is not in your PATH${NC}"
    echo "Adding it to your shell configuration..."
    
    # Determine which shell configuration file to use
    SHELL_CONFIG=""
    if [ -f "$HOME/.zshrc" ]; then
        SHELL_CONFIG="$HOME/.zshrc"
    elif [ -f "$HOME/.bashrc" ]; then
        SHELL_CONFIG="$HOME/.bashrc"
    elif [ -f "$HOME/.bash_profile" ]; then
        SHELL_CONFIG="$HOME/.bash_profile"
    fi
    
    if [ -n "$SHELL_CONFIG" ]; then
        echo "export PATH=\"\$PATH:$INSTALL_DIR\"" >> "$SHELL_CONFIG"
        echo "${GREEN}Added $INSTALL_DIR to your PATH in $SHELL_CONFIG${NC}"
        echo "Please restart your terminal or run 'source $SHELL_CONFIG' for changes to take effect"
    else
        echo "${RED}Could not find a shell configuration file (.zshrc, .bashrc, or .bash_profile)${NC}"
        echo "Please manually add $INSTALL_DIR to your PATH"
    fi
fi

# Copy the script to the install directory
SCRIPT_SOURCE="$(dirname "$0")/global-safari-console.sh"
SCRIPT_DEST="$INSTALL_DIR/safari-console"

echo "Installing script to $SCRIPT_DEST..."
cp "$SCRIPT_SOURCE" "$SCRIPT_DEST"
chmod +x "$SCRIPT_DEST"

# Set up Safari Developer Tools
echo "${BLUE}Setting up Safari Developer Tools...${NC}"
defaults write com.apple.Safari IncludeDevelopMenu -bool true
defaults write com.apple.Safari WebKitDeveloperExtrasEnabledPreferenceKey -bool true
defaults write com.apple.Safari WebKitPreferences.developerExtrasEnabled -bool true
defaults write com.apple.Safari WebKitDeveloperExtras -bool true

# Create a cursor workspace initialization script
CURSOR_DIR="$HOME/.cursor"
CURSOR_SCRIPTS_DIR="$CURSOR_DIR/scripts"

if [ ! -d "$CURSOR_SCRIPTS_DIR" ]; then
    echo "Creating Cursor scripts directory..."
    mkdir -p "$CURSOR_SCRIPTS_DIR"
fi

CURSOR_INIT_SCRIPT="$CURSOR_SCRIPTS_DIR/safari-console-init.sh"

echo "Creating Cursor workspace initialization script at $CURSOR_INIT_SCRIPT..."
cat > "$CURSOR_INIT_SCRIPT" << 'EOL'
#!/bin/bash

# Cursor Workspace Safari Console Setup
# This script is automatically run when a Cursor workspace is loaded

# Check if Safari Developer Tools are enabled
if ! defaults read com.apple.Safari IncludeDevelopMenu &>/dev/null; then
    echo "Enabling Safari Developer Tools..."
    defaults write com.apple.Safari IncludeDevelopMenu -bool true
    defaults write com.apple.Safari WebKitDeveloperExtrasEnabledPreferenceKey -bool true
    defaults write com.apple.Safari WebKitPreferences.developerExtrasEnabled -bool true
    defaults write com.apple.Safari WebKitDeveloperExtras -bool true
fi

# Check if safari-console is installed
if ! command -v safari-console &>/dev/null; then
    echo "Safari console checker not found in PATH."
    echo "You can install it by running the install-safari-console.sh script from the original project."
fi

echo "Safari console checking is available."
echo "Use the 'safari-console' command to check for console errors in Safari."
EOL

chmod +x "$CURSOR_INIT_SCRIPT"

# Create a function for .zshrc or .bashrc to make debugging easier
echo "Creating shell function for easy access..."
SHELL_FUNCTION='
# Function to check Safari console errors
safcon() {
    if command -v safari-console &>/dev/null; then
        safari-console "$@"
    else
        echo "Safari console checker not found. Please install it first."
        echo "Run the install-safari-console.sh script from the original project."
    fi
}
'

if [ -f "$HOME/.zshrc" ]; then
    echo "$SHELL_FUNCTION" >> "$HOME/.zshrc"
    echo "${GREEN}Added safcon function to .zshrc${NC}"
elif [ -f "$HOME/.bashrc" ]; then
    echo "$SHELL_FUNCTION" >> "$HOME/.bashrc"
    echo "${GREEN}Added safcon function to .bashrc${NC}"
fi

echo "${GREEN}Installation complete!${NC}"
echo ""
echo "You can now run '${YELLOW}safari-console${NC}' from any directory to check Safari console errors."
echo "You can also use the shorter alias '${YELLOW}safcon${NC}' for the same purpose."
echo ""
echo "For Cursor workspaces, the Safari console checker will be automatically initialized."
echo ""
echo "${BLUE}IMPORTANT:${NC} Please restart your terminal for all changes to take effect." 