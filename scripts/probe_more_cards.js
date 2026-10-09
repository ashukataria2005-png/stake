const https = require('https');

const urls = [
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/sms_balloon.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/more_slots_balloon.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/sms_cappadocia.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/smartsoft_cappadocia.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/smartsoft_balloon.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/more_slots_plinko.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/smartsoft_plinko.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/smartsoft_plinkox.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/spribe_keno.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/sbe_keno.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/spribe_keno_80.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/spribe_baccarat.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/sbe_baccarat.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/spribe_blackjack.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/sbe_blackjack.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/spribe_sic_bo.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/sbe_sic_bo.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/rich88_baccarat.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/rich88_blackjack.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/rich88_sic_bo.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/rich88_sicbotha.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/rich88_sicbotha2.webp',
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
