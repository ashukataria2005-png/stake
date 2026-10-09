const https = require('https');

function headUrl(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      resolve({ url, status: res.statusCode, type: res.headers['content-type'], length: res.headers['content-length'] });
    }).on('error', (err) => resolve({ url, error: err.message }));
  });
}

async function test() {
  const urls = [
    'https://d1zntghqrw5743.cloudfront.net/clicksmal/evp_penaltyshoot-outstreet.webp',
    'https://d1zntghqrw5743.cloudfront.net/clicksmal/evp_penaltyshoot-outsupercup.webp',
    'https://d1zntghqrw5743.cloudfront.net/clicksmal/hsg_2wild2die.webp',
    'https://d1zntghqrw5743.cloudfront.net/clicksmal/tbg_doubleroll.webp',
    'https://d1zntghqrw5743.cloudfront.net/clicksmal/ezg_baccaratsuper6.webp',
    'https://d1zntghqrw5743.cloudfront.net/clicksmal/ezg_goldenbaccaratknockout.webp',
    'https://d1zntghqrw5743.cloudfront.net/clicksmal/pltl_turkish_roulette.webp',
    'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_emperor_bac_bo.webp',
    'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_lotusroulette.webp',
    'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_ruleta_en_espaol.webp',
    'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_ruleta_bola_rapida_en_vivo.webp',
    'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_free_bet_blackjack.webp',
    'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_monopoly_big_baller.webp',
    'https://d1zntghqrw5743.cloudfront.net/clicksmal/MAC88-DT2101.webp',
    'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_lightning_dragon_tiger.webp',
  ];

  for (const u of urls) {
    const res = await headUrl(u);
    console.log(res.status, res.type, u);
  }
}

test();
