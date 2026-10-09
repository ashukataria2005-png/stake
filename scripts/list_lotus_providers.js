const fs = require('fs');
const path = require('path');

const scratchDir = 'C:/Users/ashok/.gemini/antigravity-ide/brain/2f9baf99-78b2-4b53-a211-ad8d25f6b54e/scratch';
const allLotus = JSON.parse(fs.readFileSync(path.join(scratchDir, 'all_lotus_games.json'), 'utf8'));

const providers = {};
for (const g of allLotus) {
  const p = g.provider_name || g.provider || 'unknown';
  providers[p] = (providers[p] || 0) + 1;
}
console.log('Providers in allLotus:');
for (const [k, v] of Object.entries(providers).sort((a,b) => b[1] - a[1])) {
  console.log(`- ${k}: ${v}`);
}
