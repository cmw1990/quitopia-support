/**
 * Fix NicotineProduct Types Script
 * 
 * This script analyzes TypeScript files for NicotineProduct usage and 
 * adds the adapter pattern where needed to fix type errors.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

console.log('Script started!');

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Files to add the adapter import to
const FILES_TO_PROCESS = [
  'src/components/ConsumptionLogger.tsx',
  'src/components/ProductDetails.tsx',
  'src/router.tsx',
];

console.log('Processing files:', FILES_TO_PROCESS);

// Main function
async function main() {
  console.log('Fixing NicotineProduct type compatibility issues...');
  
  try {
    // Process each file
    for (const file of FILES_TO_PROCESS) {
      const fullPath = path.resolve(process.cwd(), file);
      console.log('Checking file path:', fullPath);
      if (fs.existsSync(fullPath)) {
        fixNicotineProductInFile(fullPath);
      } else {
        console.warn(`File not found: ${fullPath}`);
      }
    }
    
    console.log('Done. Please check the files for any additional issues.');
  } catch (error) {
    console.error('Error fixing types:', error.message);
    process.exit(1);
  }
}

// Function to fix NicotineProduct imports in a file
function fixNicotineProductInFile(filePath) {
  console.log(`Processing ${filePath}`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Check if file has NicotineProduct import
    if (content.includes('NicotineProduct')) {
      // Add import for ensureProductsCompatibility if needed
      if (!content.includes('import { ensureProductsCompatibility }')) {
        // Find import section
        const importSection = content.match(/^import.*?from.*?$/gm);
        if (importSection && importSection.length > 0) {
          const lastImport = importSection[importSection.length - 1];
          const importPos = content.indexOf(lastImport) + lastImport.length;
          
          content = content.slice(0, importPos) + 
                   '\n\n// Import mapper utilities\nimport { ensureProductsCompatibility } from \'../lib/mappers\';\n' + 
                   content.slice(importPos);
          
          modified = true;
        }
      }
      
      // Add ExtendedNicotineProduct type if needed
      if (!content.includes('ExtendedNicotineProduct')) {
        // Find a good place to add the type declaration
        const componentStart = content.match(/(export\s+(const|function|class)|const\s+\w+\s*=\s*\()/);
        if (componentStart) {
          const pos = content.indexOf(componentStart[0]);
          
          content = content.slice(0, pos) +
                  '\n// Extend NicotineProduct type for better type safety\ntype ExtendedNicotineProduct = NicotineProduct & {\n' +
                  '  category: string;\n' +
                  '  type?: string;\n' +
                  '  price?: number;\n' +
                  '  created_at?: string;\n' +
                  '  updated_at?: string;\n' +
                  '};\n\n' +
                  content.slice(pos);
          
          modified = true;
        }
      }
      
      // Fix product state types
      if (content.includes('useState<NicotineProduct')) {
        content = content.replace(/useState<NicotineProduct(\[\])?/g, 'useState<ExtendedNicotineProduct$1');
        modified = true;
      }
      
      // Fix getAllProducts calls
      if (content.includes('getAllProducts(undefined')) {
        content = content.replace(/getAllProducts\(undefined/g, 'getAllProducts({} /* filter options */');
        modified = true;
      }
      
      // Fix function parameters with NicotineProduct
      content = content.replace(/\((.*?)NicotineProduct(\[\])?(\s*\|?\s*null)?(\s*\|?\s*undefined)?(\s*\))/g, 
                              '($1ExtendedNicotineProduct$2$3$4$5');
      
      // Add ensureProductsCompatibility wrapper around API calls
      if (content.includes('getAllProducts') && !content.includes('ensureProductsCompatibility')) {
        content = content.replace(/(const products = await getAllProducts.*?);/g, 
                              '$1;\n    // Convert to compatible product format\n    const compatibleProducts = ensureProductsCompatibility(products);');
        
        content = content.replace(/(setProductsList\()(products)/g, '$1compatibleProducts as ExtendedNicotineProduct[]');
        content = content.replace(/(setFilteredProducts\()(products)/g, '$1compatibleProducts as ExtendedNicotineProduct[]');
        
        modified = true;
      }
    }
    
    if (modified) {
      // Save changes
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    } else {
      console.log(`No changes needed in ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

// Run the script
console.log('About to call main()');
main().catch(err => {
  console.error('Error in main:', err);
  process.exit(1);
}); 