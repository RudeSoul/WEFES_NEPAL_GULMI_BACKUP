// scripts/enrich-data.ts
// Simple enrichment script to copy original GeoJSON and optionally merge additional metrics.
import { promises as fs } from 'fs';
import path from 'path';

async function enrich() {
  const srcPath = path.resolve(process.cwd(), 'apps/web/public/geojson/nepal-districts.json');
  const destDir = path.resolve(process.cwd(), 'apps/web/public/geojson');
  const destPath = path.join(destDir, 'nepal-districts-enriched.json');
  await fs.mkdir(destDir, { recursive: true });
  const data = await fs.readFile(srcPath, 'utf-8');
  // Placeholder for future enrichment logic – currently just copies the source.
  await fs.writeFile(destPath, data, 'utf-8');
  console.log('Enriched GeoJSON written to', destPath);
}

enrich().catch(err => {
  console.error('Enrichment failed:', err);
  process.exit(1);
});
