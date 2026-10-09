const https = require('https');

const candidates = [
  // Evolution
  { key: 'evo_ruleta_espanol', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_ruleta_en_espaol.webp' },
  { key: 'evo_speed_auto_roulette', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_ruleta_bola_rapida_en_vivo.webp' },
  { key: 'evo_lotus_roulette', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_lotusroulette.webp' },
  { key: 'evo_turkish_roulette', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/pltl_turkish_roulette.webp' },
  { key: 'evo_emperor_bac_bo', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_emperor_bac_bo.webp' },
  { key: 'evo_live_bac_bo', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_bac_bo_ao_vivo.webp' },
  { key: 'evo_turkish_football', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_footballstudiodice.webp' },
  { key: 'evo_football_studio', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_football_studio.webp' },
  { key: 'evo_free_bet', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_free_bet_blackjack.webp' },
  { key: 'evo_monopoly_big_baller', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_monopoly_big_baller.webp' },
  { key: 'evo_speed_baccarat_a', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_speedbaccarat_a.webp' },
  { key: 'evo_baccarat_control_squeeze', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_baccarat_control_squeeze.webp' },
  { key: 'evo_baccarat_lobby', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_baccarat_lobby.webp' },
  { key: 'evo_lightning_dragon_tiger', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_lightning_dragon_tiger.webp' },

  // Ezugi
  { key: 'ezg_italian_roulette', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/ezg_italianroulette.webp' },
  { key: 'ezg_skylineroulette', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/ezg_skylineroulette.webp' },
  { key: 'ezg_baccarat_super_6', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/ezg_baccaratsuper6.webp' },
  { key: 'ezg_knockout_baccarat', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/ezg_goldenbaccaratknockout.webp' },
  { key: 'ezg_fortune_baccarat', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/ezg_fortune_baccarat.webp' },
  { key: 'ezg_speed_fortune_baccarat', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/ezg_speed_fortune_baccarat.webp' },
  { key: 'ezg_ultimate_sic_bo', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/ezg_ultimate_sic_bo.webp' },
  { key: 'ezg_bet_on_teen_patti', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/ezg_betonteenpatti.webp' },

  // Evoplay
  { key: 'evp_penaltyshoot_street', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/evp_penaltyshoot-outstreet.webp' },
  { key: 'evp_penaltyshoot_supercup', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/evp_penaltyshoot-outsupercup.webp' },
  { key: 'evp_penaltyshootout', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/evp_penaltyshootout.webp' },
  { key: 'evp_uncrossablerush', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/evp_uncrossablerush.webp' },
  { key: 'evp_christmascrash', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/evp_christmascrash.webp' },

  // Mac88
  { key: 'mac88_dt2', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/MAC88-DT2101.webp' },
  { key: 'mac88_rg_ldt', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/RG-LDT101-VR.webp' },
  { key: 'mac88_sicbo', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/MAC88-XSB101.webp' },

  // Hacksaw & Turbogames
  { key: 'hsg_2wild2die', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/hsg_2wild2die.webp' },
  { key: 'tbg_doubleroll', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/tbg_doubleroll.webp' },
  { key: 'more_slots_doubleroll', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/more_slots_double_roll.webp' },
  { key: 'more_slots_baccarat_royale', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/more_slots_baccarat_royale.webp' },
  { key: 'more_slots_teen_patti_999', url: 'https://assets.hurry2.net/casino_games/77352-1789111407.jpg' },
  { key: 'sms_roll_x', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/sms_roll_x.webp' },
  { key: 'sms_plinkox', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/sms_plinkox.webp' },
  { key: 'more_slots_astronaut', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/more_slots_astronaut.webp' },
  { key: 'more_slots_balloon', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/more_slots_balloon.webp' },
];

function checkUrl(item) {
  return new Promise((resolve) => {
    https.get(item.url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      resolve({ key: item.key, status: res.statusCode, length: res.headers['content-length'] });
    }).on('error', (err) => resolve({ key: item.key, error: err.message }));
  });
}

async function run() {
  for (const c of candidates) {
    const res = await checkUrl(c);
    console.log(`${res.status === 200 ? 'OK  ' : 'FAIL'} [${res.status}] ${res.key} (${res.length} bytes)`);
  }
}

run();
