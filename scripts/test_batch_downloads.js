const fs = require('fs');
const path = require('path');
const https = require('https');

const downloads = [
  // Evolution
  { file: 'evolution/disco-roulette.webp', url: 'https://bfstatic.io/preview/evolution:DiscoRoulette@1x.webp' },
  { file: 'evolution/spanish-roulette.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_ruleta_en_espaol.webp' },
  { file: 'evolution/speed-auto-roulette.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_ruleta_bola_rapida_en_vivo.webp' },
  { file: 'evolution/lotus-roulette.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_lotusroulette.webp' },
  { file: 'evolution/turkish-roulette.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/pltl_turkish_roulette.webp' },
  { file: 'evolution/infinite-free-bet-roulette.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_free_bet_blackjack.webp' },
  { file: 'evolution/monopoly-roulette.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_monopoly_big_baller.webp' },
  { file: 'evolution/emperor-bac-bo.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_emperor_bac_bo.webp' },
  { file: 'evolution/live-bac-bo.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_bac_bo_ao_vivo.webp' },
  { file: 'evolution/turkish-football-studio.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_footballstudiodice.webp' },
  { file: 'evolution/football-studio.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_football_studio.webp' },
  { file: 'evolution/peek-baccarat.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_peek_baccarat.webp' },
  { file: 'evolution/lotus-baccarat.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/more_slots_baccarat_royale.webp' },
  { file: 'evolution/stake-baccarat.webp', url: 'https://assets.hurry2.net/casino_games/86248-1783006404.Baccarat_Poster.png' },
  { file: 'evolution/xxxtreme-lightning-roulette.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_xxxtremelightningroulette.webp' },
  { file: 'evolution/live-roulette.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/evo_liveroulette.webp' },

  // Ezugi
  { file: 'ezugi/italian-roulette.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/ezg_italianroulette.webp' },
  { file: 'ezugi/ruleta-del-sol.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/ezg_skylineroulette.webp' },
  { file: 'ezugi/baccarat-super-6.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/ezg_baccaratsuper6.webp' },
  { file: 'ezugi/knockout-baccarat.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/ezg_goldenbaccaratknockout.webp' },
  { file: 'ezugi/golden-baccarat.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/ezg_fortune_baccarat.webp' },
  { file: 'ezugi/salsa-baccarat.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/ezg_speed_fortune_baccarat.webp' },
  { file: 'ezugi/sic-bo-live.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/ezg_ultimate_sic_bo.webp' },
  { file: 'ezugi/teen-patti-live.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/ezg_betonteenpatti.webp' },

  // Spribe
  { file: 'spribe/spribe-keno-80.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/sbe_keno.webp' },
  { file: 'spribe/spribe-keno.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/spribe_keno.webp' },

  // Evoplay
  { file: 'evoplay/penalty-shoot-out-street.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/evp_penaltyshoot-outstreet.webp' },
  { file: 'evoplay/penalty-shoot-out-super-spin.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/evp_penaltyshoot-outsupercup.webp' },
  { file: 'evoplay/penalty-shoot-out.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/evp_penaltyshootout.webp' },
  { file: 'evoplay/uncrossable-rush.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/evp_uncrossablerush.webp' },
  { file: 'evoplay/uncrossable-rush-x-mas.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/evp_christmascrash.webp' },

  // Smartsoft
  { file: 'smartsoft/double-x.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/tbg_doubleroll.webp' },
  { file: 'smartsoft/rollx.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/sms_roll_x.webp' },
  { file: 'smartsoft/plinko-x.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/sms_plinkox.webp' },
  { file: 'smartsoft/smartsoft-balloon.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/more_slots_balloon.webp' },

  // 100hp
  { file: '100hp/astronaut.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/more_slots_astronaut.webp' },

  // Jili
  { file: 'jili/jili-teen-patti.webp', url: 'https://assets.hurry2.net/casino_games/77352-1789111407.jpg' },

  // Turbogames
  { file: 'turbogames/hamsta.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/tbg_hamsta.webp' },

  // Hacksaw
  { file: 'hacksaw/2-wild-2-die.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/hsg_2wild2die.webp' },

  // Pragmatic
  { file: 'pragmatic/big-bass-splash.webp', url: 'https://media.betmgm.co.uk/images/games/big-bass-splash/big-bass-splash-tile-auth.jpg' },

  // Mac88
  { file: 'mac88/mac88-dragon-tiger-2.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/MAC88-DT2101.webp' },
  { file: 'mac88/mac88-lightning-dragon-tiger-2.webp', url: 'https://d1zntghqrw5743.cloudfront.net/clicksmal/RG-LDT101-VR.webp' },
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const file = fs.createWriteStream(dest);
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        return resolve({ url, dest, status: res.statusCode });
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve({ url, dest, status: 200 }));
      });
    }).on('error', err => {
      file.close();
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      resolve({ url, dest, error: err.message });
    });
  });
}

async function run() {
  const scratchTarget = path.join(__dirname, '..', 'scratch_downloads');
  fs.mkdirSync(scratchTarget, { recursive: true });
  console.log(`Testing download of ${downloads.length} replacement assets...`);
  for (const d of downloads) {
    const dest = path.join(scratchTarget, d.file);
    const res = await downloadFile(d.url, dest);
    console.log(`[${res.status || 'ERR'}] ${d.file} <- ${d.url}`);
  }
}

run();
