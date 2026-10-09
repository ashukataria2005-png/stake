const fs = require('fs');
const path = require('path');

const GAMES_DIR = path.join(__dirname, '..', 'public', 'games');
const provs = fs.readdirSync(GAMES_DIR).filter(f => fs.statSync(path.join(GAMES_DIR, f)).isDirectory());

for (const p of provs) {
  const files = fs.readdirSync(path.join(GAMES_DIR, p));
  console.log(`\n--- Provider: ${p} (${files.length} files) ---`);
  console.log(files.slice(0, 25).join(', '));
  if (files.length > 25) console.log(`... and ${files.length - 25} more`);
}
