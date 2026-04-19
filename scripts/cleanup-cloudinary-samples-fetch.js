const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Load environment from root .env.local
const envPath = path.resolve('.env.local');
const envData = fs.readFileSync(envPath, 'utf8');
const envVars = Object.fromEntries(
  envData.split('\n')
    .filter(l => l.trim() && !l.startsWith('#'))
    .map(l => {
      const parts = l.split('=');
      return [parts[0].trim(), parts.slice(1).join('=').trim()];
    })
);

const CLOUD_NAME = envVars['NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME'] || 'dlytqegcw';
const API_KEY = envVars['CLOUDINARY_API_KEY'];
const API_SECRET = envVars['CLOUDINARY_API_SECRET'];

if (!API_KEY || !API_SECRET) {
  console.error('❌ CLOUDINARY_API_KEY or CLOUDINARY_API_SECRET missing in .env.local');
  process.exit(1);
}

const KEEP = new Set(['cta-section_q3weam', 'main-sample']);

async function deleteAsset(publicId, resourceType = 'image') {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = crypto.createHash('sha1')
    .update(`public_id=${publicId}&timestamp=${timestamp}${API_SECRET}`)
    .digest('hex');

  const formData = new URLSearchParams();
  formData.append('public_id', publicId);
  formData.append('timestamp', timestamp);
  formData.append('api_key', API_KEY);
  formData.append('signature', signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/destroy`, {
    method: 'POST',
    body: formData
  });
  return res.json();
}

async function listAssets(resourceType = 'image') {
  const auth = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/${resourceType}/upload?max_results=100`, {
    headers: { Authorization: `Basic ${auth}` }
  });
  return res.json();
}

async function run() {
  console.log('🔍 Cleaning up Cloudinary samples (Fetch API version)...');
  
  let deleted = 0;
  for (const type of ['image', 'video']) {
    const data = await listAssets(type);
    if (!data.resources) {
      console.warn(`  ⚠️ No ${type} assets found or error:`, data.error?.message);
      continue;
    }

    for (const asset of data.resources) {
      if (KEEP.has(asset.public_id)) continue;
      if (asset.public_id.startsWith('samples/') || asset.public_id.startsWith('cld-sample')) {
        const result = await deleteAsset(asset.public_id, type);
        if (result.result === 'ok') {
          console.log(`  🗑 Deleted ${type}: ${asset.public_id}`);
          deleted++;
        } else {
          console.error(`  ❌ Failed to delete ${asset.public_id}:`, result.error?.message || result.result);
        }
      }
    }
  }

  console.log(`\n✅ Done. Deleted ${deleted} sample assets.`);
}

run().catch(err => {
  console.error('❌ Cleanup failed:', err.message);
  process.exit(1);
});
