const fs = require('fs');
const path = require('path');

// Let's inspect stakeGames.ts
const stakeGamesContent = fs.readFileSync(path.join(__dirname, '../src/data/stakeGames.ts'), 'utf8');

// Find all providers mentioned in stakeGames.ts
const providerMatches = [...stakeGamesContent.matchAll(/"provider":\s*"([^"]+)"/g)].map(m => m[1]);
const providerCounts = {};
for (const p of providerMatches) {
  providerCounts[p] = (providerCounts[p] || 0) + 1;
}
console.log('Providers in stakeGames.ts:', providerCounts);

// Let's inspect gameThumbnails.ts
const gameThumbnailsContent = fs.readFileSync(path.join(__dirname, '../src/data/gameThumbnails.ts'), 'utf8');
const exportMatches = [...gameThumbnailsContent.matchAll(/export const ([A-Z0-9_]+): Record<string, string> = \{([\s\S]*?)\};/g)];
console.log('\nRegistries in gameThumbnails.ts:');
for (const m of exportMatches) {
  const regName = m[1];
  const body = m[2];
  const keys = [...body.matchAll(/"([^"]+)":/g)].map(k => k[1]);
  console.log(`- ${regName}: ${keys.length} keys`);
}
