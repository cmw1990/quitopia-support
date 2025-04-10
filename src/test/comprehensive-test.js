const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class ComprehensiveTestSuite {
  constructor() {
    this.testResults = {
      chromeCheck: null,
      visualCheck: null,
      databaseCheck: null,
      errorMonitor: null
    };
    this.reportPath = './chrome-results/comprehensive-test-report.json';
  }

  runChromeCheck() {
    try {
      execSync('node src/test/chrome-check.js', { stdio: 'inherit' });
      this.testResults.chromeCheck = {
        status: 'PASSED',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.testResults.chromeCheck = {
        status: 'FAILED',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  runVisualCheck() {
    try {
      execSync('node src/test/visual-check.js', { stdio: 'inherit' });
      this.testResults.visualCheck = {
        status: 'PASSED',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.testResults.visualCheck = {
        status: 'FAILED',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  runDatabaseCheck() {
    try {
      execSync('node src/test/database-check.js', { stdio: 'inherit' });
      this.testResults.databaseCheck = {
        status: 'PASSED',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.testResults.databaseCheck = {
        status: 'FAILED',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  runErrorMonitor() {
    try {
      execSync('node src/test/error-monitor.js', { stdio: 'inherit' });
      this.testResults.errorMonitor = {
        status: 'PASSED',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.testResults.errorMonitor = {
        status: 'FAILED',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  generateHtmlReport() {
    const reportHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Comprehensive Test Report</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    .test-result { 
      margin: 10px 0; 
      padding: 10px; 
      border-radius: 5px; 
    }
    .passed { background-color: #dff0d8; color: #3c763d; }
    .failed { background-color: #f2dede; color: #a94442; }
  </style>
</head>
<body>
  <h1>Comprehensive Test Report</h1>
  ${Object.entries(this.testResults).map(([testName, result]) => `
    <div class="test-result ${result.status === 'PASSED' ? 'passed' : 'failed'}">
      <h2>${testName}</h2>
      <p>Status: ${result.status}</p>
      <p>Timestamp: ${result.timestamp}</p>
      ${result.error ? `<p>Error: ${result.error}</p>` : ''}
    </div>
  `).join('')}
</body>
</html>
    `;

    fs.writeFileSync('./chrome-results/comprehensive-test-report.html', reportHtml);
  }

  saveTestResults() {
    fs.writeFileSync(
      this.reportPath, 
      JSON.stringify(this.testResults, null, 2)
    );
  }

  determineOverallStatus() {
    const failedTests = Object.values(this.testResults)
      .filter(result => result.status === 'FAILED');

    if (failedTests.length > 0) {
      console.error('Some tests failed. See detailed report.');
      process.exit(1);
    }

    console.log('All tests passed successfully!');
  }

  runComprehensiveTestSuite() {
    this.runChromeCheck();
    this.runVisualCheck();
    this.runDatabaseCheck();
    this.runErrorMonitor();
    
    this.saveTestResults();
    this.generateHtmlReport();
    this.determineOverallStatus();
  }
}

// Execute the comprehensive test suite
const testSuite = new ComprehensiveTestSuite();
testSuite.runComprehensiveTestSuite();