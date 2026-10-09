const https = require('https');

const extras = [
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/plt_vegas_blackjack.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/plt_blackjack_surrender.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/plt_cashback_blackjack.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/rich88_sicbotha.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/rich88_sicbotha2.webp',
  'https://assets.hurry2.net/casino_games/8966-1-1763126817.webp', // Sic Bo
  'https://assets.hurry2.net/casino_games/47482-1781537360.webp', // Baccarat Fusion
  'https://assets.hurry2.net/casino_games/69084-1783506114.1782909221557_29-CBF2.png', // 29 Baccarat Fusion
];

function check(url) {
  return new Promise(resolve => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      resolve({ url, status: res.statusCode, length: res.headers['content-length'] });
    }).on('error', e => resolve({ url, error: e.message }));
  });
}

async function run() {
  for (const u of extras) {
    const r = await check(u);
    console.log(r.status, r.length, r.url);
  }
}
run();
