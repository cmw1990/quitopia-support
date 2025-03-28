#!/bin/bash

# Direct Safari permissions script - No sudo required version
# Focuses on development permissions that don't require system-level access

# Kill Safari if running
killall Safari 2>/dev/null
sleep 1

echo "Setting essential Safari development permissions..."

# Enable all Safari developer features
defaults write com.apple.Safari IncludeDevelopMenu -bool true
defaults write com.apple.Safari WebKitDeveloperExtrasEnabledPreferenceKey -bool true
defaults write com.apple.Safari WebKitDeveloperExtrasEnabled -bool true
defaults write com.apple.Safari WebKitPreferences.developerExtrasEnabled -bool true
defaults write com.apple.Safari WebKitDeveloperExtras -bool true
defaults write com.apple.Safari IncludeInternalDebugMenu -bool true
defaults write com.apple.Safari AllowJavaScriptFromAppleEvents -bool true

# Enable debugging and remote debugging
defaults write com.apple.Safari RemoteInspectionEnabled -bool true
defaults write com.apple.Safari "com.apple.Safari.ContentPageGroupIdentifier.WebKit2DeveloperExtrasEnabled" -bool true
defaults write com.apple.Safari "com.apple.Safari.ContentPageGroupIdentifier.WebKit2RemoteInspectionEnabled" -bool true
defaults write com.apple.Safari DidShowWebInspectorMigratePrompt -bool true

# Developer-friendly settings
defaults write com.apple.Safari ShowFullURLInSmartSearchField -bool true
defaults write com.apple.Safari WebKitPreferences.javaScriptCanOpenWindowsAutomatically -bool true
defaults write com.apple.Safari "com.apple.Safari.ContentPageGroupIdentifier.WebKit2JavaScriptCanOpenWindowsAutomatically" -bool true
defaults write com.apple.Safari "com.apple.Safari.ContentPageGroupIdentifier.WebKit2TabsToLinks" -bool true

# Allow media autoplay for easier testing
defaults write com.apple.Safari WebKitMediaPlaybackAllowsInline -bool true
defaults write com.apple.Safari "com.apple.Safari.ContentPageGroupIdentifier.WebKit2MediaPlaybackAllowsInline" -bool true

# Show develop in the menu bar
defaults write com.apple.Safari.SandboxBroker ShowDevelopMenu -bool true

# Restart Safari with these settings
echo "Launching Safari with developer permissions enabled..."
open -a Safari "http://localhost:5001/"

echo "Development permissions have been set for Safari."
echo "Launching Safari - now you should see the Develop menu in the menu bar."
echo "To open Web Inspector, press Option+Command+I once Safari is open." 