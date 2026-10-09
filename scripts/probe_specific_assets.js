const https = require('https');

const tests = [
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_videopoker.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_video_poker.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_live_video_poker.webp',
  'https://bfstatic.io/preview/evolution:VideoPoker@1x.webp',
  'https://bfstatic.io/preview/smartsoft:Cappadocia@1x.webp',
  'https://bfstatic.io/preview/smartsoft:Balloon@1x.webp',
  'https://bfstatic.io/preview/smartsoft:PlinkoX@1x.webp',
  'https://bfstatic.io/preview/spribe:Blackjack@1x.webp',
  'https://bfstatic.io/preview/spribe:Baccarat@1x.webp',
  'https://bfstatic.io/preview/spribe:SicBo@1x.webp',
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
    console.log(r.status, r.length, r.url);
  }
}
run();
