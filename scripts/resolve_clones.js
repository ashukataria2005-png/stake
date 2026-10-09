const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const scratchDir = 'C:/Users/ashok/.gemini/antigravity-ide/brain/2f9baf99-78b2-4b53-a211-ad8d25f6b54e/scratch';
const providerGames = JSON.parse(fs.readFileSync(path.join(scratchDir, 'provider_games_map.json'), 'utf8'));

// Read gameThumbnails.ts to get current provider mappings
const gameThumbnailsCode = fs.readFileSync(path.join(__dirname, '../src/data/gameThumbnails.ts'), 'utf8');

function extractRegistry(regName) {
  const regex = new RegExp(`export const ${regName}: Record<string, string> = \\{([\\s\\S]*?)\\};`);
  const match = gameThumbnailsCode.match(regex);
  if (!match) return {};
  const entries = {};
  const lines = match[1].split('\n');
  for (const line of lines) {
    const m = line.match(/"([^"]+)":\s*"([^"]+)"/);
    if (m) {
      entries[m[1]] = m[2];
    }
  }
  return entries;
}

const registries = {
  inout: extractRegistry('INOUT_GAME_THUMBNAILS'),
  evolution: extractRegistry('EVOLUTION_THUMBNAILS'),
  ezugi: extractRegistry('EZUGI_GAME_THUMBNAILS'),
  spribe: extractRegistry('SPRIBE_THUMBNAILS'),
  smartsoft: extractRegistry('SMARTSOFT_THUMBNAILS'),
  '100hp': extractRegistry('HP100_THUMBNAILS'),
  jili: extractRegistry('JILI_THUMBNAILS'),
  evoplay: extractRegistry('EVOPLAY_THUMBNAILS'),
  turbogames: extractRegistry('TURBOGAMES_THUMBNAILS'),
  pragmatic: extractRegistry('PRAGMATIC_THUMBNAILS'),
  hacksaw: extractRegistry('HACKSAW_THUMBNAILS'),
  mac88: extractRegistry('MAC88_THUMBNAILS'),
};

console.log('Registries summary:');
for (const [k, v] of Object.entries(registries)) {
  console.log(`- ${k}: ${Object.keys(v).length} entries, unique paths: ${new Set(Object.values(v)).size}`);
}

// Let's check hashes of all paths currently in registries
const GAMES_DIR = path.join(__dirname, '..', 'public', 'games');
const pathToHash = {};
const hashToPaths = {};

for (const [regName, reg] of Object.entries(registries)) {
  for (const [key, p] of Object.entries(reg)) {
    const full = path.join(__dirname, '..', 'public', p);
    if (fs.existsSync(full)) {
      const buf = fs.readFileSync(full);
      const hash = crypto.createHash('sha256').update(buf).digest('hex');
      pathToHash[p] = hash;
      if (!hashToPaths[hash]) hashToPaths[hash] = [];
      if (!hashToPaths[hash].includes(p)) {
        hashToPaths[hash].push(p);
      }
    } else {
      console.log('Path does not exist:', p);
    }
  }
}

const collidingHashes = Object.entries(hashToPaths).filter(([h, paths]) => paths.length > 1);
console.log(`\nColliding image paths currently referenced across registries: ${collidingHashes.length} hash groups`);
for (const [h, paths] of collidingHashes) {
  console.log(`Hash ${h.slice(0, 8)} (${paths.length} files):`);
  paths.forEach(p => console.log(`   ${p}`));
}
