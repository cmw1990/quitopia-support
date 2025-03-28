#!/bin/bash

# Script to help check for Safari console errors
# SSOT8001 compliant

# Display instructions
echo "===================================="
echo "Safari Console Error Checker"
echo "===================================="
echo ""
echo "To check for console errors in Safari:"
echo ""
echo "1. Open Safari Developer Menu"
echo "   Press Option+Command+I or go to Safari -> Develop -> Show Web Inspector"
echo ""
echo "2. Navigate to the Console tab"
echo ""
echo "3. Look for any red error messages or yellow warnings"
echo ""
echo "4. Copy any errors you find to fix them"
echo ""
echo "5. After fixing, refresh the page and check again"
echo ""
echo "===================================="
echo ""

# Ask if user wants to open Safari Web Inspector
read -p "Do you want to open Safari Web Inspector? (y/n) " answer

if [[ $answer =~ ^[Yy]$ ]]; then
  osascript <<EOD
    tell application "Safari"
      activate
      tell application "System Events"
        keystroke "i" using {option down, command down}
      end tell
    end tell
EOD
  echo "Web Inspector should now be open. Check the Console tab for errors."
else
  echo "Please open Web Inspector manually to check for console errors."
fi

echo ""
echo "Remember to check all routes for console errors."
echo "====================================" 