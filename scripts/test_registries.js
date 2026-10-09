const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const GAMES_DIR = path.join(ROOT_DIR, 'public', 'games');

function getLocalGamePath(slug) {
  if (fs.existsSync(path.join(GAMES_DIR, `${slug}.webp`))) return `/games/${slug}.webp`;
  if (fs.existsSync(path.join(GAMES_DIR, `${slug}.png`))) return `/games/${slug}.png`;
  if (fs.existsSync(path.join(GAMES_DIR, `${slug}.jpg`))) return `/games/${slug}.jpg`;
  if (fs.existsSync(path.join(GAMES_DIR, `${slug}.jpeg`))) return `/games/${slug}.jpeg`;
  // Fallback to .webp
  return `/games/${slug}.webp`;
}

// 1. MAC88
const mac88Thumbnails = {
  "mac88-lightning-dragon-tiger": getLocalGamePath("mac88-lightning-dragon-tiger"),
  "lightning-dragon-tiger": getLocalGamePath("mac88-lightning-dragon-tiger"),
  "mac88-lightning-andar-bahar": getLocalGamePath("mac88-lightning-andar-bahar"),
  "lightning-andar-bahar": getLocalGamePath("mac88-lightning-andar-bahar"),
  "mac88-dragon-tiger-lion": getLocalGamePath("mac88-dragon-tiger-lion"),
  "dragon-tiger-lion": getLocalGamePath("mac88-dragon-tiger-lion"),
  "mac88-dragon-tiger-1-day": getLocalGamePath("mac88-dragon-tiger-1-day"),
  "dragon-tiger-1-day": getLocalGamePath("mac88-dragon-tiger-1-day"),
  "mac88-dragon-tiger-2": getLocalGamePath("mac88-dragon-tiger-2"),
  "dragon-tiger-2": getLocalGamePath("mac88-dragon-tiger-2"),
  "mac88-lightning-dragon-tiger-2": getLocalGamePath("mac88-lightning-dragon-tiger-2"),
  "lightning-dragon-tiger-2": getLocalGamePath("mac88-lightning-dragon-tiger-2"),
  "mac88-29-baccarat": getLocalGamePath("mac88-29-baccarat"),
  "29-baccarat": getLocalGamePath("mac88-29-baccarat"),
  "mac88-lightning-baccarat": getLocalGamePath("mac88-lightning-baccarat"),
  "lightning-baccarat": getLocalGamePath("mac88-lightning-baccarat"),
  "mac88-sicbo-lightning-sicbo": getLocalGamePath("mac88-sicbo-lightning-sicbo"),
  "sicbo-lightning-sicbo": getLocalGamePath("mac88-sicbo-lightning-sicbo"),
  "mac88-roulette": getLocalGamePath("mac88-roulette"),
  "mac88-turbo-auto-roulette": getLocalGamePath("mac88-turbo-auto-roulette"),
  "turbo-auto-roulette": getLocalGamePath("mac88-turbo-auto-roulette"),
  "mac88-speed-auto-roulette": getLocalGamePath("mac88-speed-auto-roulette"),
  "speed-auto-roulette": getLocalGamePath("mac88-speed-auto-roulette"),
  "mac88-high-low": getLocalGamePath("mac88-high-low"),
  "high-low": getLocalGamePath("mac88-high-low"),
  "mac88-dream-wheel": getLocalGamePath("mac88-dream-wheel"),
  "dream-wheel": getLocalGamePath("mac88-dream-wheel"),
  "dream-will": getLocalGamePath("mac88-dream-wheel"),
  "mac88": getLocalGamePath("mac88"),
};

// 2. EVOLUTION
const evoSlugs = [
  "ice-fishing",
  "xxxtreme-lightning-roulette",
  "spanish-roulette",
  "ruleta-en-espanol",
  "disco-roulette",
  "crazy-balls",
  "live-roulette",
  "roleta-ao-vivo",
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
  "bac-bo",
  "football-studio",
  "futbol-studio",
  "turkish-roulette",
  "turkce-rulet",
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
  "ruleta-bola-rapida-en-vivo",
  "lightning-sic-bo",
  "mega-ball",
  "mega-bola",
  "lightning-roulette",
  "lotus-roulette",
  "emperor-dragon-tiger",
  "stake-baccarat",
  "peek-baccarat",
  "turkish-football-studio",
  "turkce-futbol-studyosu",
  "emperor-sic-bo",
  "korean-powerball",
  "emperor-bac-bo",
  // Other existing evolution staples
  "live-blackjack",
  "crazy-time",
  "live-baccarat",
  "dragon-tiger",
  "red-door-roulette",
  "immersive-roulette",
  "lightning-storm",
  "monopoly-live",
  "funky-time",
  "monopoly-big-baller",
  "stock-market",
  "casino-holdem",
  "lightning-blackjack",
  "extreme-texas-holdem",
  "fan-tan",
  "crazy-coin-flip",
  "lightning-dice",
  "super-andar-bahar",
  "gold-vault-roulette",
  "video-poker",
  "dead-or-alive-saloon",
  "super-sic-bo",
  "baccarat-squeezy",
  "free-bet-blackjack",
  "speed-baccarat",
  "three-card-poker",
  "caribbean-stud-poker",
  "craps-live",
  "side-bet-city",
  "texas-holdem-bonus-poker",
  "dragon-tiger-live",
  "bac-bo-live",
  "lightning-lotto",
  "football-studio-dice"
];

const evolutionThumbnails = {};
for (const s of evoSlugs) {
  evolutionThumbnails[s] = getLocalGamePath(s);
}

