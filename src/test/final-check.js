const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function aggregateErrorReports() {
  const reportTypes = [
    'chrome-results/comprehensive-error-report.json',
    'chrome-results/visual-consistency-report.json',
    'chrome-results/database-check-report.json'
  ];

  const consolidatedReport = {
    overallStatus: 'PASSED',
    errorSummary: {
      consoleErrors: 0,
      networkErrors: 0,
      uiInconsistencies: 0,
      databaseIssues: 0
    },
    detailedReports: {}
  };

  reportTypes.forEach(reportPath => {
    try {
      const fullPath = path.resolve(reportPath);
      if (fs.existsSync(fullPath)) {
        const reportContent = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        consolidatedReport.detailedReports[path.basename(reportPath)] = reportContent;

        // Analyze and count errors
        if (reportPath.includes('comprehensive-error-report')) {
          Object.values(reportContent.consoleErrors).forEach(errors => {
            consolidatedReport.errorSummary.consoleErrors += errors.length;
          });
          Object.values(reportContent.networkErrors).forEach(errors => {
            consolidatedReport.errorSummary.networkErrors += errors.length;
          });
        }

        if (reportPath.includes('visual-consistency-report')) {
          Object.values(reportContent.colorInconsistencies).forEach(inconsistencies => {
            consolidatedReport.errorSummary.uiInconsistencies += inconsistencies.length;
          });
        }

        if (reportPath.includes('database-check-report')) {
          if (!reportContent.connectionStatus) {
            consolidatedReport.errorSummary.databaseIssues++;
          }
        }
      }
    } catch (error) {
      console.error(`Error processing report ${reportPath}:`, error);
    }
  });

  // Determine overall status
  if (
    consolidatedReport.errorSummary.consoleErrors > 0 ||
    consolidatedReport.errorSummary.networkErrors > 0 ||
    consolidatedReport.errorSummary.uiInconsistencies > 0 ||
    consolidatedReport.errorSummary.databaseIssues > 0
  ) {
    consolidatedReport.overallStatus = 'FAILED';
  }

  // Generate HTML report for easy reading
  const htmlReport = `
<!DOCTYPE html>
<html>
<head>
  <title>Comprehensive Test Report</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    .status { 
      padding: 10px; 
      text-align: center; 
      font-weight: bold;
      color: white;
      background-color: ${consolidatedReport.overallStatus === 'PASSED' ? 'green' : 'red'};
    }
    .error-summary { margin-top: 20px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
  </style>
</head>
<body>
  <div class="status">${consolidatedReport.overallStatus} - Comprehensive Test Report</div>
  
  <div class="error-summary">
    <h2>Error Summary</h2>
    <table>
      <tr>
        <th>Error Type</th>
        <th>Count</th>
      </tr>
      <tr>
        <td>Console Errors</td>
        <td>${consolidatedReport.errorSummary.consoleErrors}</td>
      </tr>
      <tr>
        <td>Network Errors</td>
        <td>${consolidatedReport.errorSummary.networkErrors}</td>
      </tr>
      <tr>
        <td>UI Inconsistencies</td>
        <td>${consolidatedReport.errorSummary.uiInconsistencies}</td>
      </tr>
      <tr>
        <td>Database Issues</td>
        <td>${consolidatedReport.errorSummary.databaseIssues}</td>
      </tr>
    </table>
  </div>
</body>
</html>
  `;

  // Write consolidated report
  fs.writeFileSync('./chrome-results/final-test-report.json', JSON.stringify(consolidatedReport, null, 2));
  fs.writeFileSync('./chrome-results/final-test-report.html', htmlReport);

  // If any errors found, exit with non-zero status
  if (consolidatedReport.overallStatus === 'FAILED') {
    console.error('Comprehensive tests detected issues. See report for details.');
    process.exit(1);
  }

  return consolidatedReport;
}

// Run all test scripts before aggregating
try {
  execSync('npm run test:chrome', { stdio: 'inherit' });
  execSync('npm run test:visual', { stdio: 'inherit' });
  execSync('npm run test:database', { stdio: 'inherit' });
} catch (error) {
  console.error('Test execution failed:', error);
  process.exit(1);
}

// Aggregate and analyze reports
const finalReport = aggregateErrorReports();
console.log('Comprehensive Test Report:', finalReport);