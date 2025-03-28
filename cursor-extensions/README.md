# Cursor Browser Error Monitor Extensions

This directory contains extensions that capture browser console errors and send them to Cursor IDE for debugging.

## Features

- Real-time monitoring of browser console errors
- Automatic scanning of multiple pages
- Source mapping for better error location
- Direct integration with Cursor IDE

## Available Extensions

### 1. Safari Console Monitor

Uses Playwright to capture console errors from Safari and send them to Cursor.

```bash
npm run cursor:safari [url]
```

### 2. Chrome Console Monitor

Uses Playwright to capture console errors from Chrome with advanced stack trace and source mapping support.

```bash
npm run cursor:chrome [url]
```

### 3. Puppeteer Auto Monitor

Automatically checks a list of routes for console errors and sends a report to Cursor.

```bash
npm run cursor:auto [url]
```

### 4. Deep Scanner

Scans your site by following links and checking each page for errors.

```bash
npm run cursor:scan [url]
```

## Installation

These extensions require the following packages:

```bash
npm install --save-dev puppeteer playwright
```

## Usage in Other Workspaces

To use these extensions in other workspaces:

1. Copy the `cursor-extensions` directory to your project
2. Add the scripts to your `package.json`:

```json
"scripts": {
  "cursor:safari": "node cursor-extensions/playwright-safari-console.js",
  "cursor:chrome": "node cursor-extensions/playwright-chrome-console.js",
  "cursor:auto": "node cursor-extensions/puppeteer-auto-monitor.js",
  "cursor:scan": "node cursor-extensions/puppeteer-auto-monitor.js --scan-links --depth=2"
}
```

3. Update the `TARGET_URL` in each script if needed (defaults to `http://localhost:5003/`)

## Customization

Each extension can be customized:

- Update `ROUTES_TO_CHECK` array in `puppeteer-auto-monitor.js` to scan specific routes
- Modify error display format in `writeErrorsToCursor()` functions
- Adjust scan depth and link following behavior with command-line arguments

## Error Reports

Error reports are saved as JSON files in the `cursor-extensions` directory:

- `safari-errors.json`: Errors from Safari
- `chrome-errors.json`: Errors from Chrome
- `puppeteer-errors.json`: Errors from automatic scans

## How It Works

1. The extension launches a browser and navigates to your app
2. Console errors and exceptions are captured via browser event listeners
3. Errors are formatted and saved to a JSON file
4. Cursor is launched with the error file as an argument

## Troubleshooting

- If browser doesn't launch, you may need to install the browsers for Playwright:
  ```bash
  npx playwright install chromium
  npx playwright install webkit
  ```

- If Cursor doesn't open with the error file, check that Cursor is installed at the expected path:
  ```
  /Applications/Cursor.app/Contents/MacOS/Cursor
  ```
  Update the `CURSOR_PATH` in the scripts if needed. 