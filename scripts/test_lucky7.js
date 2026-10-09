const https = require('https');

const urls = [
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/MAC88-L7101.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/MAC88-XL7101.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/rich88_lucky7.webp',
  'https://d1zntghqrw5743.cloudfront.net/clicksmal/kingmidas_lucky_7.webp',
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
