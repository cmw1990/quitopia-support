#!/bin/bash

# Master Installation Script for Safari Console Error Checking
# This script installs both the global command and Cursor workspace integration

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Print banner
echo "${BLUE}=================================================${NC}"
echo "${BLUE}  Safari Console Error Checking - Installation   ${NC}"
echo "${BLUE}=================================================${NC}"
echo ""
echo "This will install a comprehensive solution for checking"
echo "Safari console errors directly from the command line."
echo ""
echo "The installation includes:"
echo "1. A global 'safari-console' command"
echo "2. A shell alias 'safcon'"
echo "3. Automatic setup for new Cursor workspaces"
echo "4. Safari Developer Tools configuration"
echo ""
echo -n "Do you want to proceed with the installation? [y/N] "
read -r answer

if [[ ! "$answer" =~ ^[Yy]$ ]]; then
    echo "Installation cancelled."
    exit 0
fi

echo ""
echo "${BLUE}Step 1: Making all scripts executable...${NC}"
chmod +x "$SCRIPT_DIR"/*.sh

echo ""
echo "${BLUE}Step 2: Installing global Safari console command...${NC}"
"$SCRIPT_DIR/install-safari-console.sh"

echo ""
echo "${BLUE}Step 3: Setting up Cursor workspace integration...${NC}"
"$SCRIPT_DIR/cursor-workspace.sh"

echo ""
echo "${BLUE}Step 4: Verifying installation...${NC}"

# Check if ~/bin is in PATH
if [[ ":$PATH:" == *":$HOME/bin:"* ]]; then
    echo "${GREEN}✓ ~/bin is in PATH${NC}"
else
    echo "${YELLOW}⚠ ~/bin is not in PATH yet. You'll need to restart your terminal.${NC}"
fi

# Check if safari-console is installed
if [ -f "$HOME/bin/safari-console" ]; then
    echo "${GREEN}✓ safari-console command is installed${NC}"
else
    echo "${RED}✗ safari-console command installation failed${NC}"
fi

# Check if Cursor hooks are set up
if [ -f "$HOME/.cursor/hooks/on-workspace-create.sh" ]; then
    echo "${GREEN}✓ Cursor workspace integration is set up${NC}"
else
    echo "${RED}✗ Cursor workspace integration failed${NC}"
fi

# Check Safari Developer Tools
if defaults read com.apple.Safari IncludeDevelopMenu &>/dev/null; then
    echo "${GREEN}✓ Safari Developer Tools are enabled${NC}"
else
    echo "${YELLOW}⚠ Safari Developer Tools could not be enabled automatically${NC}"
    echo "  Please enable them manually in Safari > Settings > Advanced"
fi

echo ""
echo "${GREEN}==================================================${NC}"
echo "${GREEN}  Safari Console Error Checking is now installed  ${NC}"
echo "${GREEN}==================================================${NC}"
echo ""
echo "To check Safari console errors:"
echo "- From any directory: ${YELLOW}safcon${NC} or ${YELLOW}safari-console${NC}"
echo "- In this project: ${YELLOW}./scripts/check-safari-errors.sh${NC}"
echo ""
echo "To check network errors: ${YELLOW}./scripts/check-safari-network.sh${NC}"
echo ""
echo "To start development with Safari: ${YELLOW}./scripts/dev-safari.sh${NC}"
echo ""
echo "${YELLOW}IMPORTANT:${NC} Please restart your terminal for all changes to take effect."
echo "After restarting, you can use the 'safcon' command from anywhere."
echo ""
echo "For more information, see:"
echo "${YELLOW}$SCRIPT_DIR/SAFARI_CONSOLE_README.md${NC}" 