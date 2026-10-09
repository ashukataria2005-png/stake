const https = require('https');

const urls = [
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/more_slots_double_roll.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/tbg_doubleroll.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/sms_plinkox.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/rich88_plinko.webp',
  'https://assets.hurry2.net/casino_games/15257-1783006119.viptp.png',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/turbogames_plinko.webp',
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
