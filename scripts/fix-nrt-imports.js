#!/usr/bin/env node

/**
 * NRT Imports Fixer
 * 
 * This script analyzes the api.ts file and ProductDetails.tsx to fix import errors.
 * It identifies the correct function names in api.ts and updates the imports in ProductDetails.tsx.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// File paths
const apiFilePath = path.join(projectRoot, 'src', 'components', 'NRTDirectory', 'api.ts');
const productDetailsPath = path.join(projectRoot, 'src', 'components', 'NRTDirectory', 'ProductDetails.tsx');

// Function to read a file content
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    process.exit(1);
  }
}

// Function to write a file
function writeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Successfully updated ${path.basename(filePath)}`);
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error.message);
    process.exit(1);
  }
}

// Find exported functions in api.ts
function findExportedFunctions(fileContent) {
  const exportRegex = /export\s+const\s+(\w+)\s*=/g;
  const exportedFunctions = [];
  let match;
  
  while ((match = exportRegex.exec(fileContent)) !== null) {
    exportedFunctions.push(match[1]);
  }
  
  return exportedFunctions;
}

// Find best matches for the missing imports
function findBestMatches(missingImports, availableFunctions) {
  const result = {};
  
  // Known direct mappings for common function names
  const directMappings = {
    'getVendors': 'fetchVendors',
    'getCountryInfo': 'fetchCountryRegulations', 
    'trackAffiliateClick': 'recordAffiliateClick'
  };
  
  // Function to calculate similarity between two strings
  function calculateSimilarity(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
    
    // Split strings into words
    const words1 = s1.split(/(?=[A-Z])|_/).map(w => w.toLowerCase());
    const words2 = s2.split(/(?=[A-Z])|_/).map(w => w.toLowerCase());
    
    let commonWords = 0;
    for (const word1 of words1) {
      if (words2.some(word2 => word2.includes(word1) || word1.includes(word2))) {
        commonWords++;
      }
    }
    
    return commonWords / Math.max(words1.length, words2.length);
  }
  
  // Process each missing import
  for (const missingImport of missingImports) {
    // Check for direct mapping first
    if (directMappings[missingImport] && availableFunctions.includes(directMappings[missingImport])) {
      result[missingImport] = { 
        replacement: directMappings[missingImport], 
        confidence: 1.0 
      };
      continue;
    }
    
    // If no direct mapping, find the best match based on similarity
    let maxSimilarity = 0;
    let bestMatch = '';
    
    for (const func of availableFunctions) {
      const similarity = calculateSimilarity(missingImport, func);
      
      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
        bestMatch = func;
      }
    }
    
    result[missingImport] = { 
      replacement: bestMatch, 
      confidence: maxSimilarity 
    };
  }
  
  return result;
}

// Update the imports in ProductDetails.tsx
function updateImports(fileContent, mappings) {
  let updatedContent = fileContent;
  
  // Replace each import
  for (const [missingImport, mapping] of Object.entries(mappings)) {
    if (mapping.replacement) {
      const importPattern = new RegExp(`(import [^;]*?{[^}]*?)(\\b${missingImport}\\b)([^}]*?} from)`, 'g');
      updatedContent = updatedContent.replace(importPattern, `$1${mapping.replacement}$3`);
    }
  }
  
  return updatedContent;
}

// Main function
async function main() {
  console.log("🔍 Analyzing NRT Directory files to fix import errors...");
  
  // Read file contents
  const apiContent = readFile(apiFilePath);
  const productDetailsContent = readFile(productDetailsPath);
  
  // Find exported functions in api.ts
  const exportedFunctions = findExportedFunctions(apiContent);
  console.log(`Found ${exportedFunctions.length} exported functions in api.ts:`);
  console.log(exportedFunctions.join(', '));
  
  // Define the missing imports from the error messages
  const missingImports = ['getVendors', 'getCountryInfo', 'trackAffiliateClick'];
  console.log(`\nDetected missing imports: ${missingImports.join(', ')}`);
  
  // Find best matches for the missing imports
  const mappings = findBestMatches(missingImports, exportedFunctions);
  
  console.log("\nProposed replacements:");
  for (const [missingImport, mapping] of Object.entries(mappings)) {
    const confidenceStr = Math.round(mapping.confidence * 100) + '%';
    console.log(`- ${missingImport} → ${mapping.replacement || '(no match)'} (Confidence: ${confidenceStr})`);
  }
  
  // Update the imports
  const updatedProductDetailsContent = updateImports(productDetailsContent, mappings);
  
  // Save the updated file
  if (updatedProductDetailsContent !== productDetailsContent) {
    writeFile(productDetailsPath, updatedProductDetailsContent);
    console.log("\n✅ ProductDetails.tsx has been updated with corrected imports!");
  } else {
    console.log("\n⚠️ No changes were made to ProductDetails.tsx");
  }
  
  console.log("\nTo verify the changes, run:");
  console.log("npm run dev");
}

// Run the main function
main(); 