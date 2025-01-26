import { readdir } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';

async function optimizeScreenshots() {
  const screenshotsDir = 'screenshots';
  
  try {
    const files = await readdir(screenshotsDir);
    const pngFiles = files.filter(file => file.toLowerCase().endsWith('.png'));
    
    console.log(`Found ${pngFiles.length} PNG files to optimize`);
    
    for (const file of pngFiles) {
      const filePath = join(screenshotsDir, file);
      console.log(`Optimizing ${file}...`);
      
      await sharp(filePath)
        .resize(1200, 800, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .png({
          quality: 85,
          compressionLevel: 9
        })
        .toBuffer()
        .then(buffer => sharp(buffer).toFile(filePath));
    }
    
    console.log('All screenshots optimized successfully!');
  } catch (error) {
    console.error('Error optimizing screenshots:', error);
    process.exit(1);
  }
}

optimizeScreenshots(); 