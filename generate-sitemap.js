// generate-sitemap.mjs  ← cambia la extensión a .mjs
import sitemap from 'react-router-sitemap';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { promises as fs } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const routes = [
  '/',
  '/contacto',
  '/servicios',
  '/productos'
];

const domain = 'https://dietetica-integral.com';

const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(route => `  <url>
    <loc>${domain}${route}</loc>
    <lastmod>2026-08-24</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`;

await fs.writeFile(resolve(__dirname, 'dist', 'sitemap.xml'), xmlContent);
console.log('Sitemap generado correctamente');