#!/usr/bin/env node

/**
 * TypeScript Error Finder and Fixer
 * 
 * This script helps identify and fix common TypeScript errors in the codebase.
 * It can:
 * 1. Scan for type errors using the TypeScript compiler API
 * 2. Categorize errors by type and frequency
 * 3. Apply automated fixes for common error patterns
 * 4. Generate reports on error distributions
 */

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import readline from 'readline';

// Define __filename and __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');

// Error categories
const ERROR_CATEGORIES = {
  MISSING_PROPERTY: 'Property does not exist on type',
  TYPE_MISMATCH: 'is not assignable to parameter of type',
  MODULE_EXPORT: 'has no exported member',
  MODULE_IMPORT: 'Cannot find module',
  DEFAULT_EXPORT: 'has no default export',
  UNKNOWN_TYPE: 'Object is of type \'unknown\'',
  INCOMPLETE_TYPE: 'missing the following properties from type',
};

// Common fixable patterns
const COMMON_FIXES = {
  MISSING_TOAST: {
    pattern: /Property '(error|success|info|warning)' does not exist on type '.*Toast.*'/,
    fix: (file, match) => ({
      message: `Install react-hot-toast package. Add: import toast from 'react-hot-toast'`,
      automated: false
    })
  },
  OFFLINE_CONTEXT: {
    pattern: /Property '(isOfflineModeEnabled|setOfflineModeEnabled|syncPendingChanges|pendingSyncCount)' does not exist on type 'OfflineContextType'/,
    fix: (file, match) => ({
      message: `Update OfflineContext to include ${match[1]} property`,
      automated: false
    })
  },
  MODULE_IMPORT_PATH: {
    pattern: /Cannot find module '(@\/components\/.*|react-hot-toast)'/,
    fix: (file, match) => ({
      message: `Fix import path: ${match[1]} -> likely needs a path correction`,
      automated: false
    })
  }
};

// Run TypeScript compiler to get errors
function runTsc() {
  return new Promise((resolve, reject) => {
    exec('npx tsc --noEmit', { cwd: projectRoot }, (error, stdout, stderr) => {
      if (stderr) {
        console.error('TypeScript error output:', stderr);
      }
      resolve(stdout);
    });
  });
}

// Parse TypeScript errors
function parseErrors(tscOutput) {
  const errors = [];
  const lines = tscOutput.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('.ts') && line.includes('error TS')) {
      const parts = line.split(':');
      const filePath = parts[0].trim();
      const lineNum = parseInt(parts[1], 10);
      const colNum = parseInt(parts[2], 10);
      
      // Extract error code and message
      const errorMatch = line.match(/error TS(\d+): (.*)/);
      if (errorMatch) {
        const errorCode = errorMatch[1];
        const errorMessage = errorMatch[2];
        
        errors.push({
          filePath: path.relative(projectRoot, filePath),
          line: lineNum,
          column: colNum,
          code: errorCode,
          message: errorMessage
        });
      }
    }
  }
  
  return errors;
}

// Group errors by category
function groupErrorsByCategory(errors) {
  const grouped = {
    byCategory: {},
    byFile: {},
    total: errors.length
  };
  
  for (const error of errors) {
    // Categorize error
    let category = 'OTHER';
    for (const [key, pattern] of Object.entries(ERROR_CATEGORIES)) {
      if (error.message.includes(pattern)) {
        category = key;
        break;
      }
    }
    
    // Group by category
    if (!grouped.byCategory[category]) {
      grouped.byCategory[category] = [];
    }
    grouped.byCategory[category].push(error);
    
    // Group by file
    if (!grouped.byFile[error.filePath]) {
      grouped.byFile[error.filePath] = [];
    }
    grouped.byFile[error.filePath].push(error);
  }
  
  return grouped;
}

// Find and fix common errors
function findFixableErrors(errors) {
  const fixable = [];
  
  for (const error of errors) {
    for (const [fixType, fixInfo] of Object.entries(COMMON_FIXES)) {
      const match = error.message.match(fixInfo.pattern);
      if (match) {
        const fix = fixInfo.fix(error.filePath, match);
        fixable.push({
          ...error,
          fixType,
          fixMessage: fix.message,
          automated: fix.automated
        });
        break;
      }
    }
  }
  
  return fixable;
}

// Generate error report
function generateReport(grouped, fixable) {
  const reportPath = path.join(projectRoot, 'typescript-errors-report.md');
  
  let report = `# TypeScript Errors Report\n\n`;
  report += `## Summary\n\n`;
  report += `- Total errors: ${grouped.total}\n`;
  report += `- Fixable errors: ${fixable.length}\n`;
  report += `- Files with errors: ${Object.keys(grouped.byFile).length}\n\n`;
  
  report += `## Errors by Category\n\n`;
  for (const [category, errors] of Object.entries(grouped.byCategory)) {
    report += `### ${category} (${errors.length})\n\n`;
    for (const error of errors.slice(0, 5)) { // Show only first 5 examples
      report += `- \`${error.filePath}:${error.line}\`: ${error.message}\n`;
    }
    if (errors.length > 5) {
      report += `- *(${errors.length - 5} more...)*\n`;
    }
    report += '\n';
  }
  
  report += `## Files with Most Errors\n\n`;
  const sortedFiles = Object.entries(grouped.byFile)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 10);
  
  for (const [file, errors] of sortedFiles) {
    report += `- ${file}: ${errors.length} errors\n`;
  }
  
  report += `\n## Fixable Errors\n\n`;
  for (const error of fixable) {
    report += `- \`${error.filePath}:${error.line}\`: ${error.message}\n`;
    report += `  - Suggested fix: ${error.fixMessage}\n`;
    report += `  - Automated: ${error.automated ? 'Yes' : 'No'}\n\n`;
  }
  
  fs.writeFileSync(reportPath, report);
  console.log(`Error report saved to ${reportPath}`);
}

// Main function
async function main() {
  console.log('Scanning for TypeScript errors...');
  const tscOutput = await runTsc();
  
  const errors = parseErrors(tscOutput);
  console.log(`Found ${errors.length} errors`);
  
  const grouped = groupErrorsByCategory(errors);
  const fixable = findFixableErrors(errors);
  
  generateReport(grouped, fixable);
  
  console.log(`Fixable errors: ${fixable.length}`);
  if (fixable.length > 0) {
    console.log('Errors that can be automatically fixed:');
    const automatedFixable = fixable.filter(e => e.automated);
    console.log(`${automatedFixable.length} errors can be automatically fixed`);
  } else {
    console.log('No errors could be automatically fixed');
  }
}

// Run the script
main().catch(error => {
  console.error('Error running TypeScript error analyzer:', error);
  process.exit(1);
}); 