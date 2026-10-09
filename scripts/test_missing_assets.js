const https = require('https');

const urls = [
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/tbg_hamsta.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/turbo_hamsta.webp',
  'https://bfstatic.io/preview/turbogames:Hamsta@1x.webp',
  'https://bfstatic.io/preview/turbogames:Hamsta@1x.jpeg',
  'https://media.betmgm.co.uk/images/games/big-bass-splash/big-bass-splash-tile-auth.jpg',
  'https://bfstatic.io/preview/pragmatic:BigBassSplash@1x.jpeg',
  'https://bfstatic.io/preview/pragmatic:BigBassSplash@1x.webp',
  'https://bfstatic.io/preview/evolution:DiscoRoulette@1x.jpeg',
  'https://bfstatic.io/preview/evolution:DiscoRoulette@1x.webp',
];

function check(url) {
  return new Promise(resolve => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      resolve({ url, status: res.statusCode, length: res.headers['content-length'] });
    }).on('error', e => resolve({ url, error: e.message }));
  });
}

async function run() {
  for (const u of urls) {
    const r = await check(u);
    console.log(r.status, r.length, r.url);
  }
}
run();
