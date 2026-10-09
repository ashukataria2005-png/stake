const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const GAMES_DIR = path.join(__dirname, '..', 'public', 'games');
const files = fs.readdirSync(GAMES_DIR).filter(f => fs.statSync(path.join(GAMES_DIR, f)).isFile());

console.log(`Found ${files.length} files in ${GAMES_DIR}`);

// 1. Group by basename (without extension)
const byBasename = {};
for (const file of files) {
  const parsed = path.parse(file);
  const base = parsed.name.toLowerCase();
  if (!byBasename[base]) byBasename[base] = [];
  byBasename[base].push(file);
}

const multipleExtensions = Object.entries(byBasename).filter(([k, v]) => v.length > 1);
console.log(`\n--- Multiple Extensions Check ---`);
console.log(`Basenames with multiple files: ${multipleExtensions.length}`);
for (const [base, flist] of multipleExtensions.slice(0, 20)) {
  console.log(`  ${base}: ${flist.join(', ')}`);
}
if (multipleExtensions.length > 20) {
  console.log(`  ... and ${multipleExtensions.length - 20} more`);
}

// 2. Hash check (MD5)
const hashes = {};
for (const file of files) {
  const fullPath = path.join(GAMES_DIR, file);
  const buf = fs.readFileSync(fullPath);
  const hash = crypto.createHash('md5').update(buf).digest('hex');
  if (!hashes[hash]) hashes[hash] = [];
  hashes[hash].push(file);
}

const hashDuplicates = Object.entries(hashes).filter(([h, flist]) => flist.length > 1);
console.log(`\n--- Hash Collisions (Identical File Content) ---`);
console.log(`Duplicate hash groups: ${hashDuplicates.length}`);
let totalDupFiles = 0;
for (const [h, flist] of hashDuplicates) {
  totalDupFiles += flist.length;
  console.log(`Hash ${h.slice(0, 8)} (${flist.length} files): ${flist.join(', ')}`);
}
console.log(`Total duplicate files involved: ${totalDupFiles}`);
