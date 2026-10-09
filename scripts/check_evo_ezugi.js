const fs = require('fs');
const path = require('path');

const scratchDir = 'C:/Users/ashok/.gemini/antigravity-ide/brain/2f9baf99-78b2-4b53-a211-ad8d25f6b54e/scratch';
const map = JSON.parse(fs.readFileSync(path.join(scratchDir, 'provider_games_map.json'), 'utf8'));

function findGames(provider, keywords) {
  const list = map[provider] || [];
  return list.filter(g => {
    const n = g.name.toLowerCase();
    return keywords.every(k => n.includes(k.toLowerCase()));
  });
}

console.log('--- Evolution Roulette Hits ---');
const evoRoulettes = findGames('Evolution Gaming', ['roulette']).concat(findGames('Evolution Gaming', ['rulet']));
evoRoulettes.forEach(r => console.log(`- ${r.name}: ${r.url_thumb}`));

console.log('\n--- Ezugi Roulette & Baccarat Hits ---');
const ezRoulettes = findGames('Ezugi', ['roulette']).concat(findGames('Ezugi', ['ruleta']));
ezRoulettes.forEach(r => console.log(`- ${r.name}: ${r.url_thumb}`));

const ezBaccarat = findGames('Ezugi', ['baccarat']);
ezBaccarat.forEach(r => console.log(`- ${r.name}: ${r.url_thumb}`));
