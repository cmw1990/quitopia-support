const fs = require('fs');
const path = require('path');

class ComprehensiveErrorAnalyzer {
  constructor() {
    this.errorLog = path.resolve('./chrome-results/comprehensive-error-log.json');
    this.screenshotDir = path.resolve('./chrome-results');
  }

  async analyzeTestResults() {
    const results = {
      timestamp: new Date().toISOString(),
      criticalErrors: [],
      warningErrors: [],
      performanceIssues: []
    };

    // Scan chrome-results for error screenshots
    const errorScreenshots = fs.readdirSync(this.screenshotDir)
      .filter(file => file.includes('error') || file.includes('critical'));

    errorScreenshots.forEach(screenshot => {
      results.criticalErrors.push({
        file: screenshot,
        path: path.join(this.screenshotDir, screenshot)
      });
    });

    // Additional error detection mechanisms
    const consoleLogFiles = fs.readdirSync(this.screenshotDir)
      .filter(file => file.endsWith('.log'));

    consoleLogFiles.forEach(logFile => {
      const logContent = fs.readFileSync(path.join(this.screenshotDir, logFile), 'utf-8');
      const errors = this.extractErrorsFromLog(logContent);
      results.warningErrors.push(...errors);
    });

    // Performance and UX analysis
    results.performanceIssues = this.checkPerformanceMetrics();

    // Write comprehensive error report
    fs.writeFileSync(this.errorLog, JSON.stringify(results, null, 2));
    
    return results;
  }

  extractErrorsFromLog(logContent) {
    const errorPatterns = [
      /error/i,
      /failed/i,
      /warning/i,
      /exception/i,
      /critical/i
    ];

    return errorPatterns
      .map(pattern => 
        logContent.split('\n')
          .filter(line => pattern.test(line))
          .map(line => ({ message: line, pattern: pattern.toString() }))
      )
      .flat();
  }

  checkPerformanceMetrics() {
    const performanceIssues = [];

    // Check browser console for performance warnings
    const consoleLogPath = path.resolve('./chrome-results/console.log');
    if (fs.existsSync(consoleLogPath)) {
      const consoleContent = fs.readFileSync(consoleLogPath, 'utf-8');
      if (consoleContent.includes('performance')) {
        performanceIssues.push({
          type: 'Console Performance Warning',
          details: 'Potential performance bottlenecks detected'
        });
      }
    }

    // Add more sophisticated performance checks here
    return performanceIssues;
  }

  generateSummaryReport(results) {
    const summaryPath = path.resolve('./chrome-results/error-summary.md');
    const summaryContent = `
# Comprehensive Error Analysis Report

## Critical Errors
${results.criticalErrors.map(err => `- ${err.file}`).join('\n')}

## Warning Errors
${results.warningErrors.map(err => `- ${err.message}`).join('\n')}

## Performance Issues
${results.performanceIssues.map(issue => `- ${issue.type}: ${issue.details}`).join('\n')}

Generated: ${results.timestamp}
`;

    fs.writeFileSync(summaryPath, summaryContent);
  }

  async runFullAnalysis() {
    try {
      const results = await this.analyzeTestResults();
      this.generateSummaryReport(results);
      console.log('Comprehensive error analysis completed.');
    } catch (error) {
      console.error('Error during comprehensive analysis:', error);
    }
  }
}

// Execute the analysis
const analyzer = new ComprehensiveErrorAnalyzer();
analyzer.runFullAnalysis();