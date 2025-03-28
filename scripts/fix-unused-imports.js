/**
 * Fix Unused Imports Script
 * This script parses the TypeScript error output and generates a report of unused imports
 * that can be automatically fixed.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Main function
async function main() {
  console.log('Fixing unused imports in TypeScript files...');
  
  try {
    // Run TypeScript compiler to generate error output
    const tscOutput = execSync('npx tsc --noEmit', { encoding: 'utf8', stdio: 'pipe' });
    
    // Parse error output for unused imports
    const unusedImports = parseUnusedImports(tscOutput);
    
    if (unusedImports.length === 0) {
      console.log('No unused imports found.');
      return;
    }
    
    console.log(`Found ${unusedImports.length} unused imports to fix.`);
    
    // Group by file
    const fileImportMap = unusedImports.reduce((acc, item) => {
      if (!acc[item.filePath]) {
        acc[item.filePath] = [];
      }
      acc[item.filePath].push(item.importName);
      return acc;
    }, {});
    
    // Fix imports in each file
    let fixedCount = 0;
    for (const [filePath, imports] of Object.entries(fileImportMap)) {
      const fullPath = path.resolve(process.cwd(), filePath);
      if (fs.existsSync(fullPath)) {
        const fixed = fixImportsInFile(fullPath, imports);
        if (fixed) fixedCount++;
      } else {
        console.warn(`File not found: ${fullPath}`);
      }
    }
    
    console.log(`Fixed unused imports in ${fixedCount} files.`);
  } catch (error) {
    console.error('Error fixing imports:', error.message);
    process.exit(1);
  }
}

// Function to parse TypeScript output for unused imports
function parseUnusedImports(tscOutput) {
  const regex = /'([^']+)' is declared but its value is never read/;
  const filePathRegex = /^(.+\.tsx?):/;
  
  const unusedImports = [];
  let currentFilePath = null;
  
  for (const line of tscOutput.split('\n')) {
    // Check if line has a file path
    const filePathMatch = line.match(filePathRegex);
    if (filePathMatch) {
      currentFilePath = filePathMatch[1];
    }
    
    // Check if line has an unused import error
    const match = line.match(regex);
    if (match && currentFilePath) {
      unusedImports.push({
        filePath: currentFilePath,
        importName: match[1]
      });
    }
  }
  
  return unusedImports;
}

// Function to fix imports in a file
function fixImportsInFile(filePath, unusedImports) {
  if (!unusedImports || unusedImports.length === 0) return false;
  
  console.log(`Fixing imports in ${filePath}`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Process each unused import
    unusedImports.forEach(importName => {
      // Match different import patterns
      // Named import from: import { X, unused, Y } from 'module'
      let regex = new RegExp(`import\\s*\\{([^}]*)${importName}([^}]*)\\}\\s*from\\s*['"][^'"]+['"]`, 'g');
      
      if (regex.test(content)) {
        // Fix named imports
        content = content.replace(regex, (match, before, after) => {
          // Clean up the import statement
          const cleanBefore = before.replace(/,\s*$/, '');
          const cleanAfter = after.replace(/^\s*,/, '');
          
          if (!cleanBefore && !cleanAfter) {
            // If it was the only import, remove the entire statement
            return '';
          }
          
          return `import {${cleanBefore}${cleanBefore && cleanAfter ? ',' : ''}${cleanAfter}} from 'module'`;
        });
        
        modified = true;
      } else {
        // Default import: import unused from 'module'
        regex = new RegExp(`import\\s+${importName}\\s+from\\s+['"][^'"]+['"]`, 'g');
        if (regex.test(content)) {
          content = content.replace(regex, '');
          modified = true;
        }
      }
    });
    
    if (modified) {
      // Clean up empty lines and double newlines
      content = content.replace(/^\s*[\r\n]/gm, '').replace(/\n\s*\n/g, '\n\n');
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
  
  return false;
}

// Run the script
main().catch(console.error); 