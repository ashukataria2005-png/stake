const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const GAMES_DIR = path.join(ROOT, 'public', 'games');
const SCRATCH_DOWNLOADS = path.join(ROOT, 'scratch_downloads');

const PROVIDERS = [
  'evolution',
  'ezugi',
  'spribe',
  'smartsoft',
  '100hp',
  'jili',
  'evoplay',
  'mac88',
  'inout',
  'stake-originals',
  'turbogames',
  'pragmatic',
  'hacksaw'
];

for (const p of PROVIDERS) {
  fs.mkdirSync(path.join(GAMES_DIR, p), { recursive: true });
}

function downloadFile(url, dest) {
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

async function run() {
  console.log('=== Step 1: Downloading Extra Distinct Assets ===');
  const directDownloads = [
    // Extra distinct cards for games that shared hashes
    { prov: '100hp', name: 'arcade-blackjack.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/plt_vegas_blackjack.webp' },
    { prov: 'smartsoft', name: 'smartsoft-blackjack.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/plt_blackjack_surrender.webp' },
    { prov: 'jili', name: 'jili-blackjack.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/plt_cashback_blackjack.webp' },
    { prov: 'smartsoft', name: 'smartsoft-sic-bo.webp', url: 'https://assets.hurry2.net/casino_games/8966-1-1763126817.webp' },
    { prov: 'spribe', name: 'spribe-sic-bo.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/rich88_sicbotha.webp' },
    { prov: 'jili', name: 'jili-baccarat.webp', url: 'https://assets.hurry2.net/casino_games/47482-1781537360.webp' },
    { prov: 'smartsoft', name: 'smartsoft-baccarat.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/more_slots_baccarat_royale.webp' },
    { prov: 'evolution', name: 'lucky-baccarat.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_baccarat_control_squeeze.webp' },
    { prov: 'evolution', name: 'stake-baccarat.webp', url: 'https://assets.hurry2.net/casino_games/86248-1783006404.Baccarat_Poster.png' },
    { prov: 'evolution', name: 'japanese-roulette.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_japanese_roulette.webp' },
    { prov: 'evolution', name: 'hindi-roulette.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_hindi_roulette.webp' },
    { prov: 'evolution', name: 'super-color-game.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_super_color_game.webp' },
    { prov: 'evolution', name: 'marble-race.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_marble_race.webp' },
    { prov: 'evoplay', name: 'penalty-roulette.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/evp_soccergame.webp' },
    { prov: 'evoplay', name: 'european-christmas-roulette.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/evp_christmasslot.webp' },
  ];

  for (const item of directDownloads) {
    const dest = path.join(GAMES_DIR, item.prov, item.name);
    const r = await downloadFile(item.url, dest);
    console.log(`[${r.status || 'ERR'}] ${item.prov}/${item.name}`);
  }

  // Copy from scratch_downloads
  if (fs.existsSync(SCRATCH_DOWNLOADS)) {
    const scratchItems = fs.readdirSync(SCRATCH_DOWNLOADS, { recursive: true, withFileTypes: true });
    for (const entry of scratchItems) {
      if (entry.isFile()) {
        const rel = path.relative(SCRATCH_DOWNLOADS, path.join(entry.parentPath || entry.path, entry.name));
        const dest = path.join(GAMES_DIR, rel);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(path.join(SCRATCH_DOWNLOADS, rel), dest);
      }
    }
    console.log('Synchronized all scratch downloads into public/games provider directories.');
  }

  console.log('=== Step 2: Reading Current Registries from src/data/gameThumbnails.ts ===');
  const code = fs.readFileSync(path.join(ROOT, 'src/data/gameThumbnails.ts'), 'utf8');

  function parseRegistry(name) {
    const reg = new RegExp(`export const ${name}: Record<string, string> = \\{([\\s\\S]*?)\\};`);
    const m = code.match(reg);
    if (!m) return {};
    const map = {};
    for (const line of m[1].split('\n')) {
      const match = line.match(/"([^"]+)":\s*"([^"]+)"/);
      if (match) {
        map[match[1]] = match[2];
      }
    }
    return map;
  }

  const rawRegistries = {
    inout: parseRegistry('INOUT_GAME_THUMBNAILS'),
    evolution: parseRegistry('EVOLUTION_THUMBNAILS'),
    ezugi: parseRegistry('EZUGI_GAME_THUMBNAILS'),
    spribe: parseRegistry('SPRIBE_THUMBNAILS'),
    smartsoft: parseRegistry('SMARTSOFT_THUMBNAILS'),
    '100hp': parseRegistry('HP100_THUMBNAILS'),
    jili: parseRegistry('JILI_THUMBNAILS'),
    evoplay: parseRegistry('EVOPLAY_THUMBNAILS'),
    turbogames: parseRegistry('TURBOGAMES_THUMBNAILS'),
    pragmatic: parseRegistry('PRAGMATIC_THUMBNAILS'),
    hacksaw: parseRegistry('HACKSAW_THUMBNAILS'),
    mac88: parseRegistry('MAC88_THUMBNAILS'),
  };

  // Stake originals
  const stakeOriginalsSlugs = [
    "dice", "plinko", "mines", "crash", "limbo", "blackjack",
    "roulette", "keno", "wheel", "baccarat", "hilo", "video-poker",
    "diamonds", "slide", "scarab-auto", "dragon-tower", "blue-samurai", "tome-of-life"
  ];

  console.log('=== Step 3: Moving Existing Assets to Provider Subdirectories ===');

  const newRegistries = {
    inout: {},
    evolution: {},
    ezugi: {},
    spribe: {},
    smartsoft: {},
    '100hp': {},
    jili: {},
    evoplay: {},
    turbogames: {},
    pragmatic: {},
    hacksaw: {},
    mac88: {},
    'stake-originals': {}
  };

  // Move provider files
  for (const [provider, entries] of Object.entries(rawRegistries)) {
    for (const [slug, oldPath] of Object.entries(entries)) {
      const oldFilename = path.basename(oldPath);
      const oldFullPath = path.join(ROOT, 'public', oldPath);
      
      // Clean target filename
      let newFilename = oldFilename;
      // Ensure webp format
      const ext = path.extname(newFilename);
      const base = path.basename(newFilename, ext);
      newFilename = `${base}.webp`;

      const targetPath = path.join(GAMES_DIR, provider, newFilename);

      // If target file doesn't exist yet, move/copy from old path
      if (!fs.existsSync(targetPath)) {
        if (fs.existsSync(oldFullPath)) {
          fs.copyFileSync(oldFullPath, targetPath);
        } else {
          // Check if file exists in root of games
          const rootPath = path.join(GAMES_DIR, oldFilename);
          if (fs.existsSync(rootPath)) {
            fs.copyFileSync(rootPath, targetPath);
          }
        }
      }

      newRegistries[provider][slug] = `/games/${provider}/${newFilename}`;
    }
  }

  // Move Stake Originals
  for (const slug of stakeOriginalsSlugs) {
    let sourceFilename = slug === 'scarab-auto' ? 'scarab-spin.webp' : `${slug}.webp`;
    const oldPath = path.join(GAMES_DIR, sourceFilename);
    const targetPath = path.join(GAMES_DIR, 'stake-originals', `${slug}.webp`);
    if (!fs.existsSync(targetPath) && fs.existsSync(oldPath)) {
      fs.copyFileSync(oldPath, targetPath);
    }
    newRegistries['stake-originals'][slug] = `/games/stake-originals/${slug}.webp`;
  }

  console.log('Finished populating provider directories.');

  // Step 4: Clean up old duplicate extensions in public/games/ root and inside subdirectories
  console.log('=== Step 4: Extension Deduplication & Cleanup ===');
  const rootFiles = fs.readdirSync(GAMES_DIR, { withFileTypes: true });
  let deletedCount = 0;
  for (const entry of rootFiles) {
    if (entry.isFile()) {
      // It's a file in public/games/ root. Since all files have been organized into provider subdirectories,
      // delete the loose root file.
      fs.unlinkSync(path.join(GAMES_DIR, entry.name));
      deletedCount++;
    }
  }
  console.log(`Cleaned up ${deletedCount} loose files from root public/games/.`);

  // Inside each provider, ensure only .webp files exist (deduplicating any duplicate .png/.jpg)
  for (const p of PROVIDERS) {
    const provDir = path.join(GAMES_DIR, p);
    const pFiles = fs.readdirSync(provDir);
    const byName = {};
    for (const f of pFiles) {
      const b = path.parse(f).name;
      if (!byName[b]) byName[b] = [];
      byName[b].push(f);
    }
    for (const [b, list] of Object.entries(byName)) {
      if (list.length > 1) {
        // If webp exists, remove non-webp
        const hasWebp = list.find(f => f.endsWith('.webp'));
        if (hasWebp) {
          for (const f of list) {
            if (!f.endsWith('.webp')) {
              fs.unlinkSync(path.join(provDir, f));
              console.log(`Deleted non-webp duplicate: ${p}/${f}`);
            }
          }
        }
      }
    }
  }

  console.log('=== Step 5: Updating src/data/gameThumbnails.ts ===');
  
  function formatRegistry(map) {
    const lines = [];
    for (const [k, v] of Object.entries(map)) {
      lines.push(`  "${k}": "${v}",`);
    }
    return lines.join('\n');
  }

  const newTsContent = `/**
 * Central Dedicated Game Thumbnails Registry
 * Single Source of Truth for game artwork across Stake.com
 *
 * Task 41: Provider-wise Asset Restructuring, Deduplication, and Cloned Asset Replacement.
 * All thumbnails are stored in provider subdirectories inside /games/{provider}/
 */

// ==========================================
// ISOLATED INOUT GAMES THUMBNAIL REGISTRY
// ==========================================
export const INOUT_GAME_THUMBNAILS: Record<string, string> = {
${formatRegistry(newRegistries.inout)}
};

// ==========================================
// EVOLUTION GAMING THUMBNAILS
// ==========================================
export const EVOLUTION_THUMBNAILS: Record<string, string> = {
${formatRegistry(newRegistries.evolution)}
};

// ==========================================
// EZUGI GAMING THUMBNAILS
// ==========================================
export const EZUGI_GAME_THUMBNAILS: Record<string, string> = {
${formatRegistry(newRegistries.ezugi)}
};

// ==========================================
// SPRIBE 100% SUITE
// ==========================================
export const SPRIBE_THUMBNAILS: Record<string, string> = {
${formatRegistry(newRegistries.spribe)}
};

// ==========================================
// SMARTSOFT 100% SUITE
// ==========================================
export const SMARTSOFT_THUMBNAILS: Record<string, string> = {
${formatRegistry(newRegistries.smartsoft)}
};

// ==========================================
// 100HP GAMING 100% SUITE
// ==========================================
export const HP100_THUMBNAILS: Record<string, string> = {
${formatRegistry(newRegistries['100hp'])}
};

// ==========================================
// JILI GAMES 100% SUITE
// ==========================================
export const JILI_THUMBNAILS: Record<string, string> = {
${formatRegistry(newRegistries.jili)}
};

// ==========================================
// EVOPLAY 100% SUITE
// ==========================================
export const EVOPLAY_THUMBNAILS: Record<string, string> = {
${formatRegistry(newRegistries.evoplay)}
};

// ==========================================
// TURBO GAMES REGISTRY
// ==========================================
export const TURBOGAMES_THUMBNAILS: Record<string, string> = {
${formatRegistry(newRegistries.turbogames)}
};

// ==========================================
// PRAGMATIC PLAY REGISTRY
// ==========================================
export const PRAGMATIC_THUMBNAILS: Record<string, string> = {
${formatRegistry(newRegistries.pragmatic)}
};

// ==========================================
// HACKSAW GAMING REGISTRY
// ==========================================
export const HACKSAW_THUMBNAILS: Record<string, string> = {
${formatRegistry(newRegistries.hacksaw)}
};

// ==========================================
// MAC88 100% SUITE
// ==========================================
export const MAC88_THUMBNAILS: Record<string, string> = {
${formatRegistry(newRegistries.mac88)}
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

  // Stake Originals (31 Games)
${formatRegistry(newRegistries['stake-originals'])}
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

  fs.writeFileSync(path.join(ROOT, 'src/data/gameThumbnails.ts'), newTsContent, 'utf8');
  console.log('Updated src/data/gameThumbnails.ts successfully.');

  // Step 6: Hash collision check across all distinct games
  console.log('=== Step 6: SHA-256 Hash Collision Verification ===');
  const allHashes = {};
  let totalImages = 0;
  for (const p of PROVIDERS) {
    const pDir = path.join(GAMES_DIR, p);
    const files = fs.readdirSync(pDir).filter(f => fs.statSync(path.join(pDir, f)).isFile());
    for (const f of files) {
      totalImages++;
      const full = path.join(pDir, f);
      const hash = crypto.createHash('sha256').update(fs.readFileSync(full)).digest('hex');
      if (!allHashes[hash]) allHashes[hash] = [];
      allHashes[hash].push(`${p}/${f}`);
    }
  }

  const duplicates = Object.entries(allHashes).filter(([h, list]) => list.length > 1);
  console.log(`Total provider images on disk: ${totalImages}`);
  console.log(`Duplicate hash groups: ${duplicates.length}`);
  for (const [h, list] of duplicates) {
    console.log(`  Hash ${h.slice(0, 8)} (${list.length} files): ${list.join(', ')}`);
  }
}

run();
