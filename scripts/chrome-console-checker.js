#!/usr/bin/env node

/**
 * Chrome Console Error Checker
 * 
 * This script connects to Chrome's remote debugging protocol to capture console errors.
 * 
 * Usage:
 *   1. Start Chrome with remote debugging enabled:
 *      /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222
 *   2. Run this script:
 *      node chrome-console-checker.js [url]
 */

import fetch from 'node-fetch';
import WebSocket from 'ws';
import chalk from 'chalk';

const TARGET_URL = process.argv[2] || 'http://localhost:5176';

async function getDebuggerUrl() {
  try {
    const response = await fetch('http://localhost:9222/json');
    const pages = await response.json();
    
    // Find the tab with our target URL or use the first available tab
    const targetPage = pages.find(page => page.url.includes(TARGET_URL)) || pages[0];
    
    if (!targetPage) {
      console.error(chalk.red('No debugging targets found. Is Chrome running with --remote-debugging-port=9222?'));
      process.exit(1);
    }
    
    return targetPage.webSocketDebuggerUrl;
  } catch (error) {
    console.error(chalk.red('Failed to connect to Chrome debugging port:'), error.message);
    console.error(chalk.yellow('Make sure Chrome is running with remote debugging enabled:'));
    console.error(chalk.yellow('/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --remote-debugging-port=9222'));
    process.exit(1);
  }
}

async function connectToChrome() {
  const debuggerUrl = await getDebuggerUrl();
  const ws = new WebSocket(debuggerUrl);
  
  let messageId = 1;
  
  ws.on('open', () => {
    console.log(chalk.green('Connected to Chrome debugger'));
    console.log(chalk.blue('Monitoring console messages...'));
    console.log(chalk.blue('Press Ctrl+C to exit'));
    
    // Enable console events
    ws.send(JSON.stringify({
      id: messageId++,
      method: 'Runtime.enable'
    }));
    
    // Enable network events (optional)
    ws.send(JSON.stringify({
      id: messageId++,
      method: 'Network.enable'
    }));
  });
  
  ws.on('message', (data) => {
    const message = JSON.parse(data);
    
    // Handle console messages
    if (message.method === 'Runtime.consoleAPICalled') {
      const logEntry = message.params;
      const args = logEntry.args.map(arg => arg.value || arg.description || JSON.stringify(arg)).join(' ');
      
      switch (logEntry.type) {
        case 'error':
          console.log(chalk.red(`ERROR: ${args}`));
          break;
        case 'warning':
          console.log(chalk.yellow(`WARNING: ${args}`));
          break;
        case 'info':
          console.log(chalk.blue(`INFO: ${args}`));
          break;
        default:
          console.log(chalk.gray(`LOG: ${args}`));
      }
    }
    
    // Handle JavaScript exceptions
    if (message.method === 'Runtime.exceptionThrown') {
      const exception = message.params.exceptionDetails;
      console.log(chalk.red.bold('EXCEPTION:'), chalk.red(exception.text));
      
      if (exception.stackTrace) {
        console.log(chalk.red('Stack trace:'));
        exception.stackTrace.callFrames.forEach((frame, index) => {
          console.log(chalk.red(`  ${index}: ${frame.functionName || '(anonymous)'} at ${frame.url}:${frame.lineNumber}:${frame.columnNumber}`));
        });
      }
    }
    
    // Handle network errors (optional)
    if (message.method === 'Network.loadingFailed') {
      console.log(chalk.red(`NETWORK ERROR: ${message.params.errorText} for resource: ${message.params.requestId}`));
    }
  });
  
  ws.on('error', (error) => {
    console.error(chalk.red('WebSocket error:'), error.message);
  });
  
  ws.on('close', () => {
    console.log(chalk.yellow('Disconnected from Chrome debugger'));
    process.exit(0);
  });
  
  // Handle script termination
  process.on('SIGINT', () => {
    console.log(chalk.yellow('\nClosing connection...'));
    ws.close();
  });
}

// Start the tool
console.log(chalk.blue(`Connecting to Chrome and monitoring ${TARGET_URL}...`));
connectToChrome(); 