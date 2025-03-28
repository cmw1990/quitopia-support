#!/usr/bin/env node

/**
 * Type Error Finder
 * 
 * This script analyzes TypeScript compilation errors and categorizes them
 * to make it easier to fix them systematically.
 * 
 * Usage: 
 *   node scripts/type-error-finder.js
 * 
 * Output:
 *   - Console output with categorized errors
 *   - A JSON file with all errors categorized (type-errors-report.json)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Categories of errors we want to identify
const ERROR_CATEGORIES = {
  PROP_TYPE_MISMATCH: 'Property type mismatch',
  MISSING_PROPERTY: 'Missing property',
  UNDEFINED_TYPE: 'Undefined type or module',
  GENERIC_TYPE_ISSUE: 'Generic type usage issue',
  API_TYPE_MISMATCH: 'API response type mismatch',
  NULL_UNDEFINED_ERROR: 'Null or undefined error',
  OTHER: 'Other errors'
};

// Patterns to identify error categories
const ERROR_PATTERNS = [
  { 
    pattern: /is not assignable to parameter of type|is not assignable to type/i, 
    category: ERROR_CATEGORIES.PROP_TYPE_MISMATCH 
  },
  { 
    pattern: /Property '.*?' does not exist on type/i, 
    category: ERROR_CATEGORIES.MISSING_PROPERTY 
  },
  { 
    pattern: /Cannot find module|Cannot find name|has no exported member/i, 
    category: ERROR_CATEGORIES.UNDEFINED_TYPE 
  },
  { 
    pattern: /Expected \d+ type arguments?, but got \d+/i, 
    category: ERROR_CATEGORIES.GENERIC_TYPE_ISSUE 
  },
  { 
    pattern: /Type '.*?' is missing the following properties from type '.*?': length, pop, push/i, 
    category: ERROR_CATEGORIES.API_TYPE_MISMATCH 
  },
  { 
    pattern: /is possibly 'null'|is possibly 'undefined'|'.*?' is of type 'unknown'/i, 
    category: ERROR_CATEGORIES.NULL_UNDEFINED_ERROR 
  }
];

// Function to categorize an error message
function categorizeError(errorMessage) {
  for (const { pattern, category } of ERROR_PATTERNS) {
    if (pattern.test(errorMessage)) {
      return category;
    }
  }
  return ERROR_CATEGORIES.OTHER;
}

// Main function
function findTypeErrors() {
  console.log('Running TypeScript type check...');
  
  let tscOutput;
  try {
    // Use tsc to get compilation errors without emitting files
    tscOutput = execSync('npx tsc --noEmit', { encoding: 'utf-8' });
  } catch (error) {
    tscOutput = error.stdout;
  }

  // Parse error messages from tsc output
  const errorRegex = /^([^(]+)\((\d+),(\d+)\):\s+error\s+TS(\d+):\s+(.+)$/gm;
  const errors = [];
  let match;

  while ((match = errorRegex.exec(tscOutput)) !== null) {
    const [, filePath, line, column, errorCode, errorMessage] = match;
    errors.push({
      filePath: filePath.trim(),
      line: parseInt(line, 10),
      column: parseInt(column, 10),
      errorCode: `TS${errorCode}`,
      errorMessage: errorMessage.trim(),
      category: categorizeError(errorMessage)
    });
  }

  // Generate report
  const errorsByCategory = {};
  const errorsByFile = {};

  // Initialize categories
  Object.values(ERROR_CATEGORIES).forEach(category => {
    errorsByCategory[category] = [];
  });

  // Categorize errors
  errors.forEach(error => {
    errorsByCategory[error.category].push(error);
    
    if (!errorsByFile[error.filePath]) {
      errorsByFile[error.filePath] = [];
    }
    errorsByFile[error.filePath].push(error);
  });

  // Write report to file
  const report = {
    summary: {
      totalErrors: errors.length,
      errorsByCategory: Object.fromEntries(
        Object.entries(errorsByCategory).map(([category, errors]) => [category, errors.length])
      ),
      totalFiles: Object.keys(errorsByFile).length
    },
    errorsByCategory,
    errorsByFile
  };

  fs.writeFileSync(
    path.join(process.cwd(), 'type-errors-report.json'), 
    JSON.stringify(report, null, 2)
  );

  // Print summary to console
  console.log('\n=== TypeScript Error Report ===\n');
  console.log(`Total errors: ${errors.length}`);
  console.log(`Affected files: ${Object.keys(errorsByFile).length}`);
  console.log('\nErrors by category:');
  Object.entries(errorsByCategory).forEach(([category, categoryErrors]) => {
    console.log(`  ${category}: ${categoryErrors.length}`);
  });

  console.log('\nTop 10 files with most errors:');
  Object.entries(errorsByFile)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 10)
    .forEach(([filePath, fileErrors]) => {
      console.log(`  ${filePath}: ${fileErrors.length} errors`);
    });

  console.log('\nDetailed report written to type-errors-report.json');
  console.log('\nRecommendation: Fix errors by category, starting with:');
  console.log('1. Missing modules and undefined types');
  console.log('2. API response type mismatches');
  console.log('3. Generic type usage issues');
  console.log('4. Property type mismatches');
}

// Run the script
findTypeErrors(); 