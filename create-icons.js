import fs from 'fs/promises';
import path from 'path';

const iconSizes = [
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' },
  { size: 512, name: 'maskable-icon.png' }
];

async function createPlaceholderIconFile(size, filename) {
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="#4f46e5"/>
    <circle cx="${size/2}" cy="${size/2}" r="${size/3}" fill="#ffffff"/>
    <text x="${size/2}" y="${size/2}" font-family="Arial" font-size="${size/4}" fill="#4f46e5" text-anchor="middle" dy="${size/12}">EF</text>
  </svg>`;
  
  const filePath = path.join('public', 'icons', filename);
  try {
    await fs.writeFile(filePath, svg);
    console.log(`Created ${filePath}`);
  } catch (error) {
    console.error(`Error creating ${filePath}:`, error);
  }
}

async function createIcons() {
  try {
    // Create icons directory if it doesn't exist
    await fs.mkdir(path.join('public', 'icons'), { recursive: true });
    
    // Create each icon file
    for (const icon of iconSizes) {
      await createPlaceholderIconFile(icon.size, icon.name);
    }
    
    // Create apple-touch-icon.png
    await createPlaceholderIconFile(180, 'apple-touch-icon.png');
    
    console.log('All icons created successfully!');
  } catch (error) {
    console.error('Error creating icons:', error);
  }
}

createIcons(); 