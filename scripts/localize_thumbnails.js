/**
 * scripts/localize_thumbnails.js
 *
 * Task 34: Localize all game thumbnails and decouple external CDN dependencies.
 * Downloads remote thumbnail assets mapped in src/data/gameThumbnails.ts
 * into public/games/ and updates references to local static paths.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const THUMBNAILS_FILE = path.join(ROOT_DIR, 'src', 'data', 'gameThumbnails.ts');
const OUTPUT_DIR = path.join(ROOT_DIR, 'public', 'games');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function getExtensionFromType(contentType, buffer, url) {
  if (contentType) {
    const ct = contentType.toLowerCase();
    if (ct.includes('image/webp')) return '.webp';
    if (ct.includes('image/png')) return '.png';
    if (ct.includes('image/jpeg') || ct.includes('image/jpg')) return '.jpg';
    if (ct.includes('image/svg')) return '.svg';
    if (ct.includes('image/gif')) return '.gif';
  }

  // Sniff magic bytes
  if (buffer && buffer.length >= 8) {
    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
      return '.png';
    }
    // JPEG: FF D8 FF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return '.jpg';
    }
    // WEBP: RIFF .... WEBP
    if (
      buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
    ) {
      return '.webp';
    }
    // GIF: GIF8
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) {
      return '.gif';
    }
  }

  // Fallback to URL path
  try {
    const cleanUrl = url.split('?')[0].split('#')[0];
    const ext = path.extname(cleanUrl).toLowerCase();
    if (['.webp', '.png', '.jpg', '.jpeg', '.svg', '.gif'].includes(ext)) {
      return ext === '.jpeg' ? '.jpg' : ext;
    }
  } catch {}

  return '.webp';
}

// In-memory cache for downloaded URLs to avoid duplicate downloads
const urlCache = new Map();

async function downloadUrl(url, retries = 3) {
  // Check if URL was malformed with concatenated URLs
  let targetUrl = url.trim();
  if (targetUrl.includes('http://') || targetUrl.includes('https://')) {
    const parts = targetUrl.match(/https?:\/\/[^\s"']+/g);
    if (parts && parts.length > 1) {
      targetUrl = parts[parts.length - 1]; // take the valid last one
    }
  }

  if (urlCache.has(targetUrl)) {
    return urlCache.get(targetUrl);
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        },
        redirect: 'follow',
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const contentType = response.headers.get('content-type') || '';
      const ext = getExtensionFromType(contentType, buffer, targetUrl);

      const result = { buffer, ext, success: true };
      urlCache.set(targetUrl, result);
      return result;
    } catch (err) {
      if (attempt === retries) {
        console.warn(`[WARN] Failed to download ${targetUrl}: ${err.message}`);
        return { success: false, error: err.message };
      }
      await new Promise((res) => setTimeout(res, 800 * attempt));
    }
  }

  return { success: false, error: 'Unknown download error' };
}

// Concurrency pool helper
async function pool(items, concurrency, fn) {
  const results = [];
  const executing = new Set();
  for (const item of items) {
    const p = Promise.resolve().then(() => fn(item));
    results.push(p);
    executing.add(p);
    const clean = () => executing.delete(p);
    p.then(clean, clean);
    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }
  return Promise.all(results);
}

async function main() {
  console.log('====================================================');
  console.log('Task 34: Localize Game Thumbnails');
  console.log('====================================================');
  console.log(`Reading registry: ${THUMBNAILS_FILE}`);
  console.log(`Target directory: ${OUTPUT_DIR}\n`);

  const fileContent = fs.readFileSync(THUMBNAILS_FILE, 'utf8');
  const lines = fileContent.split('\n');

  // Match key-value mappings like:
  // "chicken-road-2": "https://...",
  // or
  // dice: "https://...",
  const entryRegex = /^(\s*)(['"]?)([\w\-]+)\2(\s*:\s*)(['"])(.*?)\5(,?\s*)$/;

  const itemsToProcess = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(entryRegex);
    if (match) {
      const [full, indent, quoteKey, key, colon, quoteVal, url, comma] = match;
      const cleanUrl = url.trim();

      if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
        itemsToProcess.push({
          lineIndex: i,
          indent,
          quoteKey,
          key,
          colon,
          quoteVal,
          url: cleanUrl,
          comma,
        });
      }
    }
  }

  console.log(`Found ${itemsToProcess.length} remote thumbnail entries in registry.`);

  let downloadedCount = 0;
  let cachedCount = 0;
  let failedCount = 0;

  // Track the local path for each lineIndex
  const updates = new Map();

  await pool(itemsToProcess, 8, async (item) => {
    const { key, url, lineIndex } = item;

    // Check if a file for this key already exists locally in public/games/
    const existingExts = ['.webp', '.png', '.jpg', '.jpeg', '.svg'];
    let existingFile = null;
    for (const ext of existingExts) {
      const testPath = path.join(OUTPUT_DIR, `${key}${ext}`);
      if (fs.existsSync(testPath) && fs.statSync(testPath).size > 100) {
        existingFile = `${key}${ext}`;
        break;
      }
    }

    if (existingFile) {
      cachedCount++;
      updates.set(lineIndex, `/games/${existingFile}`);
      return;
    }

    // Download
    const downloadRes = await downloadUrl(url);
    if (downloadRes.success) {
      const filename = `${key}${downloadRes.ext}`;
      const filePath = path.join(OUTPUT_DIR, filename);
      fs.writeFileSync(filePath, downloadRes.buffer);
      downloadedCount++;
      updates.set(lineIndex, `/games/${filename}`);
    } else {
      failedCount++;
      // Keep original URL on failure
    }
  });

  // Reconstruct file lines with updated local paths
  let updatedCount = 0;
  const newLines = lines.map((line, idx) => {
    if (updates.has(idx)) {
      const item = itemsToProcess.find((it) => it.lineIndex === idx);
      const localPath = updates.get(idx);
      updatedCount++;
      return `${item.indent}${item.quoteKey}${item.key}${item.quoteKey}${item.colon}${item.quoteVal}${localPath}${item.quoteVal}${item.comma}`;
    }
    return line;
  });

  fs.writeFileSync(THUMBNAILS_FILE, newLines.join('\n'), 'utf8');

  console.log('\n====================================================');
  console.log('Localization Complete Summary:');
  console.log(`- Newly downloaded: ${downloadedCount}`);
  console.log(`- Reused existing: ${cachedCount}`);
  console.log(`- Failed downloads: ${failedCount}`);
  console.log(`- Registry paths updated: ${updatedCount} in ${THUMBNAILS_FILE}`);
  console.log('====================================================\n');
}

main().catch((err) => {
  console.error('[FATAL ERROR]:', err);
  process.exit(1);
});
