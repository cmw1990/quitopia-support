// Simple HTTP server to test if we can serve static files
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = http.createServer((req, res) => {
  console.log(`Request for ${req.url}`);
  
  // Root path serves an HTML test page
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test Server</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #0ea5e9; }
            .container { max-width: 800px; margin: 0 auto; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Test Server Running</h1>
            <p>This server is running correctly on port 5002.</p>
            <p>You can test different paths:</p>
            <ul>
              <li><a href="/test.css">Test CSS file</a></li>
              <li><a href="/test.js">Test JS file</a></li>
            </ul>
          </div>
        </body>
      </html>
    `);
  } 
  // Serve a test CSS file
  else if (req.url === '/test.css') {
    res.writeHead(200, { 'Content-Type': 'text/css' });
    res.end(`
      body {
        background-color: #f5f5f5;
        color: #333;
      }
      h1 {
        color: #0ea5e9;
      }
    `);
  }
  // Serve a test JS file
  else if (req.url === '/test.js') {
    res.writeHead(200, { 'Content-Type': 'application/javascript' });
    res.end(`
      console.log('Test JavaScript file loaded successfully');
      alert('Test JavaScript file loaded successfully');
    `);
  }
  // 404 for anything else
  else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
});

const PORT = 5002;
server.listen(PORT, () => {
  console.log(`Test server running at http://localhost:${PORT}/`);
  console.log(`Try accessing: http://localhost:${PORT}/test.css`);
}); 