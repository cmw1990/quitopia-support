#!/usr/bin/env node

/**
 * Import Path Fixer for Mission Fresh Codebase
 * 
 * This script analyzes TypeScript/React files in the restructured codebase
 * and helps identify broken imports after files have been moved.
 * 
 * It provides suggestions for fixing import paths based on the new file locations.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import glob from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define path mappings from old structure to new structure
const pathMappings = [
  // Core files
  { from: /^src\/App/, to: 'src/App' },
  { from: /^src\/MissionFreshApp/, to: 'src/MissionFreshApp' },
  { from: /^src\/routes/, to: 'src/routes/index' },
  { from: /^src\/router/, to: 'src/routes/router' },
  
  // Pages
  { from: /^src\/pages\/DashboardPage/, to: 'src/pages/app/Dashboard' },
  { from: /^src\/pages\/LandingPage/, to: 'src/pages/LandingPage' },
  { from: /^src\/pages\/LoginPage/, to: 'src/pages/auth/AuthPage' },
  { from: /^src\/pages\/SmokelessProductsDirectory/, to: 'src/pages/directories/SmokelessProducts' },
  { from: /^src\/pages\/SleepQualityPage/, to: 'src/pages/health/SleepQuality' },
  { from: /^src\/pages\/MoodTrackingPage/, to: 'src/pages/health/MoodTracking' },
  
  // Components
  { from: /^src\/components\/Navbar/, to: 'src/components/common/Navbar' },
  { from: /^src\/components\/Footer/, to: 'src/components/common/Footer' },
  { from: /^src\/components\/PublicNavbar/, to: 'src/components/common/PublicNavbar' },
  { from: /^src\/components\/TopBar/, to: 'src/components/common/TopBar' },
  { from: /^src\/components\/BottomTabBar/, to: 'src/components/common/BottomTabBar' },
  { from: /^src\/components\/ErrorBoundary/, to: 'src/components/common/ErrorBoundary' },
  { from: /^src\/components\/ProtectedRoute/, to: 'src/components/routing/ProtectedRoute' },
  
  // Feature components
  { from: /^src\/components\/Dashboard/, to: 'src/pages/app/Dashboard' },
  { from: /^src\/components\/ConsumptionLogger/, to: 'src/components/features/tracking/ConsumptionLogger' },
  { from: /^src\/components\/SimpleLogger/, to: 'src/components/features/tracking/SimpleLogger' },
  { from: /^src\/components\/Progress/, to: 'src/components/features/tracking/Progress' },
  { from: /^src\/components\/TriggerAnalysis/, to: 'src/components/features/triggers/TriggerAnalysis' },
  { from: /^src\/components\/Achievements/, to: 'src/components/features/achievements/Achievements' },
  { from: /^src\/components\/WebTools/, to: 'src/pages/tools/WebTools' },
  
  // Context dirs
  { from: /^src\/context\//, to: 'src/contexts/' },
];

const BASE_DIR = path.resolve(path.join(__dirname, '..'));
const RESTRUCTURED_DIR = path.join(BASE_DIR, 'src-restructured');

// Find all TypeScript/React files in the restructured directory
const findAllFiles = () => {
  return glob.sync('**/*.{ts,tsx}', {
    cwd: RESTRUCTURED_DIR,
    ignore: ['node_modules/**', '**/*.d.ts']
  });
};

// Extract imports from a file
const extractImports = (filePath) => {
  const content = fs.readFileSync(path.join(RESTRUCTURED_DIR, filePath), 'utf8');
  const importRegex = /import\s+(?:{[\s\w,]+}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/g;
  
  const imports = [];
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    imports.push({
      fullStatement: match[0],
      importPath: match[1],
      lineNumber: content.substring(0, match.index).split('\n').length
    });
  }
  
  return { 
    filePath, 
    imports,
    content
  };
};

// Check if an import is likely to be broken
const isLikelyBroken = (importPath) => {
  // Skip node modules and relative imports that start with ./ or ../
  if (importPath.startsWith('.') || !importPath.startsWith('src/')) {
    return false;
  }
  
  // Check if the path matches any of our known mappings
  for (const mapping of pathMappings) {
    if (mapping.from.test(importPath)) {
      return true;
    }
  }
  
  return false;
};

// Suggest a fixed import path
const suggestFixedPath = (importPath) => {
  for (const mapping of pathMappings) {
    if (mapping.from.test(importPath)) {
      return importPath.replace(mapping.from, mapping.to);
    }
  }
  return importPath;
};

// Fix imports in a file
const fixImports = (file) => {
  const { filePath, imports, content } = file;
  let fixedContent = content;
  const fixes = [];
  
  // Process in reverse order to avoid offset issues when replacing
  imports
    .filter(imp => isLikelyBroken(imp.importPath))
    .sort((a, b) => b.lineNumber - a.lineNumber)
    .forEach(imp => {
      const fixedPath = suggestFixedPath(imp.importPath);
      if (fixedPath !== imp.importPath) {
        const oldImport = `from '${imp.importPath}'`;
        const newImport = `from '${fixedPath}'`;
        fixedContent = fixedContent.replace(oldImport, newImport);
        
        fixes.push({
          line: imp.lineNumber,
          oldPath: imp.importPath,
          newPath: fixedPath
        });
      }
    });
  
  if (fixes.length > 0) {
    fs.writeFileSync(path.join(RESTRUCTURED_DIR, filePath), fixedContent, 'utf8');
    console.log(`✅ Fixed ${fixes.length} imports in ${filePath}`);
    fixes.forEach(fix => {
      console.log(`   Line ${fix.line}: ${fix.oldPath} → ${fix.newPath}`);
    });
  }
  
  return fixes.length;
};

// Main function
const main = async () => {
  console.log('Starting import path fixer...');
  console.log(`Working in: ${RESTRUCTURED_DIR}`);
  
  const files = findAllFiles();
  console.log(`Found ${files.length} TypeScript/React files`);
  
  let totalFixes = 0;
  let fixedFiles = 0;
  
  for (const file of files) {
    const fileData = extractImports(file);
    const fixes = fixImports(fileData);
    
    if (fixes > 0) {
      totalFixes += fixes;
      fixedFiles++;
    }
  }
  
  console.log('\nSummary:');
  console.log(`- Fixed ${totalFixes} import statements`);
  console.log(`- Updated ${fixedFiles} files`);
  console.log(`- ${files.length - fixedFiles} files had no broken imports`);
  
  console.log('\nNext steps:');
  console.log('1. Run the application to verify everything works correctly');
  console.log('2. Check for any remaining import errors manually');
  console.log('3. Switch from src-restructured to src when ready with:');
  console.log('   mv src src-old && mv src-restructured src');
};

main().catch(err => {
  console.error('Error running import fixer:', err);
  process.exit(1);
}); 