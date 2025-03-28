# Safari Console Error Checking Solution

A set of scripts to automatically check for JavaScript console errors in Safari during development.

## Available Scripts

### Global Commands

- `safcon` - Check Safari for console errors from anywhere on your system
- `safari-console` - Same as above (full name)

### Project Scripts

- `install-safcon.sh` - Install the global Safari console error checker
- `check-safari-errors.sh` - Project-specific script to check Safari console errors
- `check-safari-network.sh` - Project-specific script to check Safari network errors
- `dev-safari.sh` - Start development server and open in Safari
- `enable-safari-dev.sh` - Enable Safari Developer Tools

## Quick Start

### Project-Specific Usage

1. Start the dev server with Safari:
   ```
   ./scripts/dev-safari.sh
   ```

2. Check for console errors:
   ```
   ./scripts/check-safari-errors.sh
   ```

3. Check for network errors:
   ```
   ./scripts/check-safari-network.sh
   ```

### Global Usage (Run Once)

To install the global Safari console error checker:

```bash
./scripts/install-safcon.sh
```

After installation, simply type `safcon` in any terminal to check Safari for console errors.

## Features

- Automatically detects JavaScript errors and warnings in Safari
- Works with React error boundaries
- Shows errors directly in the terminal
- Global command available from any project
- Integrates with Cursor workspaces to provide automatic reminders

## Troubleshooting

If you see errors when running the scripts:

1. Make sure Safari is running and has a web page loaded
2. Enable Safari Developer Tools manually:
   - Open Safari
   - Go to Safari > Settings > Advanced
   - Check "Show Develop menu in menu bar"
3. Check that the console checker is installed:
   ```
   which safcon
   ```
   Should return `/Users/your-username/bin/safcon`

# Mission Fresh Developer Tools

This directory contains developer tools to help with debugging and fixing common issues in the Mission Fresh application.

## Chrome Console Checker

The Chrome Console Checker is a powerful tool that connects to Chrome's remote debugging protocol to capture and display console errors in real-time. This is especially useful for debugging client-side issues that may not be apparent from build logs.

### Usage

Simply run the provided shell script:

```bash
./check-console.sh [url]
```

This will:
1. Start Chrome with remote debugging enabled
2. Navigate to the specified URL (or default to http://localhost:5176)
3. Display all console messages, with special formatting for errors and warnings
4. Capture JavaScript exceptions with stack traces
5. Monitor network errors

Press `Ctrl+C` to stop monitoring and close Chrome.

### Example Output

```
🔍 Chrome Console Error Checker
===============================
Connected to Chrome debugger
Monitoring console messages...

ERROR: Uncaught TypeError: Cannot read properties of undefined (reading 'toLowerCase')
EXCEPTION: Uncaught TypeError: Cannot read properties of undefined (reading 'toLowerCase')
Stack trace:
  0: formatName at http://localhost:5176/src/components/NRTDirectory/ProductDetails.tsx:142:28
  1: renderProduct at http://localhost:5176/src/components/NRTDirectory/ProductDetails.tsx:201:15
  2: (anonymous) at http://localhost:5176/src/components/NRTDirectory/ProductDetails.tsx:325:12
```

### Requirements

- Chrome browser installed at the default location
- Node.js v14 or higher
- `node-fetch`, `ws`, and `chalk` npm packages (installed in package.json)

## NRT Imports Fixer

This tool automatically fixes import errors in the NRT Directory component by analyzing the API file and ProductDetails.tsx to find the correct function names.

### Usage

```bash
node scripts/fix-nrt-imports.js
```

### What it does

1. Analyzes the `api.ts` file to find all exported functions
2. Identifies the missing imports in `ProductDetails.tsx`
3. Uses pattern matching to find the best replacement for each missing import
4. Updates the imports in `ProductDetails.tsx` automatically
5. Reports the changes and confidence level for each replacement

### Example Output

```
🔍 Analyzing NRT Directory files to fix import errors...
Found 15 exported functions in api.ts
Detected missing imports: getVendors, getCountryInfo, trackAffiliateClick

Proposed replacements:
- getVendors → fetchVendors (Confidence: 100%)
- getCountryInfo → getCountryData (Confidence: 75%)
- trackAffiliateClick → recordAffiliateClick (Confidence: 80%)

✅ ProductDetails.tsx has been updated with corrected imports!

To verify the changes, run:
npm run dev
```

## Success Tracker

The Success Tracker tool verifies that all features have been successfully implemented and are functioning at 100% completion.

### Usage

```bash
node scripts/successTracker.js
```

This will verify the status of all features in SSOT5001.md and produce a summary report. 