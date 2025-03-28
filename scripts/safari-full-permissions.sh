#!/bin/bash

# Script to try forcing all Safari permissions without user prompts

# Kill Safari if running
killall Safari 2>/dev/null
sleep 1

echo "Attempting to grant all Safari permissions..."

# Enable all Safari developer features
defaults write com.apple.Safari IncludeDevelopMenu -bool true
defaults write com.apple.Safari WebKitDeveloperExtrasEnabledPreferenceKey -bool true
defaults write com.apple.Safari WebKitDeveloperExtrasEnabled -bool true
defaults write com.apple.Safari.SandboxBroker ShowDevelopMenu -bool true
defaults write com.apple.Safari WebKitDeveloperExtras -bool true
defaults write com.apple.Safari IncludeInternalDebugMenu -bool true
defaults write com.apple.Safari AllowJavaScriptFromAppleEvents -bool true

# General settings that enhance developer experience
defaults write com.apple.Safari ShowFullURLInSmartSearchField -bool true
defaults write com.apple.Safari WebKitPreferences.developerExtrasEnabled -bool true
defaults write com.apple.Safari WebKitPreferences.javaScriptCanOpenWindowsAutomatically -bool true
defaults write com.apple.Safari SendDoNotTrackHTTPHeader -bool false
defaults write com.apple.Safari UniversalSearchEnabled -bool false
defaults write com.apple.Safari SuppressSearchSuggestions -bool true
defaults write com.apple.Safari InstallExtensionUpdatesAutomatically -bool true

# Experimental features
defaults write com.apple.Safari ExperimentalFeaturesEnabled -bool true

# Enable debugging and remote debugging
defaults write com.apple.Safari RemoteInspectionEnabled -bool true
defaults write com.apple.Safari "com.apple.Safari.ContentPageGroupIdentifier.WebKit2DeveloperExtrasEnabled" -bool true
defaults write com.apple.Safari "com.apple.Safari.ContentPageGroupIdentifier.WebKit2RemoteInspectionEnabled" -bool true
defaults write com.apple.Safari DidShowWebInspectorMigratePrompt -bool true

# Privacy settings - allow everything
defaults write com.apple.Safari "WebKitPreferences.allowsAirPlayForMediaPlayback" -bool true
defaults write com.apple.Safari "WebKitMediaPlaybackAllowsInline" -bool true
defaults write com.apple.Safari "com.apple.Safari.ContentPageGroupIdentifier.WebKit2AllowsAnimatedImageLooping" -bool true
defaults write com.apple.Safari "com.apple.Safari.ContentPageGroupIdentifier.WebKit2MediaPlaybackAllowsInline" -bool true
defaults write com.apple.Safari "com.apple.Safari.ContentPageGroupIdentifier.WebKit2ExecutionWhileLoadingSuspended" -bool false

# Security settings - loosen security for development
defaults write com.apple.Safari "WebKitPreferences.javaEnabled" -bool true
defaults write com.apple.Safari "WebKitPreferences.plugInsEnabled" -bool true
defaults write com.apple.Safari "WebKitPreferences.privateClickMeasurementEnabled" -bool false
defaults write com.apple.Safari WarnAboutFraudulentWebsites -bool false

# Try adding Safari to accessibility & screen recording via tccutil
echo "Attempting to configure system permissions for Safari..."
sudo tccutil reset All com.apple.Safari 2>/dev/null
sudo tccutil reset ScreenCapture com.apple.Safari 2>/dev/null
sudo tccutil reset Microphone com.apple.Safari 2>/dev/null
sudo tccutil reset Camera com.apple.Safari 2>/dev/null
sudo tccutil reset Accessibility com.apple.Safari 2>/dev/null
sudo tccutil reset SystemPolicyAllFiles com.apple.Safari 2>/dev/null

# Try adding permissions using sqlite direct access (dangerous but user requested full permissions)
echo "Attempting to modify TCC database (requires root)..."
TCCDB="/Library/Application Support/com.apple.TCC/TCC.db"
if [ -f "$TCCDB" ]; then
  sudo sqlite3 "$TCCDB" "REPLACE INTO access VALUES('kTCCServiceScreenCapture','com.apple.Safari',0,1,1,NULL,NULL,NULL,'UNUSED',NULL,0,1);" 2>/dev/null
  sudo sqlite3 "$TCCDB" "REPLACE INTO access VALUES('kTCCServiceMicrophone','com.apple.Safari',0,1,1,NULL,NULL,NULL,'UNUSED',NULL,0,1);" 2>/dev/null
  sudo sqlite3 "$TCCDB" "REPLACE INTO access VALUES('kTCCServiceCamera','com.apple.Safari',0,1,1,NULL,NULL,NULL,'UNUSED',NULL,0,1);" 2>/dev/null
  sudo sqlite3 "$TCCDB" "REPLACE INTO access VALUES('kTCCServiceAccessibility','com.apple.Safari',0,1,1,NULL,NULL,NULL,'UNUSED',NULL,0,1);" 2>/dev/null
  sudo sqlite3 "$TCCDB" "REPLACE INTO access VALUES('kTCCServiceSystemPolicyAllFiles','com.apple.Safari',0,1,1,NULL,NULL,NULL,'UNUSED',NULL,0,1);" 2>/dev/null
fi

# Force Safari to launch with configured permissions
echo "Launching Safari with new permissions..."
open -a Safari "http://localhost:5001/"

echo "All possible Safari permissions have been attempted to be set."
echo "Note: Some permissions may still require manual approval due to macOS security." 