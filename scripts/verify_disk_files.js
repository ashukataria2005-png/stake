const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const GAMES_DIR = path.join(ROOT_DIR, 'public', 'games');

// 1. Mac88 (14)
const mac88 = [
  "mac88-lightning-dragon-tiger",
  "mac88-lightning-andar-bahar",
  "mac88-dragon-tiger-lion",
  "mac88-dragon-tiger-1-day",
  "mac88-dragon-tiger-2",
  "mac88-lightning-dragon-tiger-2",
  "mac88-29-baccarat",
  "mac88-lightning-baccarat",
  "mac88-sicbo-lightning-sicbo",
  "mac88-roulette",
  "mac88-turbo-auto-roulette",
  "mac88-speed-auto-roulette",
  "mac88-high-low",
  "mac88-dream-wheel"
];

// 2. Evolution (45)
const evo = [
  "ice-fishing",
  "xxxtreme-lightning-roulette",
  "spanish-roulette",
  "disco-roulette",
  "crazy-balls",
  "live-roulette",
  "lucky-baccarat",
  "infinite-free-bet-roulette",
  "red-baron",
  "monopoly-roulette",
  "japanese-baccarat",
  "power-blackjack",
  "korean-baccarat",
  "emperor-baccarat",
  "race-track",
  "hindi-baccarat",
  "japanese-roulette",
  "teen-patti",
  "lotus-baccarat",
  "easy-blackjack",
  "live-bac-bo",
  "football-studio",
  "turkish-roulette",
  "roulette-first-person",
  "dragon-dragon",
  "emperor-roulette",
  "infinite-fun-fun",
  "fireball-roulette",
  "hindi-roulette",
  "super-color-game",
  "infinite-bet-stacker",
  "marble-race",
  "war-live",
  "speed-auto-roulette",
  "lightning-sic-bo",
  "mega-ball",
  "lightning-roulette",
  "lotus-roulette",
  "emperor-dragon-tiger",
  "stake-baccarat",
  "peek-baccarat",
  "turkish-football-studio",
  "emperor-sic-bo",
  "korean-powerball",
  "emperor-bac-bo"
];

// 3. Ezugi (15)
const ezugi = [
  "teen-patti-live",
  "roulette-360",
  "royal-poker",
  "one-day-teen-patti",
  "sic-bo-live",
  "marina-casino-baccarat",
  "auto-roulette",
  "italian-roulette",
  "baccarat-super-6",
  "knockout-baccarat",
  "prestige-auto-roulette",
  "ruleta-del-sol",
  "golden-baccarat",
  "salsa-baccarat",
  "blackjack-salon"
];

function checkFiles(name, list) {
  let ok = 0;
  let missing = [];
  for (const slug of list) {
    const pWebp = path.join(GAMES_DIR, `${slug}.webp`);
    const pPng = path.join(GAMES_DIR, `${slug}.png`);
    const pJpg = path.join(GAMES_DIR, `${slug}.jpg`);
    if (fs.existsSync(pWebp) || fs.existsSync(pPng) || fs.existsSync(pJpg)) {
      ok++;
    } else {
      missing.push(slug);
    }
  }
  console.log(`${name}: ${ok} / ${list.length} present on disk.`);
  if (missing.length > 0) console.log('  Missing:', missing);
}

checkFiles('Mac88 Suite', mac88);
checkFiles('Evolution Suite', evo);
checkFiles('Ezugi Suite', ezugi);
