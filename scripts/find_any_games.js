const fs = require('fs');
const path = require('path');

const scratchDir = 'C:/Users/ashok/.gemini/antigravity-ide/brain/2f9baf99-78b2-4b53-a211-ad8d25f6b54e/scratch';
const allLotus = JSON.parse(fs.readFileSync(path.join(scratchDir, 'all_lotus_games.json'), 'utf8'));

function findAny(terms) {
  const matches = [];
  for (const g of allLotus) {
    const name = (g.game_name || g.name || '').toLowerCase();
    if (terms.every(t => name.includes(t.toLowerCase()))) {
      matches.push({
        provider: g.provider,
        name: g.game_name || g.name,
        image: g.image,
        code: g.game_code
      });
    }
  }
  return matches;
}

const queries = [
  ['disco'],
  ['infinite'],
  ['monopoly'],
  ['turkish'],
  ['turkce'],
  ['cappadocia'],
  ['balloon'],
  ['double'],
  ['roll'],
  ['astronaut'],
  ['dragon tiger 2'],
  ['lightning dragon tiger'],
  ['big bass splash'],
  ['2 wild 2 die'],
  ['keno 80'],
  ['super spin'],
  ['shoot-out: street'],
  ['shoot-out street'],
  ['christmas roulette'],
  ['penalty roulette'],
  ['ruleta del sol'],
  ['sol'],
  ['salsa'],
  ['knockout'],
  ['super 6'],
  ['teen patti'],
  ['sic bo'],
  ['baccarat'],
  ['blackjack']
];

for (const q of queries) {
  const res = findAny(q);
  console.log(`\nQuery ${JSON.stringify(q)} -> ${res.length} matches`);
  res.slice(0, 4).forEach(r => console.log(`  [${r.provider}] ${r.name}: ${r.image}`));
}
