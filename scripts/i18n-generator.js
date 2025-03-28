#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');

// Configuration
const srcDir = path.join(__dirname, '../src');
const outputDir = path.join(__dirname, '../src/i18n');
const existingTranslationsPath = path.join(outputDir, 'translations');
const templatePath = path.join(outputDir, 'template.json');

// Ensure output directories exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

if (!fs.existsSync(existingTranslationsPath)) {
  fs.mkdirSync(existingTranslationsPath, { recursive: true });
}

// Regex patterns for extracting strings
const patterns = [
  /t\(['"](.+?)['"]\)/g,                    // t('string')
  /t\(['"](.+?)['"],\s*{.*?}\)/g,           // t('string', { options })
  /useTranslation\(\).*?['"](.+?)['"]/gs,   // useTranslation() ... 'string'
  /<Trans>([^<]+)<\/Trans>/g,               // <Trans>string</Trans>
];

// Find all TypeScript and TSX files
const files = glob.sync('**/*.{ts,tsx}', { cwd: srcDir, ignore: ['**/*.d.ts', '**/node_modules/**'] });

// Storage for found strings
const strings = {};
const fileMap = {};

// Process each file
files.forEach(file => {
  const filePath = path.join(srcDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const string = match[1].trim();
      
      // Skip if string is empty or just a variable reference
      if (!string || string.startsWith('{') || string.endsWith('}') || string.includes('${')) {
        continue;
      }
      
      // Store the string and its location
      strings[string] = strings[string] || '';
      
      if (!fileMap[string]) {
        fileMap[string] = [];
      }
      
      if (!fileMap[string].includes(file)) {
        fileMap[string].push(file);
      }
    }
  });
});

// Load existing translations if available
const existingTranslations = {};
const translationFiles = glob.sync('*.json', { cwd: existingTranslationsPath });

translationFiles.forEach(file => {
  const langCode = path.basename(file, '.json');
  try {
    const content = fs.readFileSync(path.join(existingTranslationsPath, file), 'utf8');
    existingTranslations[langCode] = JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${file}:`, error);
  }
});

// Create template file
const template = {};
Object.keys(strings).sort().forEach(key => {
  template[key] = strings[key] || key;
});

fs.writeFileSync(templatePath, JSON.stringify(template, null, 2));

// Generate translation templates for each language
if (Object.keys(existingTranslations).length === 0) {
  // Create default English translation if none exists
  const en = { ...template };
  fs.writeFileSync(path.join(existingTranslationsPath, 'en.json'), JSON.stringify(en, null, 2));
} else {
  // Update existing translations with new strings
  Object.keys(existingTranslations).forEach(lang => {
    const translation = existingTranslations[lang];
    let updated = false;
    
    Object.keys(template).forEach(key => {
      if (!translation[key]) {
        translation[key] = lang === 'en' ? key : '';
        updated = true;
      }
    });
    
    if (updated) {
      fs.writeFileSync(
        path.join(existingTranslationsPath, `${lang}.json`), 
        JSON.stringify(translation, null, 2)
      );
    }
  });
}

// Print statistics
const totalStrings = Object.keys(strings).length;
console.log(chalk.green(`\n✓ Found ${totalStrings} translatable strings in ${files.length} files`));
console.log(chalk.green(`✓ Generated template file at ${templatePath}`));

// Print strings with their file locations
console.log(chalk.yellow('\nStrings and their locations:'));
Object.keys(strings).sort().forEach(string => {
  console.log(chalk.white(`"${string}"`));
  fileMap[string].forEach(file => {
    console.log(chalk.gray(`  - ${file}`));
  });
});

console.log(chalk.blue('\nNext steps:'));
console.log(chalk.white('1. Review the generated template.json file'));
console.log(chalk.white('2. Add new languages by creating [langCode].json files in the translations directory'));
console.log(chalk.white('3. Run this script again to update translations when new strings are added')); 