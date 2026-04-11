import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, '../dist');
const scannerHtml = path.join(distPath, 'scanner.html');
const indexHtml = path.join(distPath, 'index.html');

if (fs.existsSync(scannerHtml)) {
  // Remove existing index.html if it exists (it shouldn't if emptyOutDir is true, but just in case)
  if (fs.existsSync(indexHtml)) {
    fs.unlinkSync(indexHtml);
  }
  fs.renameSync(scannerHtml, indexHtml);
  console.log('Renamed scanner.html to index.html');
} else {
  console.error('scanner.html not found in dist!');
  process.exit(1);
}
