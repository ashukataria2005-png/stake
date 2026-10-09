const fs = require('fs');
const path = require('path');

const scratchDir = 'C:/Users/ashok/.gemini/antigravity-ide/brain/2f9baf99-78b2-4b53-a211-ad8d25f6b54e/scratch';
const files = fs.readdirSync(scratchDir).filter(f => f.endsWith('.json'));
console.log('JSON files in scratch:', files);

// Let's load the main files
for (const f of files) {
  try {
    const full = path.join(scratchDir, f);
    const stat = fs.statSync(full);
    console.log(`- ${f}: ${(stat.size / 1024).toFixed(1)} KB`);
  } catch (e) {}
}
