const fs = require('fs');
const matched = JSON.parse(fs.readFileSync('C:/Users/ashok/.gemini/antigravity-ide/brain/2f9baf99-78b2-4b53-a211-ad8d25f6b54e/scratch/matched_evo.json', 'utf8'));
console.log('matched_evo keys:', Object.keys(matched).slice(0, 30));
for (const [k, v] of Object.entries(matched).slice(0, 10)) {
  console.log(k, '->', v);
}