// 3. EZUGI
const ezugiSlugs = [
  "teen-patti-live",
  "ezugi-teen-patti-live",
  "roulette-360",
  "ezugi-roulette-360",
  "royal-poker",
  "ezugi-royal-poker",
  "one-day-teen-patti",
  "ezugi-one-day-teen-patti",
  "sic-bo-live",
  "ezugi-sic-bo-live",
  "marina-casino-baccarat",
  "ezugi-marina-casino-baccarat",
  "auto-roulette",
  "ezugi-auto-roulette",
  "italian-roulette",
  "ezugi-italian-roulette",
  "baccarat-super-6",
  "ezugi-baccarat-super-6",
  "knockout-baccarat",
  "ezugi-knockout-baccarat",
  "prestige-auto-roulette",
  "ezugi-prestige-auto-roulette",
  "ruleta-del-sol",
  "ezugi-ruleta-del-sol",
  "golden-baccarat",
  "ezugi-golden-baccarat",
  "salsa-baccarat",
  "ezugi-salsa-baccarat",
  "blackjack-salon",
  "ezugi-blackjack-salon",
  // Other existing staples
  "ezugi-lucky-7",
  "ezugi-32-cards",
  "ezugi-andar-bahar",
  "ezugi-dragon-tiger",
  "ezugi-ultimate-sic-bo",
  "ezugi-live-roulette",
  "ezugi-blackjack",
  "ezugi-baccarat"
];

const ezugiThumbnails = {};
for (const s of ezugiSlugs) {
  ezugiThumbnails[s] = getLocalGamePath(s);
}

// 4. SPRIBE
const spribeSlugs = [
  "aviator",
  "spribe-plinko",
  "spribe-goal",
  "spribe-mines",
  "spribe-dice",
  "spribe-hilo",
  "spribe-hotline",
  "spribe-mini-roulette",
  "spribe-keno",
  "spribe-balloon",
  "spribe-scratch",
  "spribe-fortune-wheel",
  "spribe-blackjack",
  "spribe-russian-poker",
  "spribe-keno-80",
  "spribe-starline",
  "spribe-baccarat",
  "spribe-sic-bo"
];

const spribeThumbnails = {};
for (const s of spribeSlugs) {
  spribeThumbnails[s] = getLocalGamePath(s);
}

// 5. SMARTSOFT
const smartsoftSlugs = [
  "towerx",
  "rollx",
  "jetx",
  "smartsoft-balloon",
  "plinko-x",
  "smartsoft-lucky-7",
  "cricket-x",
  "helicopter-x",
  "smash-x",
  "double-x",
  "plinko-x-classic",
  "propel-x",
  "car-x",
  "smartsoft-roulette",
  "smartsoft-blackjack",
  "smartsoft-sic-bo",
  "smartsoft-baccarat",
  "football-x",
  "cappadocia"
];

const smartsoftThumbnails = {};
for (const s of smartsoftSlugs) {
  smartsoftThumbnails[s] = getLocalGamePath(s);
}

// 6. 100HP
const hp100Slugs = [
  "astronaut",
  "airjet",
  "chicken-tour",
  "starx",
  "chicken-vs-train",
  "tappy-bird",
  "astronaut-rivals",
  "hp100-turbo-roulette",
  "hp100-arcade-blackjack",
  "hp100-turbo-dice",
  "hp100-multiplier-blast",
  "hp100-retro-turbo-reels",
  "hp100-cyber-rush"
];

const hp100Thumbnails = {};
for (const s of hp100Slugs) {
  hp100Thumbnails[s] = getLocalGamePath(s);
}

// 7. JILI
const jiliSlugs = [
  "jili-mines",
  "gorush",
  "jili-hilo",
  "jili-andar-bahar",
  "jili-tower",
  "jili-limbo",
  "big-small",
  "keno-extra-bet",
  "jili-baccarat",
  "jili-blackjack",
  "jili-roulette",
  "jili-dragon-tiger",
  "jili-sic-bo",
  "7-up-7-down",
  "jili-teen-patti",
  "poker-king",
  "super-ace",
  "golden-empire",
  "fortune-gems",
  "lucky-bingo"
];

const jiliThumbnails = {};
for (const s of jiliSlugs) {
  jiliThumbnails[s] = getLocalGamePath(s);
}

// 8. EVOPLAY
const evoplaySlugs = [
  "thimbles",
  "penalty-shoot-out-street",
  "penalty-shoot-out-super-spin",
  "penalty-shoot-out",
  "hockey-shootout",
  "uncrossable-rush",
  "uncrossable-rush-x-mas",
  "plinko-blast",
  "red-queen",
  "four-aces",
  "more-or-less",
  "french-roulette",
  "european-christmas-roulette",
  "penalty-roulette",
  "european-roulette",
  "baccarat-777",
  "blackjack-lucky-sevens"
];

const evoplayThumbnails = {};
for (const s of evoplaySlugs) {
  evoplayThumbnails[s] = getLocalGamePath(s);
}

console.log('Sample outputs:');
console.log('Mac88 count:', Object.keys(mac88Thumbnails).length);
console.log('Evo count:', Object.keys(evolutionThumbnails).length);
console.log('Ezugi count:', Object.keys(ezugiThumbnails).length);
console.log('Spribe count:', Object.keys(spribeThumbnails).length);
console.log('Smartsoft count:', Object.keys(smartsoftThumbnails).length);
console.log('100hp count:', Object.keys(hp100Thumbnails).length);
console.log('Jili count:', Object.keys(jiliThumbnails).length);
console.log('Evoplay count:', Object.keys(evoplayThumbnails).length);
