#!/usr/bin/env node

/**
 * Simple application check script for Mission Fresh
 * This script verifies that the app server is running properly
 */

import http from 'http';

const urls = [
  'http://localhost:5001/',
  'http://localhost:5001/auth'
];

console.log('Mission Fresh App Check Tool');
console.log('===========================');

// Check each URL sequentially
async function checkUrls() {
  let allPassed = true;
  
  for (const url of urls) {
    try {
      const result = await checkUrl(url);
      if (result.success) {
        console.log(`✅ ${url} - OK (${result.statusCode})`);
      } else {
        console.error(`❌ ${url} - FAILED (${result.statusCode})`);
        allPassed = false;
      }
    } catch (error) {
      console.error(`❌ ${url} - ERROR: ${error.message}`);
      allPassed = false;
    }
  }
  
  if (allPassed) {
    console.log('\n✅ All checks passed! Application is running properly.');
  } else {
    console.error('\n❌ Some checks failed. Please check the server logs.');
  }
  
  return allPassed;
}

// Function to check a single URL
function checkUrl(url) {
  return new Promise((resolve, reject) => {
    const request = http.get(url, (response) => {
      // Success if status code is 200-399
      const success = response.statusCode >= 200 && response.statusCode < 400;
      
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        resolve({
          success,
          statusCode: response.statusCode,
          contentLength: data.length
        });
      });
    });
    
    request.on('error', (error) => {
      reject(error);
    });
    
    // Set a timeout of 10 seconds
    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Request timed out'));
    });
  });
}

// Run the checks
checkUrls().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error(`Fatal error: ${error.message}`);
  process.exit(1);
}); 