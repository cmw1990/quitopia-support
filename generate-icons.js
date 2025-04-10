const fs = require('fs');
const { createCanvas } = require('canvas');

// Define the icon sizes to generate
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create a directory for the icons if it doesn't exist
const iconsDir = 'public/easier-focus/icons';
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate icons for each size
for (const size of sizes) {
  // Create a canvas of the specified size
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Fill the background with a gradient
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#4f46e5'); // Primary blue/indigo
  gradient.addColorStop(1, '#8b5cf6'); // Purple
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Draw a white circle representing focus
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 3, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fill();

  // Add text in the center
  const fontSize = Math.floor(size / 5);
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('EF', size / 2, size / 2);

  // Save the image as PNG
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`${iconsDir}/icon-${size}x${size}.png`, buffer);

  console.log(`Generated icon-${size}x${size}.png`);
}

// Also create a special apple-touch-icon
const appleIconSize = 180;
const appleCanvas = createCanvas(appleIconSize, appleIconSize);
const appleCtx = appleCanvas.getContext('2d');

// Fill with gradient
const appleGradient = appleCtx.createLinearGradient(0, 0, appleIconSize, appleIconSize);
appleGradient.addColorStop(0, '#4f46e5');
appleGradient.addColorStop(1, '#8b5cf6');
appleCtx.fillStyle = appleGradient;
appleCtx.fillRect(0, 0, appleIconSize, appleIconSize);

// Add apple-specific styling
appleCtx.beginPath();
appleCtx.arc(appleIconSize / 2, appleIconSize / 2, appleIconSize / 3, 0, Math.PI * 2);
appleCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';
appleCtx.fill();

// Add text
const appleFontSize = Math.floor(appleIconSize / 5);
appleCtx.font = `bold ${appleFontSize}px Arial`;
appleCtx.fillStyle = '#ffffff';
appleCtx.textAlign = 'center';
appleCtx.textBaseline = 'middle';
appleCtx.fillText('EF', appleIconSize / 2, appleIconSize / 2);

// Save the apple touch icon
const appleBuffer = appleCanvas.toBuffer('image/png');
fs.writeFileSync(`${iconsDir}/apple-touch-icon.png`, appleBuffer);
console.log(`Generated apple-touch-icon.png`);

// Also create a maskable icon
const maskableSize = 512;
const maskableCanvas = createCanvas(maskableSize, maskableSize);
const maskableCtx = maskableCanvas.getContext('2d');

// Fill with gradient, but leave safe area
const maskableGradient = maskableCtx.createLinearGradient(0, 0, maskableSize, maskableSize);
maskableGradient.addColorStop(0, '#4f46e5');
maskableGradient.addColorStop(1, '#8b5cf6');
maskableCtx.fillStyle = maskableGradient;
maskableCtx.fillRect(0, 0, maskableSize, maskableSize);

// Add a central element in the safe area
const safeAreaSize = maskableSize * 0.8;
const safeAreaOffset = (maskableSize - safeAreaSize) / 2;
maskableCtx.beginPath();
maskableCtx.arc(maskableSize / 2, maskableSize / 2, maskableSize / 4, 0, Math.PI * 2);
maskableCtx.fillStyle = 'rgba(255, 255, 255, 0.7)';
maskableCtx.fill();

// Add text
const maskableFontSize = Math.floor(maskableSize / 6);
maskableCtx.font = `bold ${maskableFontSize}px Arial`;
maskableCtx.fillStyle = '#ffffff';
maskableCtx.textAlign = 'center';
maskableCtx.textBaseline = 'middle';
maskableCtx.fillText('EF', maskableSize / 2, maskableSize / 2);

// Save the maskable icon
const maskableBuffer = maskableCanvas.toBuffer('image/png');
fs.writeFileSync(`${iconsDir}/maskable-icon.png`, maskableBuffer);
console.log(`Generated maskable-icon.png`);

console.log('All icons generated successfully!'); 