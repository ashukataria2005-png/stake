const fs = require('fs');
const path = require('path');
const https = require('https');

function download(url, dest) {
  return new Promise((resolve) => {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const file = fs.createWriteStream(dest);
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      if (res.statusCode !== 200) {
        file.close();
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
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
  const tpRes = await download('https://assets.hurry2.net/casino_games/77352-1789111407.jpg', 'public/games/jili/teen-patti.webp');
  console.log('Teen patti download:', tpRes.status);

  const bjRes = await download('https://d1zntghqrw5743.cloudfront.net/clicksmal/creedroomz_freebet_blackjack_turkish_a.webp', 'public/games/jili/blackjack.webp');
  console.log('Blackjack download:', bjRes.status);
}

run();
