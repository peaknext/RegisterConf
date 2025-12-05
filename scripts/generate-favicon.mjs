import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.join(__dirname, '..');
const SOURCE_IMAGE = path.join(ROOT_DIR, 'public', 'snlogo.png');
const APP_DIR = path.join(ROOT_DIR, 'src', 'app');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

async function generateFavicons() {
  console.log('Generating favicons from snlogo.png...');

  // Read source image
  const sourceBuffer = await fs.readFile(SOURCE_IMAGE);

  // Generate favicon.ico (32x32) - placed in src/app for Next.js App Router
  await sharp(sourceBuffer)
    .resize(32, 32, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(path.join(APP_DIR, 'favicon.ico'));
  console.log('Created: src/app/favicon.ico (32x32)');

  // Generate icon.png (32x32) for src/app
  await sharp(sourceBuffer)
    .resize(32, 32, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(path.join(APP_DIR, 'icon.png'));
  console.log('Created: src/app/icon.png (32x32)');

  // Generate apple-icon.png (180x180) for iOS
  await sharp(sourceBuffer)
    .resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(path.join(APP_DIR, 'apple-icon.png'));
  console.log('Created: src/app/apple-icon.png (180x180)');

  // Generate various sizes for public folder (for manifest.json or other uses)
  const sizes = [16, 32, 48, 96, 192, 512];

  for (const size of sizes) {
    await sharp(sourceBuffer)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile(path.join(PUBLIC_DIR, `icon-${size}.png`));
    console.log(`Created: public/icon-${size}.png`);
  }

  console.log('\nFavicon generation complete!');
  console.log('\nNext.js App Router will automatically use:');
  console.log('  - src/app/favicon.ico');
  console.log('  - src/app/icon.png');
  console.log('  - src/app/apple-icon.png');
}

generateFavicons().catch(console.error);
