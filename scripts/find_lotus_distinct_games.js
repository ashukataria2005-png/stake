const fs = require('fs');
const path = require('path');

const scratchDir = 'C:/Users/ashok/.gemini/antigravity-ide/brain/2f9baf99-78b2-4b53-a211-ad8d25f6b54e/scratch';
const allLotus = JSON.parse(fs.readFileSync(path.join(scratchDir, 'all_lotus_games.json'), 'utf8'));
const evo = JSON.parse(fs.readFileSync(path.join(scratchDir, 'lotus_evolution.json'), 'utf8'));
const casino = JSON.parse(fs.readFileSync(path.join(scratchDir, 'lotus_casino.json'), 'utf8'));

console.log('allLotus isArray:', Array.isArray(allLotus), allLotus.length);
console.log('evo keys:', Object.keys(evo));
console.log('casino keys:', Object.keys(casino));

const evoList = Array.isArray(evo) ? evo : (evo.data || evo.games || Object.values(evo).find(Array.isArray) || []);
const casinoList = Array.isArray(casino) ? casino : (casino.data || casino.games || Object.values(casino).find(Array.isArray) || []);

console.log('evoList length:', evoList.length);
console.log('casinoList length:', casinoList.length);

const combined = [...allLotus, ...evoList, ...casinoList];

function searchLotus(query, providerFilter) {
  const q = query.toLowerCase();
  const matches = [];
  for (const g of combined) {
    const name = (g.name || g.game_name || '').toLowerCase();
    const provider = (g.provider_name || g.provider || '').toLowerCase();
    if (providerFilter && !provider.includes(providerFilter.toLowerCase())) {
      continue;
    }
    if (name.includes(q)) {
      const img = g.url_thumb || g.image || g.img || g.icon || g.game_code;
      matches.push({ name: g.name || g.game_name, provider: g.provider_name || g.provider, img, code: g.game_code });
    }
  }
  return matches;
}

const targets = [
  { q: 'disco', p: 'evolution' },
  { q: 'infinite', p: 'evolution' },
  { q: 'monopoly', p: 'evolution' },
  { q: 'ruleta', p: 'evolution' },
  { q: 'spanish', p: 'evolution' },
  { q: 'turkish', p: 'evolution' },
  { q: 'turkce', p: 'evolution' },
  { q: 'lotus roulette', p: '' },
  { q: 'bac bo', p: 'evolution' },
  { q: 'del sol', p: 'ezugi' },
  { q: 'italian', p: 'ezugi' },
  { q: 'sic bo', p: 'spribe' },
  { q: 'sic bo', p: 'smartsoft' },
  { q: 'sic bo', p: 'ezugi' },
  { q: 'teen patti', p: 'jili' },
  { q: 'football', p: 'evolution' },
  { q: 'studyosu', p: 'evolution' },
  { q: 'blackjack', p: 'hp' },
  { q: 'blackjack', p: 'jili' },
  { q: 'blackjack', p: 'smartsoft' },
  { q: 'blackjack', p: 'spribe' },
  { q: 'baccarat', p: 'jili' },
  { q: 'baccarat', p: 'smartsoft' },
  { q: 'baccarat', p: 'spribe' },
  { q: 'lucky baccarat', p: 'evolution' },
  { q: 'dragon tiger 2', p: '' },
  { q: 'penalty shoot', p: 'evoplay' },
  { q: 'plinko', p: 'smartsoft' },
  { q: 'keno', p: 'spribe' },
  { q: 'uncrossable', p: 'evoplay' },
  { q: 'balloon', p: 'smartsoft' },
  { q: 'cappadocia', p: 'smartsoft' },
  { q: 'double', p: 'smartsoft' },
  { q: 'roll', p: 'smartsoft' },
  { q: 'big bass', p: '' },
];

for (const t of targets) {
  const res = searchLotus(t.q, t.p);
  console.log(`\nQuery "${t.q}" (provider: "${t.p}") -> Found ${res.length}`);
  res.slice(0, 5).forEach(r => console.log(`  - [${r.provider}] ${r.name}: ${r.img || r.code}`));
}
