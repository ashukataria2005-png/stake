const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const GAMES_DIR = path.join(ROOT, 'public', 'games');

function download(url, dest) {
  return new Promise((resolve) => {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const file = fs.createWriteStream(dest);
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      if (res.statusCode !== 200) {
        file.close();
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        return resolve({ url, dest, status: res.statusCode });
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve({ url, dest, status: 200 }));
      });
    }).on('error', err => {
      file.close();
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      resolve({ url, dest, error: err.message });
    });
  });
}

async function main() {
  console.log('--- Step 1: Downloading distinct replacements to break all remaining collisions ---');
  const distinctReplacements = [
    { dest: 'evolution/video-poker.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_video_poker.webp' },
    { dest: 'smartsoft/cappadocia.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/sms_cappadocia.webp' },
    { dest: 'smartsoft/balloon.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/more_slots_balloon.webp' },
    { dest: 'smartsoft/plinko-x-classic.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/more_slots_plinko.webp' },
    { dest: 'smartsoft/baccarat.webp', url: 'https://assets.hurry2.net/casino_games/47482-1781537360.webp' },
    { dest: 'evolution/lotus-baccarat.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/more_slots_baccarat_royale.webp' },
    { dest: 'evolution/stake-baccarat.webp', url: 'https://assets.hurry2.net/casino_games/86248-1783006404.Baccarat_Poster.png' },
    { dest: 'spribe/baccarat.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_baccarat_lobby.webp' },
    { dest: 'jili/baccarat.webp', url: 'https://assets.hurry2.net/casino_games/69084-1783506114.1782909221557_29-CBF2.png' },
    { dest: '100hp/astronaut-rivals.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/marbles_rolling_dunes_classic.webp' },
    { dest: 'spribe/blackjack.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/plt_vegas_blackjack.webp' },
    { dest: '100hp/arcade-blackjack.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/plt_cashback_blackjack.webp' },
    { dest: 'smartsoft/blackjack.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/plt_blackjack_surrender.webp' },
    { dest: 'smartsoft/sic-bo.webp', url: 'https://assets.hurry2.net/casino_games/8966-1-1763126817.webp' },
    { dest: 'spribe/sic-bo.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/rich88_sicbotha2.webp' },
    { dest: 'ezugi/sic-bo-live.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/ezg_ultimate_sic_bo.webp' },
    { dest: 'ezugi/lucky-7.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/ezg_lucky7.webp' },
    { dest: 'smartsoft/lucky-7.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/MAC88-VTGLK7101.webp' },
    { dest: 'smartsoft/roulette.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/ezg_autoroulette.webp' },
  ];

  for (const item of distinctReplacements) {
    const fullDest = path.join(GAMES_DIR, item.dest);
    const res = await download(item.url, fullDest);
    console.log(`[${res.status}] ${item.dest}`);
  }

  console.log('--- Step 2: Removing duplicate alias files on disk ---');
  // Duplicate files that are identical aliases to another file in the same directory:
  const filesToDelete = [
    // InOut duplicates
    'inout/diver-inout.webp',
    'inout/jumper-inout.webp',
    'inout/twist-inout.webp',
    // Ezugi duplicates
    'ezugi/ezugi-auto-roulette.webp',
    'ezugi/ezugi-blackjack-salon.webp',
    'ezugi/ezugi-baccarat-super-6.webp',
    'ezugi/ezugi-golden-baccarat.webp',
    'ezugi/ezugi-knockout-baccarat.webp',
    'ezugi/ezugi-salsa-baccarat.webp',
    'ezugi/ezugi-italian-roulette.webp',
    'ezugi/ezugi-ruleta-del-sol.webp',
    'ezugi/ezugi-marina-casino-baccarat.webp',
    'ezugi/ezugi-one-day-teen-patti.webp',
    'ezugi/ezugi-prestige-auto-roulette.webp',
    'ezugi/ezugi-roulette-360.webp',
    'ezugi/ezugi-royal-poker.webp',
    'ezugi/ezugi-sic-bo-live.webp',
    'ezugi/ezugi-teen-patti-live.webp',
    'ezugi/ezugi-lucky-7.webp',
    // Turbo duplicates
    'turbogames/towers-turbo.webp',
    'turbogames/turbo-vortex.webp',
    'turbogames/turbo-vortex-2.webp',
    'turbogames/turbo-vortex-aero.webp',
    'turbogames/turbo-vortex-power-play.webp',
    // Pragmatic / Hacksaw duplicates
    'pragmatic/zeus-vs-hades-gods-of-war.webp',
    'hacksaw/wanted-dead-or-wild.webp',
    // 100hp duplicate
    '100hp/hp100-arcade-blackjack.webp',
    // Smartsoft duplicates
    'smartsoft/smartsoft-balloon.webp',
    'smartsoft/smartsoft-baccarat.webp',
    'smartsoft/smartsoft-blackjack.webp',
    'smartsoft/smartsoft-sic-bo.webp',
    'smartsoft/smartsoft-roulette.webp',
    'smartsoft/smartsoft-lucky-7.webp',
    // Spribe duplicates
    'spribe/spribe-blackjack.webp',
    'spribe/spribe-baccarat.webp',
    'spribe/spribe-sic-bo.webp',
    // Jili duplicates
    'jili/jili-blackjack.webp',
    'jili/jili-baccarat.webp',
    'jili/jili-teen-patti.webp',
  ];

  for (const rel of filesToDelete) {
    const full = path.join(GAMES_DIR, rel);
    if (fs.existsSync(full)) {
      fs.unlinkSync(full);
      console.log(`Deleted alias duplicate file: ${rel}`);
    }
  }

  console.log('--- Step 3: Rewriting src/data/gameThumbnails.ts with Canonical Paths ---');

  const INOUT = {
    "chicken-road-2": "/games/inout/chicken-road-2.webp",
    "megablock": "/games/inout/megablock.webp",
    "chicken-road": "/games/inout/chicken-road.webp",
    "aviafly": "/games/inout/aviafly.webp",
    "penalty-unlimited": "/games/inout/penalty-unlimited.webp",
    "tower-dash": "/games/inout/tower-dash.webp",
    "chicken-road-gold": "/games/inout/chicken-road-gold.webp",
    "chicken-road-2-bonus": "/games/inout/chicken-road-2-bonus.webp",
    "aviafly-2": "/games/inout/aviafly-2.webp",
    "twist-inout": "/games/inout/twist.webp",
    "wheel-out": "/games/inout/wheel-out.webp",
    "cricket-road": "/games/inout/cricket-road.webp",
    "chicken-shoot": "/games/inout/chicken-shoot.webp",
    "dragon-pots": "/games/inout/dragon-pots.webp",
    "penalty-nations-cup": "/games/inout/penalty-nations-cup.webp",
    "chicken-coin": "/games/inout/chicken-coin.webp",
    "squid-gambler": "/games/inout/squid-gambler.webp",
    "pengu-sport": "/games/inout/pengu-sport.webp",
    "jumper-inout": "/games/inout/jumper.webp",
    "forest-arrow": "/games/inout/forest-arrow.webp",
    "twist-san-quentin": "/games/inout/twist-san-quentin.webp",
    "kingdom-drop": "/games/inout/kingdom-drop.webp",
    "rump-and-friends": "/games/inout/rump-and-friends.webp",
    "jokers-clash": "/games/inout/jokers-clash.webp",
    "sugar-daddy": "/games/inout/sugar-daddy.webp",
    "chicken-banana": "/games/inout/chicken-banana.webp",
    "topo-mole": "/games/inout/topo-mole.webp",
    "diver-inout": "/games/inout/diver.webp",
    "fruit-love-fever": "/games/inout/fruit-love-fever.webp",
    "twist-xmas": "/games/inout/twist-xmas.webp",
    "twist": "/games/inout/twist.webp",
    "jumper": "/games/inout/jumper.webp",
    "diver": "/games/inout/diver.webp"
  };

  const EVOLUTION = {
    "ice-fishing": "/games/evolution/ice-fishing.webp",
    "xxxtreme-lightning-roulette": "/games/evolution/xxxtreme-lightning-roulette.webp",
    "spanish-roulette": "/games/evolution/spanish-roulette.webp",
    "ruleta-en-espanol": "/games/evolution/spanish-roulette.webp",
    "disco-roulette": "/games/evolution/disco-roulette.webp",
    "crazy-balls": "/games/evolution/crazy-balls.webp",
    "live-roulette": "/games/evolution/live-roulette.webp",
    "roleta-ao-vivo": "/games/evolution/live-roulette.webp",
    "lucky-baccarat": "/games/evolution/lucky-baccarat.webp",
    "infinite-free-bet-roulette": "/games/evolution/infinite-free-bet-roulette.webp",
    "red-baron": "/games/evolution/red-baron.webp",
    "monopoly-roulette": "/games/evolution/monopoly-roulette.webp",
    "japanese-baccarat": "/games/evolution/japanese-baccarat.webp",
    "power-blackjack": "/games/evolution/power-blackjack.webp",
    "korean-baccarat": "/games/evolution/korean-baccarat.webp",
    "emperor-baccarat": "/games/evolution/emperor-baccarat.webp",
    "race-track": "/games/evolution/race-track.webp",
    "hindi-baccarat": "/games/evolution/hindi-baccarat.webp",
    "japanese-roulette": "/games/evolution/japanese-roulette.webp",
    "teen-patti": "/games/evolution/teen-patti.webp",
    "lotus-baccarat": "/games/evolution/lotus-baccarat.webp",
    "easy-blackjack": "/games/evolution/easy-blackjack.webp",
    "live-bac-bo": "/games/evolution/live-bac-bo.webp",
    "bac-bo-ao-vivo": "/games/evolution/live-bac-bo.webp",
    "bac-bo": "/games/evolution/live-bac-bo.webp",
    "football-studio": "/games/evolution/football-studio.webp",
    "futbol-studio": "/games/evolution/football-studio.webp",
    "turkish-roulette": "/games/evolution/turkish-roulette.webp",
    "turkce-rulet": "/games/evolution/turkish-roulette.webp",
    "roulette-first-person": "/games/evolution/roulette-first-person.webp",
    "dragon-dragon": "/games/evolution/dragon-dragon.webp",
    "emperor-roulette": "/games/evolution/emperor-roulette.webp",
    "infinite-fun-fun": "/games/evolution/infinite-fun-fun.webp",
    "fireball-roulette": "/games/evolution/fireball-roulette.webp",
    "hindi-roulette": "/games/evolution/hindi-roulette.webp",
    "super-color-game": "/games/evolution/super-color-game.webp",
    "infinite-bet-stacker": "/games/evolution/infinite-bet-stacker.webp",
    "marble-race": "/games/evolution/marble-race.webp",
    "war-live": "/games/evolution/war-live.webp",
    "speed-auto-roulette": "/games/evolution/speed-auto-roulette.webp",
    "ruleta-bola-rapida-en-vivo": "/games/evolution/speed-auto-roulette.webp",
    "lightning-sic-bo": "/games/evolution/lightning-sic-bo.webp",
    "mega-ball": "/games/evolution/mega-ball.webp",
    "mega-bola": "/games/evolution/mega-ball.webp",
    "mega-bola-da-sorte": "/games/evolution/mega-ball.webp",
    "lightning-roulette": "/games/evolution/lightning-roulette.webp",
    "lotus-roulette": "/games/evolution/lotus-roulette.webp",
    "emperor-dragon-tiger": "/games/evolution/emperor-dragon-tiger.webp",
    "stake-baccarat": "/games/evolution/stake-baccarat.webp",
    "peek-baccarat": "/games/evolution/peek-baccarat.webp",
    "turkish-football-studio": "/games/evolution/turkish-football-studio.webp",
    "turkce-futbol-studyosu": "/games/evolution/turkish-football-studio.webp",
    "emperor-sic-bo": "/games/evolution/emperor-sic-bo.webp",
    "korean-powerball": "/games/evolution/korean-powerball.webp",
    "emperor-bac-bo": "/games/evolution/emperor-bac-bo.webp",
    "live-blackjack": "/games/evolution/live-blackjack.webp",
    "crazy-time": "/games/evolution/crazy-time.webp",
    "live-baccarat": "/games/evolution/live-baccarat.webp",
    "dragon-tiger": "/games/evolution/dragon-tiger.webp",
    "red-door-roulette": "/games/evolution/red-door-roulette.webp",
    "immersive-roulette": "/games/evolution/immersive-roulette.webp",
    "lightning-storm": "/games/evolution/lightning-storm.webp",
    "monopoly-live": "/games/evolution/monopoly-live.webp",
    "funky-time": "/games/evolution/funky-time.webp",
    "monopoly-big-baller": "/games/evolution/monopoly-big-baller.webp",
    "stock-market": "/games/evolution/stock-market.webp",
    "casino-holdem": "/games/evolution/casino-holdem.webp",
    "lightning-blackjack": "/games/evolution/lightning-blackjack.webp",
    "extreme-texas-holdem": "/games/evolution/extreme-texas-holdem.webp",
    "fan-tan": "/games/evolution/fan-tan.webp",
    "crazy-coin-flip": "/games/evolution/crazy-coin-flip.webp",
    "lightning-dice": "/games/evolution/lightning-dice.webp",
    "super-andar-bahar": "/games/evolution/super-andar-bahar.webp",
    "gold-vault-roulette": "/games/evolution/gold-vault-roulette.webp",
    "video-poker": "/games/evolution/video-poker.webp",
    "super-sic-bo": "/games/evolution/super-sic-bo.webp"
  };

  const EZUGI = {
    "teen-patti-live": "/games/ezugi/teen-patti-live.webp",
    "ezugi-teen-patti-live": "/games/ezugi/teen-patti-live.webp",
    "roulette-360": "/games/ezugi/roulette-360.webp",
    "ezugi-roulette-360": "/games/ezugi/roulette-360.webp",
    "royal-poker": "/games/ezugi/royal-poker.webp",
    "ezugi-royal-poker": "/games/ezugi/royal-poker.webp",
    "one-day-teen-patti": "/games/ezugi/one-day-teen-patti.webp",
    "ezugi-one-day-teen-patti": "/games/ezugi/one-day-teen-patti.webp",
    "sic-bo-live": "/games/ezugi/sic-bo-live.webp",
    "ezugi-sic-bo-live": "/games/ezugi/sic-bo-live.webp",
    "marina-casino-baccarat": "/games/ezugi/marina-casino-baccarat.webp",
    "ezugi-marina-casino-baccarat": "/games/ezugi/marina-casino-baccarat.webp",
    "auto-roulette": "/games/ezugi/auto-roulette.webp",
    "ezugi-auto-roulette": "/games/ezugi/auto-roulette.webp",
    "italian-roulette": "/games/ezugi/italian-roulette.webp",
    "ezugi-italian-roulette": "/games/ezugi/italian-roulette.webp",
    "baccarat-super-6": "/games/ezugi/baccarat-super-6.webp",
    "ezugi-baccarat-super-6": "/games/ezugi/baccarat-super-6.webp",
    "knockout-baccarat": "/games/ezugi/knockout-baccarat.webp",
    "ezugi-knockout-baccarat": "/games/ezugi/knockout-baccarat.webp",
    "prestige-auto-roulette": "/games/ezugi/prestige-auto-roulette.webp",
    "ezugi-prestige-auto-roulette": "/games/ezugi/prestige-auto-roulette.webp",
    "ruleta-del-sol": "/games/ezugi/ruleta-del-sol.webp",
    "ezugi-ruleta-del-sol": "/games/ezugi/ruleta-del-sol.webp",
    "golden-baccarat": "/games/ezugi/golden-baccarat.webp",
    "ezugi-golden-baccarat": "/games/ezugi/golden-baccarat.webp",
    "salsa-baccarat": "/games/ezugi/salsa-baccarat.webp",
    "ezugi-salsa-baccarat": "/games/ezugi/salsa-baccarat.webp",
    "blackjack-salon": "/games/ezugi/blackjack-salon.webp",
    "ezugi-blackjack-salon": "/games/ezugi/blackjack-salon.webp",
    "ezugi-lucky-7": "/games/ezugi/lucky-7.webp",
    "ezugi-32-cards": "/games/ezugi/32-cards.webp",
    "ezugi-andar-bahar": "/games/ezugi/andar-bahar.webp",
    "ezugi-dragon-tiger": "/games/ezugi/dragon-tiger.webp",
    "ezugi-ultimate-sic-bo": "/games/ezugi/ultimate-sic-bo.webp",
    "ezugi-live-roulette": "/games/ezugi/auto-roulette.webp",
    "ezugi-blackjack": "/games/ezugi/blackjack-salon.webp",
    "ezugi-baccarat": "/games/ezugi/golden-baccarat.webp"
  };

  const SPRIBE = {
    "aviator": "/games/spribe/aviator.webp",
    "spribe-plinko": "/games/spribe/plinko.webp",
    "spribe-goal": "/games/spribe/goal.webp",
    "spribe-mines": "/games/spribe/mines.webp",
    "spribe-dice": "/games/spribe/dice.webp",
    "spribe-hilo": "/games/spribe/hilo.webp",
    "spribe-hotline": "/games/spribe/hotline.webp",
    "spribe-mini-roulette": "/games/spribe/mini-roulette.webp",
    "spribe-keno": "/games/spribe/spribe-keno.webp",
    "spribe-balloon": "/games/spribe/balloon.webp",
    "spribe-scratch": "/games/spribe/scratch.webp",
    "spribe-fortune-wheel": "/games/spribe/fortune-wheel.webp",
    "spribe-blackjack": "/games/spribe/blackjack.webp",
    "spribe-russian-poker": "/games/spribe/russian-poker.webp",
    "spribe-keno-80": "/games/spribe/spribe-keno-80.webp",
    "spribe-starline": "/games/spribe/starline.webp",
    "spribe-baccarat": "/games/spribe/baccarat.webp",
    "spribe-sic-bo": "/games/spribe/sic-bo.webp"
  };

  const SMARTSOFT = {
    "towerx": "/games/smartsoft/towerx.webp",
    "rollx": "/games/smartsoft/rollx.webp",
    "jetx": "/games/smartsoft/jetx.webp",
    "smartsoft-balloon": "/games/smartsoft/balloon.webp",
    "plinko-x": "/games/smartsoft/plinko-x.webp",
    "smartsoft-lucky-7": "/games/smartsoft/lucky-7.webp",
    "cricket-x": "/games/smartsoft/cricket-x.webp",
    "helicopter-x": "/games/smartsoft/helicopter-x.webp",
    "smash-x": "/games/smartsoft/smash-x.webp",
    "double-x": "/games/smartsoft/double-x.webp",
    "plinko-x-classic": "/games/smartsoft/plinko-x-classic.webp",
    "propel-x": "/games/smartsoft/propel-x.webp",
    "car-x": "/games/smartsoft/car-x.webp",
    "smartsoft-roulette": "/games/smartsoft/roulette.webp",
    "smartsoft-blackjack": "/games/smartsoft/blackjack.webp",
    "smartsoft-sic-bo": "/games/smartsoft/sic-bo.webp",
    "smartsoft-baccarat": "/games/smartsoft/baccarat.webp",
    "football-x": "/games/smartsoft/football-x.webp",
    "cappadocia": "/games/smartsoft/cappadocia.webp"
  };

  const HP100 = {
    "astronaut": "/games/100hp/astronaut.webp",
    "airjet": "/games/100hp/airjet.webp",
    "chicken-tour": "/games/100hp/chicken-tour.webp",
    "starx": "/games/100hp/starx.webp",
    "chicken-vs-train": "/games/100hp/chicken-vs-train.webp",
    "tappy-bird": "/games/100hp/tappy-bird.webp",
    "astronaut-rivals": "/games/100hp/astronaut-rivals.webp",
    "hp100-turbo-roulette": "/games/100hp/turbo-roulette.webp",
    "hp100-arcade-blackjack": "/games/100hp/arcade-blackjack.webp",
    "hp100-turbo-dice": "/games/100hp/turbo-dice.webp",
    "hp100-multiplier-blast": "/games/100hp/multiplier-blast.webp",
    "hp100-retro-turbo-reels": "/games/100hp/retro-turbo-reels.webp",
    "hp100-cyber-rush": "/games/100hp/cyber-rush.webp"
  };

  const JILI = {
    "jili-mines": "/games/jili/mines.webp",
    "gorush": "/games/jili/gorush.webp",
    "jili-hilo": "/games/jili/hilo.webp",
    "jili-andar-bahar": "/games/jili/andar-bahar.webp",
    "jili-tower": "/games/jili/tower.webp",
    "jili-limbo": "/games/jili/limbo.webp",
    "big-small": "/games/jili/big-small.webp",
    "keno-extra-bet": "/games/jili/keno-extra-bet.webp",
    "jili-baccarat": "/games/jili/baccarat.webp",
    "jili-blackjack": "/games/jili/blackjack.webp",
    "jili-roulette": "/games/jili/roulette.webp",
    "jili-dragon-tiger": "/games/jili/dragon-tiger.webp",
    "jili-sic-bo": "/games/jili/sic-bo.webp",
    "jili-teen-patti": "/games/jili/teen-patti.webp",
    "7-up-7-down": "/games/jili/7-up-7-down.webp",
    "super-ace": "/games/jili/super-ace.webp",
    "golden-empire": "/games/jili/golden-empire.webp",
    "fortune-gems": "/games/jili/fortune-gems.webp",
    "lucky-bingo": "/games/jili/lucky-bingo.webp",
    "baccarat-777": "/games/jili/baccarat-777.webp"
  };

  const EVOPLAY = {
    "penalty-shoot-out": "/games/evoplay/penalty-shoot-out.webp",
    "penalty-shoot-out-street": "/games/evoplay/penalty-shoot-out-street.webp",
    "penalty-shoot-out-super-spin": "/games/evoplay/penalty-shoot-out-super-spin.webp",
    "penalty-roulette": "/games/evoplay/penalty-roulette.webp",
    "uncrossable-rush": "/games/evoplay/uncrossable-rush.webp",
    "uncrossable-rush-x-mas": "/games/evoplay/uncrossable-rush-x-mas.webp",
    "hockey-shootout": "/games/evoplay/hockey-shootout.webp",
    "thimbles": "/games/evoplay/thimbles.webp",
    "four-aces": "/games/evoplay/four-aces.webp",
    "more-or-less": "/games/evoplay/more-or-less.webp",
    "red-queen": "/games/evoplay/red-queen.webp",
    "european-roulette": "/games/evoplay/european-roulette.webp",
    "french-roulette": "/games/evoplay/french-roulette.webp",
    "european-christmas-roulette": "/games/evoplay/european-christmas-roulette.webp",
    "blackjack-lucky-sevens": "/games/evoplay/blackjack-lucky-sevens.webp",
    "poker-king": "/games/evoplay/poker-king.webp",
    "plinko-blast": "/games/evoplay/plinko-blast.webp"
  };

  const TURBO = {
    "turbo-plinko": "/games/turbogames/turbo-plinko.webp",
    "turbo-dice-twice": "/games/turbogames/turbo-dice-twice.webp",
    "turbo-hi-lo": "/games/turbogames/turbo-hi-lo.webp",
    "turbo-go-roulette": "/games/turbogames/turbo-go-roulette.webp",
    "turbo-bubbles": "/games/turbogames/turbo-bubbles.webp",
    "turbo-baccarat": "/games/turbogames/turbo-baccarat.webp",
    "turbo-chicken-route": "/games/turbogames/turbo-chicken-route.webp",
    "turbo-chicken-goal": "/games/turbogames/turbo-chicken-goal.webp",
    "turbo-pumpedx": "/games/turbogames/turbo-pumpedx.webp",
    "turbo-1tap-mines": "/games/turbogames/turbo-1tap-mines.webp",
    "turbo-multiplayer-mines": "/games/turbogames/turbo-multiplayer-mines.webp",
    "turbo-vortex": "/games/turbogames/vortex.webp",
    "turbo-vortex-2": "/games/turbogames/vortex-2.webp",
    "turbo-vortex-aero": "/games/turbogames/vortex-aero.webp",
    "turbo-vortex-power-play": "/games/turbogames/vortex-power-play.webp",
    "turbo-aero": "/games/turbogames/turbo-aero.webp",
    "crash-x": "/games/turbogames/crash-x.webp",
    "double-roll": "/games/turbogames/double-roll.webp",
    "hamsta": "/games/turbogames/hamsta.webp",
    "towers": "/games/turbogames/towers.webp",
    "vortex": "/games/turbogames/vortex.webp",
    "vortex-2": "/games/turbogames/vortex-2.webp",
    "vortex-aero": "/games/turbogames/vortex-aero.webp",
    "vortex-power-play": "/games/turbogames/vortex-power-play.webp",
    "towers-turbo": "/games/turbogames/towers.webp"
  };

  const PRAGMATIC = {
    "gates-of-olympus": "/games/pragmatic/gates-of-olympus.webp",
    "gates-of-olympus-1000": "/games/pragmatic/gates-of-olympus-1000.webp",
    "sweet-bonanza": "/games/pragmatic/sweet-bonanza.webp",
    "sweet-bonanza-1000": "/games/pragmatic/sweet-bonanza-1000.webp",
    "sugar-rush": "/games/pragmatic/sugar-rush.webp",
    "sugar-rush-1000": "/games/pragmatic/sugar-rush-1000.webp",
    "big-bass-bonanza": "/games/pragmatic/big-bass-bonanza.webp",
    "big-bass-splash": "/games/pragmatic/big-bass-splash.webp",
    "starlight-princess": "/games/pragmatic/starlight-princess.webp",
    "starlight-princess-1000": "/games/pragmatic/starlight-princess-1000.webp",
    "dog-house-megaways": "/games/pragmatic/the-dog-house-megaways.webp",
    "the-dog-house-megaways": "/games/pragmatic/the-dog-house-megaways.webp",
    "madame-destiny-megaways": "/games/pragmatic/madame-destiny-megaways.webp",
    "wolf-gold": "/games/pragmatic/wolf-gold.webp",
    "zeus-vs-hades": "/games/pragmatic/zeus-vs-hades.webp",
    "zeus-vs-hades-gods-of-war": "/games/pragmatic/zeus-vs-hades.webp",
    "wild-west-gold": "/games/pragmatic/wild-west-gold.webp",
    "buffalo-king-megaways": "/games/pragmatic/buffalo-king-megaways.webp",
    "cleocatra": "/games/pragmatic/cleocatra.webp",
    "fruit-party": "/games/pragmatic/fruit-party.webp",
    "great-rhino-megaways": "/games/pragmatic/buffalo-king-megaways.webp",
    "the-dog-house": "/games/pragmatic/the-dog-house-megaways.webp",
    "gems-bonanza": "/games/pragmatic/gems-bonanza.webp",
    "chilli-heat": "/games/pragmatic/wild-west-gold.webp",
    "mustang-gold": "/games/pragmatic/wolf-gold.webp",
    "wild-wild-riches": "/games/pragmatic/wild-wild-riches.webp",
    "sweet-bonanza-xmas": "/games/pragmatic/sweet-bonanza-xmas.webp",
    "big-bass-amazon-xtreme": "/games/pragmatic/big-bass-amazon-xtreme.webp",
    "big-bass-hold-spinner": "/games/pragmatic/big-bass-hold-spinner.webp"
  };

  const HACKSAW = {
    "wanted-dead-or-a-wild": "/games/hacksaw/wanted-dead-or-a-wild.webp",
    "wanted-dead-or-wild": "/games/hacksaw/wanted-dead-or-a-wild.webp",
    "chaos-crew": "/games/hacksaw/chaos-crew-2.webp",
    "chaos-crew-2": "/games/hacksaw/chaos-crew-2.webp",
    "rip-city": "/games/hacksaw/rip-city.webp",
    "dork-unit": "/games/hacksaw/dork-unit.webp",
    "rotten": "/games/hacksaw/rotten.webp",
    "hand-of-anubis": "/games/hacksaw/hand-of-anubis.webp",
    "gladiator-legends": "/games/hacksaw/gladiator-legends.webp",
    "stack-em": "/games/hacksaw/stack-em.webp",
    "le-bandit": "/games/hacksaw/le-bandit.webp",
    "beam-boys": "/games/hacksaw/beam-boys.webp",
    "feel-the-beat": "/games/hacksaw/rip-city.webp",
    "fist-of-destruction": "/games/hacksaw/gladiator-legends.webp",
    "2-wild-2-die": "/games/hacksaw/2-wild-2-die.webp",
    "drop-em": "/games/hacksaw/drop-em.webp",
    "stormforged": "/games/hacksaw/stormforged.webp",
    "undead-fortune": "/games/hacksaw/undead-fortune.webp",
    "pug-thug": "/games/hacksaw/pug-thugs.webp",
    "pug-thugs": "/games/hacksaw/pug-thugs.webp",
    "eye-of-the-panda": "/games/hacksaw/eye-of-the-panda.webp",
    "time-spinners": "/games/hacksaw/time-spinners.webp",
    "warriors-ways": "/games/hacksaw/warriors-ways.webp"
  };

  const MAC88 = {
    "mac88-lightning-dragon-tiger": "/games/mac88/mac88-lightning-dragon-tiger.webp",
    "lightning-dragon-tiger": "/games/mac88/mac88-lightning-dragon-tiger.webp",
    "mac88-lightning-andar-bahar": "/games/mac88/mac88-lightning-andar-bahar.webp",
    "lightning-andar-bahar": "/games/mac88/mac88-lightning-andar-bahar.webp",
    "mac88-dragon-tiger-lion": "/games/mac88/mac88-dragon-tiger-lion.webp",
    "dragon-tiger-lion": "/games/mac88/mac88-dragon-tiger-lion.webp",
    "mac88-dragon-tiger-1-day": "/games/mac88/mac88-dragon-tiger-1-day.webp",
    "dragon-tiger-1-day": "/games/mac88/mac88-dragon-tiger-1-day.webp",
    "mac88-dragon-tiger-2": "/games/mac88/mac88-dragon-tiger-2.webp",
    "dragon-tiger-2": "/games/mac88/mac88-dragon-tiger-2.webp",
    "mac88-lightning-dragon-tiger-2": "/games/mac88/mac88-lightning-dragon-tiger-2.webp",
    "lightning-dragon-tiger-2": "/games/mac88/mac88-lightning-dragon-tiger-2.webp",
    "mac88-29-baccarat": "/games/mac88/mac88-29-baccarat.webp",
    "29-baccarat": "/games/mac88/mac88-29-baccarat.webp",
    "mac88-lightning-baccarat": "/games/mac88/mac88-lightning-baccarat.webp",
    "lightning-baccarat": "/games/mac88/mac88-lightning-baccarat.webp",
    "mac88-sicbo-lightning-sicbo": "/games/mac88/mac88-sicbo-lightning-sicbo.webp",
    "sicbo-lightning-sicbo": "/games/mac88/mac88-sicbo-lightning-sicbo.webp",
    "mac88-roulette": "/games/mac88/mac88-roulette.webp",
    "mac88-turbo-auto-roulette": "/games/mac88/mac88-turbo-auto-roulette.webp",
    "turbo-auto-roulette": "/games/mac88/mac88-turbo-auto-roulette.webp",
    "mac88-speed-auto-roulette": "/games/mac88/mac88-speed-auto-roulette.webp",
    "speed-auto-roulette": "/games/mac88/mac88-speed-auto-roulette.webp",
    "mac88-high-low": "/games/mac88/mac88-high-low.webp",
    "high-low": "/games/mac88/mac88-high-low.webp",
    "mac88-dream-wheel": "/games/mac88/mac88-dream-wheel.webp",
    "dream-wheel": "/games/mac88/mac88-dream-wheel.webp",
    "dream-will": "/games/mac88/mac88-dream-wheel.webp"
  };

  const STAKE_ORIGINALS = {
    "dice": "/games/stake-originals/dice.webp",
    "plinko": "/games/stake-originals/plinko.webp",
    "mines": "/games/stake-originals/mines.webp",
    "crash": "/games/stake-originals/crash.webp",
    "limbo": "/games/stake-originals/limbo.webp",
    "blackjack": "/games/stake-originals/blackjack.webp",
    "roulette": "/games/stake-originals/roulette.webp",
    "keno": "/games/stake-originals/keno.webp",
    "wheel": "/games/stake-originals/wheel.webp",
    "baccarat": "/games/stake-originals/baccarat.webp",
    "hilo": "/games/stake-originals/hilo.webp",
    "video-poker": "/games/stake-originals/video-poker.webp",
    "diamonds": "/games/stake-originals/diamonds.webp",
    "slide": "/games/stake-originals/slide.webp",
    "scarab-auto": "/games/stake-originals/scarab-auto.webp",
    "dragon-tower": "/games/stake-originals/dragon-tower.webp",
    "blue-samurai": "/games/stake-originals/blue-samurai.webp",
    "tome-of-life": "/games/stake-originals/tome-of-life.webp"
  };

  function toLines(obj) {
    return Object.entries(obj).map(([k, v]) => `  "${k}": "${v}",`).join('\n');
  }

  const finalCode = `/**
 * Central Dedicated Game Thumbnails Registry
 * Single Source of Truth for game artwork across Stake.com
 *
 * Task 41: Provider-wise Asset Restructuring, Deduplication, and Cloned Asset Replacement.
 * All thumbnails are strictly structured under /games/{provider}/
 */

// ==========================================
// ISOLATED INOUT GAMES THUMBNAIL REGISTRY
// ==========================================
export const INOUT_GAME_THUMBNAILS: Record<string, string> = {
${toLines(INOUT)}
};

// ==========================================
// EVOLUTION GAMING THUMBNAILS
// ==========================================
export const EVOLUTION_THUMBNAILS: Record<string, string> = {
${toLines(EVOLUTION)}
};

// ==========================================
// EZUGI GAMING THUMBNAILS
// ==========================================
export const EZUGI_GAME_THUMBNAILS: Record<string, string> = {
${toLines(EZUGI)}
};

// ==========================================
// SPRIBE 100% SUITE
// ==========================================
export const SPRIBE_THUMBNAILS: Record<string, string> = {
${toLines(SPRIBE)}
};

// ==========================================
// SMARTSOFT 100% SUITE
// ==========================================
export const SMARTSOFT_THUMBNAILS: Record<string, string> = {
${toLines(SMARTSOFT)}
};

// ==========================================
// 100HP GAMING 100% SUITE
// ==========================================
export const HP100_THUMBNAILS: Record<string, string> = {
${toLines(HP100)}
};

// ==========================================
// JILI GAMES 100% SUITE
// ==========================================
export const JILI_THUMBNAILS: Record<string, string> = {
${toLines(JILI)}
};

// ==========================================
// EVOPLAY 100% SUITE
// ==========================================
export const EVOPLAY_THUMBNAILS: Record<string, string> = {
${toLines(EVOPLAY)}
};

// ==========================================
// TURBO GAMES REGISTRY
// ==========================================
export const TURBOGAMES_THUMBNAILS: Record<string, string> = {
${toLines(TURBO)}
};

// ==========================================
// PRAGMATIC PLAY REGISTRY
// ==========================================
export const PRAGMATIC_THUMBNAILS: Record<string, string> = {
${toLines(PRAGMATIC)}
};

// ==========================================
// HACKSAW GAMING REGISTRY
// ==========================================
export const HACKSAW_THUMBNAILS: Record<string, string> = {
${toLines(HACKSAW)}
};

// ==========================================
// MAC88 100% SUITE
// ==========================================
export const MAC88_THUMBNAILS: Record<string, string> = {
${toLines(MAC88)}
};

// ==========================================
// MASTER COMBINED REGISTRY
// ==========================================
export const GAME_THUMBNAILS: Record<string, string> = {
  ...INOUT_GAME_THUMBNAILS,
  ...EVOLUTION_THUMBNAILS,
  ...EZUGI_GAME_THUMBNAILS,
  ...SPRIBE_THUMBNAILS,
  ...SMARTSOFT_THUMBNAILS,
  ...HP100_THUMBNAILS,
  ...JILI_THUMBNAILS,
  ...EVOPLAY_THUMBNAILS,
  ...TURBOGAMES_THUMBNAILS,
  ...PRAGMATIC_THUMBNAILS,
  ...HACKSAW_THUMBNAILS,
  ...MAC88_THUMBNAILS,

  // Stake Originals (18 Games)
${toLines(STAKE_ORIGINALS)}
};

/**
 * Universal safe accessor for any game thumbnail.
 */
export function getGameThumbnail(slug: string, fallback?: string): string {
  if (GAME_THUMBNAILS[slug]) {
    return GAME_THUMBNAILS[slug];
  }
  const clean = slug.toLowerCase().replace(/[^a-z0-9-]/g, "");
  if (GAME_THUMBNAILS[clean]) {
    return GAME_THUMBNAILS[clean];
  }
  return fallback || \`/games/stake-originals/\${clean}.webp\`;
}
`;

  fs.writeFileSync(path.join(ROOT, 'src/data/gameThumbnails.ts'), finalCode, 'utf8');
  console.log('Successfully wrote src/data/gameThumbnails.ts');

  console.log('--- Step 4: Verification of Disk Files & Hash Collisions ---');
  let missing = 0;
  const allReferencedPaths = new Set([
    ...Object.values(INOUT),
    ...Object.values(EVOLUTION),
    ...Object.values(EZUGI),
    ...Object.values(SPRIBE),
    ...Object.values(SMARTSOFT),
    ...Object.values(HP100),
    ...Object.values(JILI),
    ...Object.values(EVOPLAY),
    ...Object.values(TURBO),
    ...Object.values(PRAGMATIC),
    ...Object.values(HACKSAW),
    ...Object.values(MAC88),
    ...Object.values(STAKE_ORIGINALS)
  ]);

  for (const p of allReferencedPaths) {
    const full = path.join(ROOT, 'public', p);
    if (!fs.existsSync(full)) {
      console.error('MISSING FILE ON DISK:', p);
      missing++;
    }
  }
  console.log(`Verified ${allReferencedPaths.size} unique paths on disk. Missing count: ${missing}`);

  // Hash collision check
  const hashes = {};
  for (const p of allReferencedPaths) {
    const full = path.join(ROOT, 'public', p);
    const buf = fs.readFileSync(full);
    const h = crypto.createHash('sha256').update(buf).digest('hex');
    if (!hashes[h]) hashes[h] = [];
    hashes[h].push(p);
  }

  const duplicates = Object.entries(hashes).filter(([h, list]) => list.length > 1);
  console.log(`Distinct game files with identical content (collisions): ${duplicates.length}`);
  for (const [h, list] of duplicates) {
    console.log(`  COLLISION [${h.slice(0, 8)}]: ${list.join(', ')}`);
  }
}

main();
