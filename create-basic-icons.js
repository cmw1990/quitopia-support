const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Define the icon sizes to generate
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = 'public/easier-focus/icons';

// Ensure the directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create a basic HTML file that will be the template for our icons
const createHtmlForIcon = (size) => {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Icon ${size}x${size}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      width: ${size}px;
      height: ${size}px;
      background: linear-gradient(135deg, #4f46e5, #8b5cf6);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .circle {
      width: ${size * 0.6}px;
      height: ${size * 0.6}px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .text {
      color: #fff;
      font-family: Arial, sans-serif;
      font-weight: bold;
      font-size: ${size * 0.25}px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="circle">
    <div class="text">EF</div>
  </div>
</body>
</html>`;
};

// Function to copy a file from one location to another
const copyFile = (source, target) => {
  try {
    fs.copyFileSync(source, target);
    console.log(`Copied ${source} to ${target}`);
  } catch (err) {
    console.error(`Error copying ${source} to ${target}: ${err.message}`);
  }
};

// For each size, create a basic PNG icon
for (const size of sizes) {
  const iconPath = path.join(iconsDir, `icon-${size}x${size}.png`);
  
  // Use a solid color square for simplicity
  const buffer = Buffer.alloc(size * size * 4); // 4 bytes per pixel (RGBA)
  
  // Fill with a purple color (RGB: 79, 70, 229 - based on the primary color)
  for (let i = 0; i < buffer.length; i += 4) {
    // R, G, B, A
    buffer[i] = 79;     // R
    buffer[i + 1] = 70; // G
    buffer[i + 2] = 229; // B
    buffer[i + 3] = 255; // A (fully opaque)
  }
  
  // Write the buffer to a file
  fs.writeFileSync(iconPath, buffer);
  console.log(`Created placeholder for icon-${size}x${size}.png`);
}

// Create apple touch icon (just copy the 192x192 for simplicity)
copyFile(
  path.join(iconsDir, 'icon-192x192.png'),
  path.join(iconsDir, 'apple-touch-icon.png')
);

// Create maskable icon (just copy the 512x512 for simplicity)
copyFile(
  path.join(iconsDir, 'icon-512x512.png'),
  path.join(iconsDir, 'maskable-icon.png')
);

console.log('All icon placeholders created successfully!'); 