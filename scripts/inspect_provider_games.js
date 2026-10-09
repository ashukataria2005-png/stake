const fs = require('fs');
const path = require('path');

const scratchDir = 'C:/Users/ashok/.gemini/antigravity-ide/brain/2f9baf99-78b2-4b53-a211-ad8d25f6b54e/scratch';
const allLotus = JSON.parse(fs.readFileSync(path.join(scratchDir, 'all_lotus_games.json'), 'utf8'));

const targetProviders = [
  'Evolution Gaming',
  'Ezugi',
  'Spribe',
  'Smartsoft Gaming',
  'JiLi Gaming',
  'Evoplay Entertainment',
  'Mac88 Gaming',
  'Turbo Games',
  'Turbogames',
  'Hacksaw Gaming',
  'Pragmatic Play'
];

const gamesByProvider = {};
for (const p of targetProviders) gamesByProvider[p] = [];

for (const g of allLotus) {
  const p = g.provider || g.provider_name;
  if (gamesByProvider[p]) {
    gamesByProvider[p].push({
      name: g.game_name || g.name,
      game_code: g.game_code,
      url_thumb: g.image || g.url_thumb,
      id: g.id,
      slug: g.slug
    });
  }
}

for (const [p, list] of Object.entries(gamesByProvider)) {
  console.log(`Provider "${p}": ${list.length} games`);
}

fs.writeFileSync(path.join(scratchDir, 'provider_games_map.json'), JSON.stringify(gamesByProvider, null, 2));
console.log('Saved provider_games_map.json');
