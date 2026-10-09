const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const GAMES_DIR = path.join(__dirname, '..', 'public', 'games');
const files = fs.readdirSync(GAMES_DIR).filter(f => fs.statSync(path.join(GAMES_DIR, f)).isFile());

// 1. Group by basename
const byBasename = {};
for (const file of files) {
  const parsed = path.parse(file);
  const base = parsed.name.toLowerCase();
  if (!byBasename[base]) byBasename[base] = [];
  byBasename[base].push(file);
}

const multipleExts = [];
for (const [base, flist] of Object.entries(byBasename)) {
  if (flist.length > 1) {
    multipleExts.push({ base, files: flist });
  }
}
console.log(`=== MULTIPLE EXTENSIONS (${multipleExts.length}) ===`);
multipleExts.forEach(m => console.log(`${m.base}: ${m.files.join(', ')}`));

// 2. Hash duplicates
const byHash = {};
for (const file of files) {
  const buf = fs.readFileSync(path.join(GAMES_DIR, file));
  const hash = crypto.createHash('sha256').update(buf).digest('hex');
  if (!byHash[hash]) byHash[hash] = [];
  byHash[hash].push(file);
}

const duplicateHashes = Object.entries(byHash).filter(([h, flist]) => flist.length > 1);
console.log(`\n=== HASH CLONES (${duplicateHashes.length} groups) ===`);
for (const [h, flist] of duplicateHashes) {
  console.log(`Hash ${h.slice(0, 10)}: ${flist.join(', ')}`);
}
