// Duplicate dist/index.html to dist/404.html for GitHub Pages SPA routing
import { copyFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distDir = resolve(__dirname, '..', 'dist');
const from = resolve(distDir, 'index.html');
const to = resolve(distDir, '404.html');

try {
  await copyFile(from, to);
  console.log('Created 404.html for GitHub Pages');
} catch (err) {
  console.warn('Could not create 404.html. Ensure you built the project first.', err?.message ?? err);
}
