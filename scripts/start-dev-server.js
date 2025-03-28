#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Get the project root directory
const rootDir = path.resolve(__dirname, '..');

// Start the development server with vite
const server = spawn('npm', ['run', 'dev', '--', '--port', '5005'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true
});

// Handle process exit
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.kill('SIGINT');
  process.exit(0);
});

// Log any errors
server.on('error', (err) => {
  console.error('Failed to start development server:', err);
});

console.log('Starting development server on port 5005...'); 