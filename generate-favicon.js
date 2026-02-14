const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, 'moon-icon.svg');
const outputDir = __dirname;

// Read the SVG file
const svgBuffer = fs.readFileSync(svgPath);

async function generateFavicons() {
  console.log('Generating favicons from moon-icon.svg...');

  // Generate different sizes
  const sizes = [
    { size: 16, name: 'favicon-16x16.png' },
    { size: 32, name: 'favicon-32x32.png' },
    { size: 192, name: 'icon-192.png' },
    { size: 512, name: 'icon-512.png' },
  ];

  for (const { size, name } of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(outputDir, name));
    console.log(`Created ${name}`);
  }

  // Generate favicon.ico (using 32x32)
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(outputDir, 'favicon.ico'));
  console.log('Created favicon.ico');

  // Also create apple-touch-icon for iOS
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(outputDir, 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png');

  console.log('All favicons generated successfully!');
}

generateFavicons().catch(console.error);
