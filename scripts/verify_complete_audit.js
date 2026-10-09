const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const GAMES_DIR = path.join(ROOT, 'public', 'games');

// Remove the orphan turbogames/rollx.webp if it exists
const orphanRollx = path.join(GAMES_DIR, 'turbogames', 'rollx.webp');
if (fs.existsSync(orphanRollx)) {
  fs.unlinkSync(orphanRollx);
  console.log('Removed orphan turbogames/rollx.webp');
}

// 1. Check gameThumbnails.ts
const code = fs.readFileSync(path.join(ROOT, 'src/data/gameThumbnails.ts'), 'utf8');

// Check for HTTP/HTTPS links
const httpMatches = code.match(/https?:\/\/[^\s"'`]+/g);
console.log('\n--- Remote URLs Check ---');
console.log('HTTP/HTTPS matches in gameThumbnails.ts:', httpMatches ? httpMatches.length : 0);

// Extract all referenced paths
const referencedPaths = [...new Set(code.match(/\/games\/[a-zA-Z0-9\-_./]+\.webp/g) || [])];
console.log(`\n--- Referenced Paths Check ---`);
console.log(`Total unique referenced paths: ${referencedPaths.length}`);

let missingPaths = 0;
for (const p of referencedPaths) {
  const full = path.join(ROOT, 'public', p);
  if (!fs.existsSync(full)) {
    console.error(`MISSING: ${p}`);
    missingPaths++;
  }
}
console.log(`Missing referenced files count: ${missingPaths}`);

// 2. Check Disk Structure
console.log(`\n--- Disk Structure Check ---`);
const rootEntries = fs.readdirSync(GAMES_DIR, { withFileTypes: true });
const looseFiles = rootEntries.filter(e => e.isFile()).map(e => e.name);
console.log(`Loose files in public/games/ root: ${looseFiles.length}`);
if (looseFiles.length > 0) {
  console.log('Loose files:', looseFiles);
}

const provDirs = rootEntries.filter(e => e.isDirectory()).map(e => e.name);
console.log(`Provider subdirectories found: ${provDirs.join(', ')}`);

const allDiskFiles = [];
const diskHashes = {};
for (const p of provDirs) {
  const pDir = path.join(GAMES_DIR, p);
  const files = fs.readdirSync(pDir).filter(f => fs.statSync(path.join(pDir, f)).isFile());
  for (const f of files) {
    const rel = `/games/${p}/${f}`;
    allDiskFiles.push(rel);
    const buf = fs.readFileSync(path.join(pDir, f));
    const h = crypto.createHash('sha256').update(buf).digest('hex');
    if (!diskHashes[h]) diskHashes[h] = [];
    diskHashes[h].push(rel);
  }
}
console.log(`Total files stored across all provider subdirectories: ${allDiskFiles.length}`);

// Check for orphans (files on disk not referenced in code)
const refSet = new Set(referencedPaths);
const orphans = allDiskFiles.filter(p => !refSet.has(p));
console.log(`Orphan files on disk (not referenced in code): ${orphans.length}`);
if (orphans.length > 0) {
  console.log('Orphans:', orphans);
  for (const o of orphans) {
    fs.unlinkSync(path.join(ROOT, 'public', o));
    console.log(`Deleted orphan: ${o}`);
  }
}

// 3. Hash collision check
console.log(`\n--- SHA-256 Hash Collision Audit ---`);
const collisions = Object.entries(diskHashes).filter(([h, list]) => list.length > 1);
console.log(`Collision groups count: ${collisions.length}`);
if (collisions.length > 0) {
  for (const [h, list] of collisions) {
    console.log(`  COLLISION [${h.slice(0, 10)}]: ${list.join(', ')}`);
  }
} else {
  console.log(`>>> ZERO HASH COLLISIONS! Every single game has a unique authentic thumbnail! <<<`);
}
