
/**
 * This script checks for TypeScript page errors and helps diagnose common build problems
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Project root
const projectRoot = path.resolve(__dirname, '..');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

console.log(`${colors.cyan}Page Checker - Diagnosing Build Issues${colors.reset}`);

// Check for missing package.json
if (!fs.existsSync(path.join(projectRoot, 'package.json'))) {
  console.error(`${colors.red}ERROR: No package.json found in the project root.${colors.reset}`);
  console.log(`${colors.yellow}SOLUTION: Please create a package.json file in the root directory.${colors.reset}`);
  console.log(`Example minimal package.json:
{
  "name": "easier-focus",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "build:dev": "vite build --mode development",
    "preview": "vite preview"
  }
}
  `);
  process.exit(1);
}

// Check TypeScript settings
console.log(`${colors.cyan}Checking TypeScript configuration...${colors.reset}`);

// Verify tsconfig.json
if (!fs.existsSync(path.join(projectRoot, 'tsconfig.json'))) {
  console.error(`${colors.red}ERROR: No tsconfig.json found.${colors.reset}`);
  process.exit(1);
}

// Run tsc --version to check TypeScript version
try {
  const tsVersion = execSync('npx tsc --version', { encoding: 'utf8' }).trim();
  console.log(`${colors.green}TypeScript version: ${tsVersion}${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}ERROR: TypeScript not installed or not working properly.${colors.reset}`);
  console.log(`${colors.yellow}SOLUTION: Try running: npm install typescript --save-dev${colors.reset}`);
  process.exit(1);
}

// Check for TypeScript errors
console.log(`${colors.cyan}Checking for TypeScript errors...${colors.reset}`);
try {
  // Use --listFiles instead of --noEmit to avoid conflicts with --build
  execSync('npx tsc --listFiles', { stdio: 'pipe' });
  console.log(`${colors.green}No TypeScript errors detected.${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}TypeScript errors detected:${colors.reset}`);
  console.error(error.stdout?.toString() || error.message);
  
  // Check if error contains the --noEmit/--build conflict
  const errorOutput = error.stdout?.toString() || error.message;
  if (errorOutput.includes("option '--noEmit' may not be used with '--build'")) {
    console.log(`${colors.yellow}SOLUTION: The --noEmit flag conflicts with --build in your TypeScript configuration.${colors.reset}`);
    console.log(`${colors.yellow}Check your npm scripts in package.json and remove --noEmit from TypeScript commands that use --build.${colors.reset}`);
  }
}

// Verify port settings in vite.config
console.log(`${colors.cyan}Checking Vite configuration...${colors.reset}`);
const viteConfigPath = fs.existsSync(path.join(projectRoot, 'vite.config.ts')) 
  ? path.join(projectRoot, 'vite.config.ts')
  : path.join(projectRoot, 'vite.config.js');

if (fs.existsSync(viteConfigPath)) {
  const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
  if (!viteConfig.includes('port: 8080')) {
    console.log(`${colors.yellow}WARNING: Vite server port should be set to 8080 for Lovable compatibility.${colors.reset}`);
    console.log(`${colors.yellow}Add the following to your vite.config.js/ts:
server: {
  port: 8080
}${colors.reset}`);
  } else {
    console.log(`${colors.green}Vite server port correctly configured.${colors.reset}`);
  }
} else {
  console.error(`${colors.red}ERROR: No vite.config.js or vite.config.ts found.${colors.reset}`);
}

console.log(`${colors.cyan}Page check complete.${colors.reset}`);
