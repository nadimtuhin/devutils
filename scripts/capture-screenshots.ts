import captureWebsite from 'capture-website';
import fs from 'fs/promises';
import path from 'path';

const tools = [
  'php-json-converter',
  'php-serializer',
  'string-case-converter',
  'svg-to-css',
  'curl-to-code',
  'json-to-code',
  'hex-ascii-converter',
  'line-sorter',
  'certificate-decoder',
  'css-minify-beautify',
  'javascript-minify-beautify',
  'html-minify-beautify',
  'sql-formatter',
  'color-converter',
  'cron-job-parser',
  'markdown-preview'
];

async function captureScreenshots() {
  // Create screenshots directory if it doesn't exist
  const screenshotsDir = path.join(process.cwd(), 'screenshots');
  await fs.mkdir(screenshotsDir, { recursive: true });

  for (const tool of tools) {
    console.log(`Capturing screenshot for ${tool}...`);
    await captureWebsite.file(
      `http://localhost:5173/${tool}`,
      path.join(screenshotsDir, `${tool}.png`),
      {
        width: 1200,
        height: 800,
        delay: 2,
        scaleFactor: 2, // For retina quality
      }
    );
  }

  // Create a combined preview image
  console.log('Creating preview collage...');
  // TODO: Use sharp or another image processing library to create a collage
}

captureScreenshots().catch(console.error); 