const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT_DIR, 'public', 'games');
const ALL_GAMES_FILE = 'C:/Users/ashok/.gemini/antigravity-ide/brain/2f9baf99-78b2-4b53-a211-ad8d25f6b54e/scratch/all_lotus_games.json';

const allGames = JSON.parse(fs.readFileSync(ALL_GAMES_FILE, 'utf8'));

// Helper to find authentic image in lotus catalog
function findLotusImage(query, preferredProvider = null) {
  const q = query.toLowerCase().trim();

  // 1. Exact match in preferred provider
  if (preferredProvider) {
    const m = allGames.find(g => (g.provider || '').toLowerCase().includes(preferredProvider.toLowerCase()) && g.game_name.toLowerCase() === q && g.image);
    if (m) return m.image;
  }
  // 2. Substring match in preferred provider
  if (preferredProvider) {
    const m = allGames.find(g => (g.provider || '').toLowerCase().includes(preferredProvider.toLowerCase()) && (g.game_name.toLowerCase().includes(q) || q.includes(g.game_name.toLowerCase())) && g.image);
    if (m) return m.image;
  }
  // 3. Exact match anywhere
  const exact = allGames.find(g => g.game_name.toLowerCase() === q && g.image);
  if (exact) return exact.image;

  // 4. Tokens match in preferred provider
  if (preferredProvider) {
    const tokens = q.split(/[\s\-_\/]+/).filter(w => w.length > 2);
    const m = allGames.find(g => (g.provider || '').toLowerCase().includes(preferredProvider.toLowerCase()) && tokens.every(tok => g.game_name.toLowerCase().includes(tok)) && g.image);
    if (m) return m.image;
  }

  // 5. Substring match anywhere
  const sub = allGames.find(g => (g.game_name.toLowerCase().includes(q) || q.includes(g.game_name.toLowerCase())) && g.image);
  if (sub) return sub.image;

  // 6. Tokens match anywhere
  const tokens = q.split(/[\s\-_\/]+/).filter(w => w.length > 2);
  const tok = allGames.find(g => tokens.every(tok => g.game_name.toLowerCase().includes(tok)) && g.image);
  if (tok) return tok.image;

  return null;
}

// Download image helper
async function downloadImage(url, destPath) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    if (!res.ok) {
      console.error(`Failed ${res.status} for ${url}`);
      return false;
    }
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (buffer.length < 500) {
      console.error(`File too small (${buffer.length} bytes) for ${url}`);
      return false;
    }
    fs.writeFileSync(destPath, buffer);
    return true;
  } catch (e) {
    console.error(`Error downloading ${url}:`, e.message);
    return false;
  }
}

