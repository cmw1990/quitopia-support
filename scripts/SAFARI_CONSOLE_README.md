# Safari Console Error Checking

This directory contains a comprehensive solution for checking Safari console errors directly from the command line, making it easy to debug web applications in Safari without constantly having to open the Web Inspector.

## Available Scripts

### 1. Individual Project Scripts

These scripts are designed for use within this specific project:

- **`check-safari-errors.sh`**: Checks for JavaScript console errors in Safari
- **`check-safari-network.sh`**: Checks for network-related errors in Safari
- **`dev-safari.sh`**: Launches the development server and opens Safari
- **`open-safari-dev.sh`**: Opens Safari with developer tools for a specific URL

### 2. Global Installation Scripts

These scripts set up Safari console error checking for use anywhere:

- **`global-safari-console.sh`**: The main script for checking Safari console errors
- **`install-safari-console.sh`**: Installs the console error checker globally
- **`cursor-workspace.sh`**: Sets up automatic console checking for Cursor workspaces

## Quick Start

1. **For this project only**:
   ```bash
   # Start development server with Safari
   ./scripts/dev-safari.sh
   
   # Check for console errors
   ./scripts/check-safari-errors.sh
   
   # Check for network errors
   ./scripts/check-safari-network.sh
   ```

2. **For global installation**:
   ```bash
   # Install the console checker globally
   ./scripts/install-safari-console.sh
   
   # Configure Cursor workspaces to automatically include console checking
   ./scripts/cursor-workspace.sh
   ```

## Global Installation Details

The global installation:

1. **Installs `safari-console` command** to your PATH
2. **Adds `safcon` alias** to your shell configuration
3. **Configures Cursor** to add console checking scripts to new workspaces
4. **Enables Safari Developer Tools** automatically

After installation, you can check Safari console errors from any directory:

```bash
# Using the full command
safari-console

# Using the short alias
safcon
```

## Cursor Workspace Integration

After running `cursor-workspace.sh`, all new Cursor workspaces will automatically:

1. Include Safari console checking scripts in the `scripts/` directory
2. Have a README explaining how to use them
3. Support the global `safcon` command

To use in a new workspace:
```bash
# Start development with Safari
./scripts/safari-dev.sh

# Check console errors
./scripts/safari-console.sh
```

## Manual Safari Settings

For the best experience, ensure Safari's Developer Tools are enabled:

1. Open Safari
2. Go to Safari > Settings > Advanced
3. Check "Show Develop menu in menu bar"

## Features

- Captures both console errors and warnings
- Detects React error boundary issues
- Identifies failed network requests
- Shows real-time console output
- Saves logs to file for later analysis
- Works with Safari's sandboxed security model
- Designed for macOS and Cursor IDE integration

## Troubleshooting

If you see "Error: Could not retrieve console data from Safari", make sure:

1. Safari is running and a page is loaded
2. Developer Tools are enabled in Safari settings
3. The page is fully loaded before checking

Advanced debugging:
```bash
# Manual Web Inspector access
Option+Command+I in Safari
``` 