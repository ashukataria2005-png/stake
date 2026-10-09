const fs = require('fs');

const content = fs.readFileSync('src/data/stakeGames.ts', 'utf8');

const evoItems = [
  { orig: 'ruleta-en-espanol', targetTitle: 'Spanish Roulette' },
  { orig: 'roleta-ao-vivo', targetTitle: 'Live Roulette' },
  { orig: 'bac-bo', targetTitle: 'Live Bac Bo' },
  { orig: 'futbol-studio', targetTitle: 'Football Studio' },
  { orig: 'turkce-rulet', targetTitle: 'Turkish Roulette' },
  { orig: 'ruleta-bola-rapida-en-vivo', targetTitle: 'Speed Auto Roulette' },
  { orig: 'mega-bola', targetTitle: 'Mega Ball' },
  { orig: 'turkce-futbol-studyosu', targetTitle: 'Turkish Football Studio' },
];

for (const it of evoItems) {
  let idx = content.indexOf(it.orig);
  console.log(`Original slug "${it.orig}":`, idx !== -1 ? `found at ${idx}` : 'not found');
  let idxT = content.indexOf(it.targetTitle);
  console.log(`Target title "${it.targetTitle}":`, idxT !== -1 ? `found at ${idxT}` : 'not found');
}
