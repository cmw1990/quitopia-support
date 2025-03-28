#!/bin/bash

# Make directory if it doesn't exist
mkdir -p $(dirname "$0")

# Script to open Safari with Developer Tools and load the application
URL=${1:-"http://localhost:5001"}

# Kill any existing Safari processes to start fresh
echo "Closing any existing Safari windows..."
killall Safari 2>/dev/null

# Wait a moment for Safari to close
sleep 1

# Start Safari and navigate to the URL
echo "Opening Safari and navigating to $URL..."
open -a Safari "$URL"

# Give Safari time to load
sleep 2

echo "-----------------------------------"
echo "Safari Developer Tools Instructions:"
echo "-----------------------------------"
echo "1. In Safari, go to Safari > Settings > Advanced"
echo "2. Check 'Show Develop menu in menu bar'"
echo "3. To view console: Develop > Show Web Inspector (or press Option+Command+I)"
echo "4. Click on the 'Console' tab to view errors"
echo ""
echo "To check for console errors, run:"
echo "./scripts/check-safari-errors.sh"
echo ""
echo "Safari is now open at: $URL" 