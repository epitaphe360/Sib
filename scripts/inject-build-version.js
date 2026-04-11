/**
 * Inject build version into index.html after Vite build
 * This helps detect stale cached HTML on client side
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, '..', 'dist', 'index.html');

try {
  if (!fs.existsSync(distPath)) {
    console.error('❌ index.html not found in dist folder');
    process.exit(1);
  }

  let html = fs.readFileSync(distPath, 'utf8');
  
  // Generate version from timestamp
  const buildTime = Date.now();
  const buildVersion = `v${buildTime}`;
  
  // Replace placeholders
  html = html.replace('BUILD_VERSION_PLACEHOLDER', buildVersion);
  html = html.replace('BUILD_TIME_PLACEHOLDER', new Date(buildTime).toISOString());
  
  fs.writeFileSync(distPath, html, 'utf8');
  
  console.log('✅ Build version injected:', buildVersion);
} catch (error) {
  console.error('❌ Failed to inject build version:', error);
  process.exit(1);
}
