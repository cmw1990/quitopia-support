#!/bin/bash

# Script to automate Safari permission granting including GUI automation
# This approach uses AppleScript to navigate through System Settings

echo "===== SAFARI FULL ACCESS ENABLER ====="
echo "Setting Safari developer permissions..."

# First, kill any running Safari instances
killall Safari 2>/dev/null
sleep 1

# Apply all the Safari developer settings through defaults
defaults write com.apple.Safari IncludeDevelopMenu -bool true
defaults write com.apple.Safari WebKitDeveloperExtrasEnabledPreferenceKey -bool true
defaults write com.apple.Safari WebKitDeveloperExtrasEnabled -bool true
defaults write com.apple.Safari WebKitPreferences.developerExtrasEnabled -bool true
defaults write com.apple.Safari WebKitDeveloperExtras -bool true
defaults write com.apple.Safari IncludeInternalDebugMenu -bool true
defaults write com.apple.Safari.SandboxBroker ShowDevelopMenu -bool true

# Try to automate System Settings for permissions with AppleScript
echo "Attempting to open System Settings and grant permissions..."

# Create AppleScript file for automation
SCRIPT_FILE=$(mktemp)

cat > "$SCRIPT_FILE" << 'EOL'
tell application "System Settings"
    activate
    delay 1
    
    # Navigate to Privacy & Security
    tell application "System Events"
        keystroke "f" using {command down}
        delay 0.5
        keystroke "Privacy & Security"
        delay 1
        keystroke return
        delay 2
        
        # Try to find and click on various permission types
        set permissionTypes to {"Screen Recording", "Camera", "Microphone", "Accessibility", "Full Disk Access", "Files and Folders"}
        
        repeat with permType in permissionTypes
            # Try to search for each permission type
            keystroke "f" using {command down}
            delay 0.5
            keystroke permType
            delay 1
            keystroke return
            delay 2
            
            # Try to find and click on Safari in the list of apps
            # This part is tricky and may need to be adjusted based on your macOS version
            try
                click button "+" of group 1 of window 1
                delay 1
                
                # Type "Safari" to find the app
                keystroke "Safari"
                delay 1
                keystroke return
                delay 1
                
                # Try to confirm any prompts
                try
                    click button "Allow" of sheet 1 of window 1
                end try
            end try
            
            # Go back to main Privacy & Security
            keystroke "," using {command down}
            delay 1
        end repeat
    end tell
    
    # Quit System Settings
    quit
end tell

# Launch Safari after all permissions set
tell application "Safari"
    activate
    delay 1
    open location "http://localhost:5001/"
end tell
EOL

# Execute the AppleScript
echo "Executing GUI automation script to set permissions..."
osascript "$SCRIPT_FILE"

# Clean up
rm -f "$SCRIPT_FILE"

echo ""
echo "===== SAFARI ACCESS SETUP COMPLETE ====="
echo "* Safari Developer menu should now be enabled"
echo "* System has attempted to grant additional permissions"
echo ""
echo "NOTE: Some permissions might still require manual approval"
echo "To view Web Inspector, press Option+Command+I in Safari" 