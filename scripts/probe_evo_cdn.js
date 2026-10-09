const https = require('https');

const tests = [
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_disco_roulette.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_discoroulette.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_disco_lights.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_monopoly_roulette.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_monopolyroulette.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_free_bet_roulette.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_turkish_roulette.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_turkce_rulet.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_turkce_futbol_studyosu.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_turkce_futbol.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_stake_baccarat.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_peek_baccarat.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_lucky_baccarat.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_korean_baccarat.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_japanese_baccarat.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_hindi_baccarat.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_emperor_baccarat.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_japanese_roulette.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_hindi_roulette.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_teen_patti.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_super_color_game.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_marble_race.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_war_live.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_korean_powerball.webp',
];

function check(url) {
  return new Promise(resolve => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      resolve({ url, status: res.statusCode, length: res.headers['content-length'] });
    }).on('error', e => resolve({ url, error: e.message }));
  });
}

async function run() {
  for (const t of tests) {
    const r = await check(t);
    if (r.status === 200) {
      console.log(`FOUND 200: ${r.url} (${r.length} bytes)`);
    } else {
      console.log(`MISS  ${r.status}: ${r.url}`);
    }
  }
}
run();
