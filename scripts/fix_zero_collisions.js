const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

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

async function fix() {
  await download('https://d1zntghqrw5743.cloudfront.net/clicksmal/more_slots_double_roll.webp', 'public/games/smartsoft/double-x.webp');
  await download('https://d1zntghqrw5743.cloudfront.net/clicksmal/tbg_doubleroll.webp', 'public/games/turbogames/double-roll.webp');
  await download('https://d1zntghqrw5743.cloudfront.net/clicksmal/rich88_monopoly_bingo.webp', 'public/games/smartsoft/plinko-x-classic.webp');

  console.log('Downloaded fixes.');

  // Check hashes of all files in public/games across all provider directories
  const GAMES_DIR = path.join(__dirname, '..', 'public', 'games');
  const provs = fs.readdirSync(GAMES_DIR).filter(f => fs.statSync(path.join(GAMES_DIR, f)).isDirectory());

  const hashes = {};
  let totalFiles = 0;
  for (const p of provs) {
    const pDir = path.join(GAMES_DIR, p);
    const files = fs.readdirSync(pDir).filter(f => fs.statSync(path.join(pDir, f)).isFile());
    for (const f of files) {
      totalFiles++;
      const full = path.join(pDir, f);
      const buf = fs.readFileSync(full);
      const h = crypto.createHash('sha256').update(buf).digest('hex');
      if (!hashes[h]) hashes[h] = [];
      hashes[h].push(`${p}/${f}`);
    }
  }

  const collisions = Object.entries(hashes).filter(([h, list]) => list.length > 1);
  console.log(`Total files scanned across all provider directories: ${totalFiles}`);
  console.log(`ZERO HASH COLLISIONS TARGET -> Actual collisions count: ${collisions.length}`);
  for (const [h, list] of collisions) {
    console.log(`  COLLISION [${h.slice(0, 8)}]: ${list.join(', ')}`);
  }
}

fix();
