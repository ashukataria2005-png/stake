const fs = require('fs');
const path = require('path');

const scratchDir = 'C:/Users/ashok/.gemini/antigravity-ide/brain/2f9baf99-78b2-4b53-a211-ad8d25f6b54e/scratch';
const map = JSON.parse(fs.readFileSync(path.join(scratchDir, 'provider_games_map.json'), 'utf8'));

function findGames(provider, keywords) {
  const list = map[provider] || [];
  return list.filter(g => {
    const n = g.name.toLowerCase();
    return keywords.every(k => n.includes(k.toLowerCase()));
  });
}

console.log('--- Evolution Search ---');
console.log('Ruleta Espanol:', findGames('Evolution Gaming', ['ruleta']));
console.log('Disco:', findGames('Evolution Gaming', ['disco']));
console.log('Infinite:', findGames('Evolution Gaming', ['infinite']));
console.log('Monopoly:', findGames('Evolution Gaming', ['monopoly']));
console.log('Turkce / Turkish:', findGames('Evolution Gaming', ['turk']));
console.log('Lotus Roulette:', findGames('Evolution Gaming', ['lotus']));
console.log('Emperor Bac Bo:', findGames('Evolution Gaming', ['emperor', 'bac bo']));
console.log('Live Bac Bo:', findGames('Evolution Gaming', ['bac bo']));
console.log('Turkish Football:', findGames('Evolution Gaming', ['football']));
console.log('Lucky Baccarat:', findGames('Evolution Gaming', ['lucky', 'baccarat']));

console.log('\n--- Ezugi Search ---');
console.log('Ruleta Del Sol:', findGames('Ezugi', ['sol']));
console.log('Italian Roulette:', findGames('Ezugi', ['italian']));
console.log('Baccarat Super 6:', findGames('Ezugi', ['super 6']));
console.log('Knockout Baccarat:', findGames('Ezugi', ['knockout']));
console.log('Golden Baccarat:', findGames('Ezugi', ['golden']));
console.log('Salsa Baccarat:', findGames('Ezugi', ['salsa']));
console.log('Sic Bo Live:', findGames('Ezugi', ['sic bo']));

console.log('\n--- Spribe Search ---');
console.log('Spribe all:', map['Spribe']);

console.log('\n--- Smartsoft Search ---');
console.log('Smartsoft all:', map['Smartsoft Gaming']);

console.log('\n--- Jili Search ---');
console.log('Jili Baccarat:', findGames('JiLi Gaming', ['baccarat']));
console.log('Jili Blackjack:', findGames('JiLi Gaming', ['blackjack']));
console.log('Jili Teen Patti:', findGames('JiLi Gaming', ['teen patti']));

console.log('\n--- Evoplay Search ---');
console.log('Evoplay Penalty Shoot:', findGames('Evoplay Entertainment', ['penalty']));
console.log('Evoplay Uncrossable:', findGames('Evoplay Entertainment', ['uncrossable']));
console.log('Evoplay European Christmas Roulette:', findGames('Evoplay Entertainment', ['christmas']));

console.log('\n--- Mac88 Search ---');
console.log('Mac88 Dragon Tiger:', findGames('Mac88 Gaming', ['dragon tiger']));
