const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

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

cloudinary.config({
  cloud_name: envVars['NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME'] || 'dlytqegcw',
  api_key: envVars['CLOUDINARY_API_KEY'],
  api_secret: envVars['CLOUDINARY_API_SECRET']
});

const KEEP = new Set(['cta-section_q3weam', 'main-sample']);

async function run() {
  console.log('🔍 Cleaning up Cloudinary samples...');
  let deleted = 0;

  // Cleanup images
  const images = await cloudinary.api.resources({ resource_type: 'image', type: 'upload', max_results: 100 });
  for (const asset of images.resources) {
    if (KEEP.has(asset.public_id)) continue;
    if (asset.public_id.startsWith('samples/') || asset.public_id.startsWith('cld-sample')) {
      await cloudinary.uploader.destroy(asset.public_id);
      console.log(`  🗑 Deleted image: ${asset.public_id}`);
      deleted++;
    }
  }

  // Cleanup videos
  const videos = await cloudinary.api.resources({ resource_type: 'video', type: 'upload', max_results: 100 });
  for (const asset of videos.resources) {
    if (asset.public_id.startsWith('samples/')) {
      await cloudinary.uploader.destroy(asset.public_id, { resource_type: 'video' });
      console.log(`  🗑 Deleted video: ${asset.public_id}`);
      deleted++;
    }
  }

  console.log(`\n✅ Done. Deleted ${deleted} sample assets.`);
}

run().catch(err => {
  console.error('❌ Cleanup failed:', err.message);
  process.exit(1);
});
