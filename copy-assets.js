import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file directory with ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const sourceDir = path.join(__dirname, 'public/images');
const targetDir = path.join(__dirname, 'public/easier-focus/images');

// Ensure target directory exists
if (!fs.existsSync(targetDir)) {
  console.log(`Creating directory: ${targetDir}`);
  fs.mkdirSync(targetDir, { recursive: true });
}

// Copy all files from source to target
function copyFiles() {
  console.log('Starting asset copy process...');
  
  try {
    // Read source directory
    const files = fs.readdirSync(sourceDir);
    
    // Copy each file
    let copiedCount = 0;
    for (const file of files) {
      const sourcePath = path.join(sourceDir, file);
      const targetPath = path.join(targetDir, file);
      
      // Skip directories
      if (fs.statSync(sourcePath).isDirectory()) {
        console.log(`Skipping directory: ${file}`);
        continue;
      }
      
      // Copy file
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`Copied: ${file}`);
      copiedCount++;
    }
    
    console.log(`\nCopy completed successfully. Copied ${copiedCount} files.`);
  } catch (error) {
    console.error('Error copying files:', error);
  }
}

// Watch for changes in the source directory
function watchDirectory() {
  console.log(`\nWatching for changes in ${sourceDir}...`);
  
  // Run initial copy
  copyFiles();
  
  // Set up watcher
  fs.watch(sourceDir, { recursive: true }, (eventType, filename) => {
    if (!filename) return;
    
    const sourcePath = path.join(sourceDir, filename);
    const targetPath = path.join(targetDir, filename);
    
    console.log(`\nChange detected: ${eventType} - ${filename}`);
    
    try {
      if (fs.existsSync(sourcePath)) {
        // Skip directories
        if (fs.statSync(sourcePath).isDirectory()) {
          console.log(`Skipping directory: ${filename}`);
          return;
        }
        
        // Copy the changed file
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`Updated: ${filename}`);
      } else if (fs.existsSync(targetPath)) {
        // If file was deleted in source, delete it in target
        fs.unlinkSync(targetPath);
        console.log(`Deleted: ${filename}`);
      }
    } catch (error) {
      console.error(`Error updating ${filename}:`, error);
    }
  });
}

// Run the script
watchDirectory(); 