#!/bin/bash

# Script to check Safari console errors using osascript

echo "Checking Safari for console errors..."
echo "Note: Make sure Safari's Web Inspector is open (Option+Command+I)"

# Get the current URL that Safari is viewing
CURRENT_URL=$(osascript -e 'tell application "Safari" to get URL of current tab of front window')

# Display the current URL
echo "Current URL: $CURRENT_URL"

# Create a temporary JavaScript file to extract console logs
TEMP_JS_FILE=$(mktemp)

cat > $TEMP_JS_FILE << 'EOL'
function checkConsoleErrors() {
    // Store original console methods
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    
    // Storage for errors
    let errors = [];
    let warnings = [];
    
    // Override console.error
    console.error = function() {
        errors.push(Array.from(arguments).join(' '));
        originalConsoleError.apply(console, arguments);
    };
    
    // Override console.warn
    console.warn = function() {
        warnings.push(Array.from(arguments).join(' '));
        originalConsoleWarn.apply(console, arguments);
    };
    
    // Send the collected errors/warnings back
    setTimeout(() => {
        document.title = "SAFARI_ERRORS:" + JSON.stringify({errors, warnings});
    }, 500);
}
checkConsoleErrors();
EOL

# Execute the JavaScript in Safari to check for console errors
echo "Injecting error detection script..."
osascript -e 'tell application "Safari" to tell document 1 to do JavaScript (read file "'$TEMP_JS_FILE'")'

# Wait for the script to execute
sleep 1

# Get the document title which should now contain the error data
TITLE=$(osascript -e 'tell application "Safari" to get name of document 1')

# Clean up
rm $TEMP_JS_FILE

# Extract and display errors/warnings if any were found
if [[ $TITLE == SAFARI_ERRORS:* ]]; then
    JSON_DATA=${TITLE#SAFARI_ERRORS:}
    echo "$JSON_DATA" > /tmp/safari_errors.json
    
    # Extract and display errors
    echo ""
    ERRORS=$(echo "$JSON_DATA" | python3 -c "import json,sys; data=json.loads(sys.stdin.read()); print(len(data['errors']))")
    if [ "$ERRORS" -gt 0 ]; then
        echo "⚠️ CONSOLE ERRORS ($ERRORS found):"
        echo "$JSON_DATA" | python3 -c "import json,sys; data=json.loads(sys.stdin.read()); [print(f' - {e}') for e in data['errors']]"
    else
        echo "✅ No console errors detected"
    fi
    
    # Extract and display warnings
    WARNINGS=$(echo "$JSON_DATA" | python3 -c "import json,sys; data=json.loads(sys.stdin.read()); print(len(data['warnings']))")
    if [ "$WARNINGS" -gt 0 ]; then
        echo ""
        echo "⚠️ CONSOLE WARNINGS ($WARNINGS found):"
        echo "$JSON_DATA" | python3 -c "import json,sys; data=json.loads(sys.stdin.read()); [print(f' - {w}') for w in data['warnings']]"
    else
        echo "✅ No console warnings detected"
    fi
else
    echo "❌ Error: Unable to retrieve console errors. Make sure Safari's Developer Tools are enabled and Web Inspector is open."
    echo "   Safari title was: $TITLE"
fi

echo ""
echo "For manual inspection, press Option+Command+I in Safari to open the Web Inspector." 