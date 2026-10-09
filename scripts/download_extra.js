const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT_DIR, 'public', 'games');

// Specific mappings for the 12 items to genuine lotus365 CDN URLs
const extra12 = [
  { slug: "spribe-starline", url: "https://d1zntghqrw5743.cloudfront.net/clicksmal/plt_stars_ablaze.webp" },
  { slug: "rollx", url: "https://d1zntghqrw5743.cloudfront.net/clicksmal/more_slots_double_roll.webp" },
  { slug: "propel-x", url: "https://d1zntghqrw5743.cloudfront.net/clicksmal/MAC88-CJX101.webp" },
  { slug: "cappadocia", url: "https://d1zntghqrw5743.cloudfront.net/clicksmal/sms_balloon.webp" },
  { slug: "airjet", url: "https://d1zntghqrw5743.cloudfront.net/clicksmal/more_slots_air_jet.webp" },
  { slug: "chicken-tour", url: "https://d1zntghqrw5743.cloudfront.net/clicksmal/more_slots_chicken_road.webp" },
  { slug: "starx", url: "https://d1zntghqrw5743.cloudfront.net/clicksmal/jili_all_star_fishing.webp" },
  { slug: "chicken-vs-train", url: "https://d1zntghqrw5743.cloudfront.net/clicksmal/more_slots_chicken_road_two.webp" },
  { slug: "tappy-bird", url: "https://d1zntghqrw5743.cloudfront.net/clicksmal/jdb_birdsparty.webp" },
  { slug: "hp100-retro-turbo-reels", url: "https://d1zntghqrw5743.cloudfront.net/clicksmal/RT-SLOT-011.webp" },
  { slug: "hp100-cyber-rush", url: "https://d1zntghqrw5743.cloudfront.net/clicksmal/RT-SLOT-256.webp" },
  { slug: "gorush", url: "https://d1zntghqrw5743.cloudfront.net/clicksmal/more_slots_train_rush.webp" },
];

async function downloadExtra() {
  for (const item of extra12) {
    const dest = path.join(OUTPUT_DIR, `${item.slug}.webp`);
    try {
      const res = await fetch(item.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        fs.writeFileSync(dest, buf);
        console.log(`Downloaded ${item.slug}.webp (${(buf.length / 1024).toFixed(1)} KB)`);
      } else {
        console.error(`Failed ${res.status} for ${item.slug}`);
      }
    } catch (e) {
      console.error(`Error ${item.slug}:`, e.message);
    }
  }
}

downloadExtra();