async function run() {
  console.log('--- STARTING TASK 40 SOURCING PIPELINE ---');

  // Load stakeGames for provider arrays
  const stakeGamesContent = fs.readFileSync(path.join(ROOT_DIR, 'src', 'data', 'stakeGames.ts'), 'utf8');

  function extractArray(rawArrayName) {
    const startIdx = stakeGamesContent.indexOf(`const ${rawArrayName}:`);
    if (startIdx === -1) return [];
    const bracketOpen = stakeGamesContent.indexOf('[', startIdx);
    const bracketClose = stakeGamesContent.indexOf('];', bracketOpen);
    return eval('(' + stakeGamesContent.slice(bracketOpen, bracketClose + 1) + ')');
  }

  const tasks = [];

  // ==========================================
  // 1. MAC88 SUITE (14 games)
  // ==========================================
  const mac88Suite = [
    { slug: "mac88-lightning-dragon-tiger", query: "Dragon Tiger", preferred: "Mac88" },
    { slug: "mac88-lightning-andar-bahar", query: "Andar Bahar", preferred: "Mac88" },
    { slug: "mac88-dragon-tiger-lion", query: "DTL", preferred: "Mac88" },
    { slug: "mac88-dragon-tiger-1-day", query: "1 Day Dragon Tiger", preferred: "Mac88" },
    { slug: "mac88-dragon-tiger-2", query: "Dragon Tiger 2", preferred: "Mac88" },
    { slug: "mac88-lightning-dragon-tiger-2", query: "Dragon Tiger 2", preferred: "Mac88" },
    { slug: "mac88-29-baccarat", query: "29 Baccarat", preferred: "Mac88" },
    { slug: "mac88-lightning-baccarat", query: "Bacarrat", preferred: "Mac88" },
    { slug: "mac88-sicbo-lightning-sicbo", query: "Sic Bo", preferred: "Mac88" },
    { slug: "mac88-roulette", query: "Roulette", preferred: "Mac88" },
    { slug: "mac88-turbo-auto-roulette", query: "Turbo Auto Roulette", preferred: "Mac88" },
    { slug: "mac88-speed-auto-roulette", query: "Speed Auto Roulette", preferred: "Mac88" },
    { slug: "mac88-high-low", query: "High Low", preferred: "Mac88" },
    { slug: "mac88-dream-wheel", query: "Dream Wheel", preferred: "Mac88" },
  ];

  for (const item of mac88Suite) {
    const url = findLotusImage(item.query, item.preferred);
    tasks.push({
      provider: 'Mac88',
      slug: item.slug,
      url: url || 'https://d1zntghqrw5743.cloudfront.net/clicksmal/MAC88-XRT101.webp',
      fileName: `${item.slug}.webp`
    });
  }

  // ==========================================
  // 2. EVOLUTION GAMING TARGETS (45 games)
  // ==========================================
  const evoTargets = [
    { slug: "ice-fishing", query: "Ice Fishing" },
    { slug: "xxxtreme-lightning-roulette", query: "XXXtreme Lightning Roulette" },
    { slug: "spanish-roulette", query: "Spanish Roulette", alt: "Ruleta en Espanol" },
    { slug: "disco-roulette", query: "Disco Roulette" },
    { slug: "crazy-balls", query: "Crazy Balls" },
    { slug: "live-roulette", query: "Live Roulette", alt: "Roleta ao Vivo" },
    { slug: "lucky-baccarat", query: "Lucky Baccarat" },
    { slug: "infinite-free-bet-roulette", query: "Infinite Free Bet Roulette" },
    { slug: "red-baron", query: "Baron Lord Of Saturday" },
    { slug: "monopoly-roulette", query: "Monopoly Roulette" },
    { slug: "japanese-baccarat", query: "Japanese Baccarat" },
    { slug: "power-blackjack", query: "Power Blackjack" },
    { slug: "korean-baccarat", query: "Korean Baccarat" },
    { slug: "emperor-baccarat", query: "Emperor Baccarat" },
    { slug: "race-track", query: "Race Track" },
    { slug: "hindi-baccarat", query: "Hindi Baccarat" },
    { slug: "japanese-roulette", query: "Japanese Roulette" },
    { slug: "teen-patti", query: "Teen Patti" },
    { slug: "lotus-baccarat", query: "Baccarat" },
    { slug: "easy-blackjack", query: "Easy Blackjack" },
    { slug: "live-bac-bo", query: "Bac Bo", alt: "Bac Bo ao Vivo" },
    { slug: "football-studio", query: "Football Studio", alt: "Futbol Studio" },
    { slug: "turkish-roulette", query: "Turkish Roulette", alt: "Turkce Rulet" },
    { slug: "roulette-first-person", query: "First Person Roulette" },
    { slug: "dragon-dragon", query: "Dragon Tiger" },
    { slug: "emperor-roulette", query: "Emperor Roulette" },
    { slug: "infinite-fun-fun", query: "Funky Time" },
    { slug: "fireball-roulette", query: "Fireball Roulette" },
    { slug: "hindi-roulette", query: "Hindi Roulette" },
    { slug: "super-color-game", query: "Super Color Game" },
    { slug: "infinite-bet-stacker", query: "Infinite Blackjack" },
    { slug: "marble-race", query: "Marble Race" },
    { slug: "war-live", query: "Casino War" },
    { slug: "speed-auto-roulette", query: "Ruleta Bola Rapida en Vivo" },
    { slug: "lightning-sic-bo", query: "Lightning Sic Bo" },
    { slug: "mega-ball", query: "Mega Ball", alt: "Mega Bola" },
    { slug: "lightning-roulette", query: "Lightning Roulette" },
    { slug: "lotus-roulette", query: "Roulette" },
    { slug: "emperor-dragon-tiger", query: "Emperor Dragon Tiger" },
    { slug: "stake-baccarat", query: "Baccarat" },
    { slug: "peek-baccarat", query: "Peek Baccarat" },
    { slug: "turkish-football-studio", query: "Football Studio", alt: "Turkce Futbol" },
    { slug: "emperor-sic-bo", query: "Emperor Sic Bo" },
    { slug: "korean-powerball", query: "KM Powerball" },
    { slug: "emperor-bac-bo", query: "Bac Bo" }
  ];

  for (const item of evoTargets) {
    let url = findLotusImage(item.query, 'Evolution');
    if (!url && item.alt) url = findLotusImage(item.alt, 'Evolution');
    if (!url) url = findLotusImage(item.query);
    tasks.push({
      provider: 'Evolution',
      slug: item.slug,
      url: url,
      fileName: `${item.slug}.webp`
    });
  }

  // ==========================================
  // 3. EZUGI GAMING TARGETS (15 games)
  // ==========================================
  const ezugiTargets = [
    { slug: "ezugi-teen-patti-live", query: "Teen Patti", alt: "Teen Patti Live" },
    { slug: "ezugi-roulette-360", query: "Oracle Casino Roulette 360", alt: "Roulette 360" },
    { slug: "ezugi-royal-poker", query: "Poker", alt: "Royal Poker" },
    { slug: "ezugi-one-day-teen-patti", query: "One Day Teen Patti Classic" },
    { slug: "ezugi-sic-bo-live", query: "Sic Bo", alt: "Sic Bo Live" },
    { slug: "ezugi-marina-casino-baccarat", query: "Marina Casino Baccarat 1" },
    { slug: "ezugi-auto-roulette", query: "Speed Auto Roulette" },
    { slug: "ezugi-italian-roulette", query: "Italian Roulette" },
    { slug: "ezugi-baccarat-super-6", query: "Baccarat" },
    { slug: "ezugi-knockout-baccarat", query: "Baccarat" },
    { slug: "ezugi-prestige-auto-roulette", query: "Prestige Auto Roulette" },
    { slug: "ezugi-ruleta-del-sol", query: "Roulette" },
    { slug: "ezugi-golden-baccarat", query: "Baccarat" },
    { slug: "ezugi-salsa-baccarat", query: "Baccarat" },
    { slug: "ezugi-blackjack-salon", query: "Salon Prive Blackjack" },
    // Also aliases without ezugi- prefix
    { slug: "teen-patti-live", query: "Teen Patti" },
    { slug: "roulette-360", query: "Oracle Casino Roulette 360" },
    { slug: "royal-poker", query: "Poker" },
    { slug: "one-day-teen-patti", query: "One Day Teen Patti Classic" },
    { slug: "sic-bo-live", query: "Sic Bo" },
    { slug: "marina-casino-baccarat", query: "Marina Casino Baccarat 1" },
    { slug: "auto-roulette", query: "Speed Auto Roulette" },
    { slug: "italian-roulette", query: "Italian Roulette" },
    { slug: "baccarat-super-6", query: "Baccarat" },
    { slug: "knockout-baccarat", query: "Baccarat" },
    { slug: "prestige-auto-roulette", query: "Prestige Auto Roulette" },
    { slug: "ruleta-del-sol", query: "Roulette" },
    { slug: "golden-baccarat", query: "Baccarat" },
    { slug: "salsa-baccarat", query: "Baccarat" },
    { slug: "blackjack-salon", query: "Salon Prive Blackjack" }
  ];

  for (const item of ezugiTargets) {
    let url = findLotusImage(item.query, 'Ezugi');
    if (!url && item.alt) url = findLotusImage(item.alt, 'Ezugi');
    if (!url) url = findLotusImage(item.query);
    tasks.push({
      provider: 'Ezugi',
      slug: item.slug,
      url: url,
      fileName: `${item.slug}.webp`
    });
  }

  // ==========================================
  // 4. FULL PROVIDER SUITES: Spribe, SmartSoft, 100hp, Jili, Evoplay
  // ==========================================
  const providerSuites = [
    { name: 'Spribe', games: extractArray('RAW_SPRIBE_GAMES'), preferred: 'Spribe' },
    { name: 'SmartSoft', games: extractArray('RAW_SMARTSOFT_GAMES'), preferred: 'Smartsoft' },
    { name: '100hp', games: extractArray('RAW_HP100_GAMES'), preferred: 'Slots' },
    { name: 'Jili', games: extractArray('RAW_JILI_GAMES'), preferred: 'JiLi Gaming' },
    { name: 'Evoplay', games: extractArray('RAW_EVOPLAY_GAMES'), preferred: 'Evoplay' },
  ];

  for (const suite of providerSuites) {
    for (const g of suite.games) {
      let url = findLotusImage(g.title, suite.preferred);
      if (!url) url = findLotusImage(g.slug, suite.preferred);
      if (!url) url = findLotusImage(g.title);
      if (!url) url = findLotusImage(g.slug);

      tasks.push({
        provider: suite.name,
        slug: g.slug,
        title: g.title,
        url: url,
        fileName: `${g.slug}.webp`
      });
    }
  }

  console.log(`Total games queued for download: ${tasks.length}`);

  // Download all files
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i];
    if (!t.url) {
      console.warn(`[${i + 1}/${tasks.length}] No URL found for ${t.provider}: ${t.slug}`);
      failCount++;
      continue;
    }

    const dest = path.join(OUTPUT_DIR, t.fileName);
    process.stdout.write(`[${i + 1}/${tasks.length}] Downloading ${t.slug} ... `);
    const ok = await downloadImage(t.url, dest);
    if (ok) {
      process.stdout.write(`OK (${(fs.statSync(dest).size / 1024).toFixed(1)} KB)\n`);
      successCount++;
    } else {
      process.stdout.write(`FAILED\n`);
      failCount++;
    }
  }

  console.log(`\nDownload completed: ${successCount} succeeded, ${failCount} failed.`);
  fs.writeFileSync('C:/Users/ashok/.gemini/antigravity-ide/brain/2f9baf99-78b2-4b53-a211-ad8d25f6b54e/scratch/download_tasks.json', JSON.stringify(tasks, null, 2));
}

run();
