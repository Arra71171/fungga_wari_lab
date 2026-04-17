/**
 * Cleanup script: deletes all Cloudinary demo sample assets.
 * Keeps only actual project images (cta-section_q3weam, main-sample).
 *
 * Usage (from repo root):
 *   node scripts/cleanup-cloudinary-samples.mjs
 *
 * Requires: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 * in apps/dashboard/.env.local
 */
import { v2 as cloudinary } from "cloudinary";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load env manually (no dotenv dependency required in scripts)
const envPath = resolve(".env.local");
const envVars = Object.fromEntries(
  readFileSync(envPath, "utf-8")
    .split("\n")
    .filter((l) => l.trim() && !l.startsWith("#"))
    .map((l) => {
      const parts = l.split("=");
      return [parts[0].trim(), parts.slice(1).join("=").trim()];
    })
);

cloudinary.config({
  cloud_name: envVars["NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"],
  api_key: envVars["CLOUDINARY_API_KEY"],
  api_secret: envVars["CLOUDINARY_API_SECRET"],
});

// Project assets to preserve — never delete these
const KEEP = new Set(["cta-section_q3weam", "main-sample"]);

async function isSampleAsset(publicId) {
  return (
    publicId.startsWith("samples/") ||
    publicId.startsWith("cld-sample") ||
    publicId.startsWith("main-sample") === false && publicId === "cta-section_q3weam" === false
  );
}

async function run() {
  console.log("🔍 Scanning Cloudinary for sample assets to delete...\n");
  let deleted = 0;
  let cursor;

  // --- Images ---
  do {
    const result = await cloudinary.api.resources({
      resource_type: "image",
      type: "upload",
      max_results: 100,
      next_cursor: cursor,
    });

    for (const asset of result.resources) {
      if (KEEP.has(asset.public_id)) {
        console.log(`  ✓ Keeping: ${asset.public_id}`);
        continue;
      }
      // Delete anything in samples/* sub-folders or named cld-sample*
      if (
        asset.public_id.startsWith("samples/") ||
        asset.public_id.startsWith("cld-sample")
      ) {
        await cloudinary.uploader.destroy(asset.public_id);
        console.log(`  🗑  Deleted image: ${asset.public_id}`);
        deleted++;
      }
    }
    cursor = result.next_cursor;
  } while (cursor);

  // --- Videos ---
  const videos = await cloudinary.api.resources({
    resource_type: "video",
    type: "upload",
    max_results: 100,
  });
  for (const asset of videos.resources) {
    if (asset.public_id.startsWith("samples/")) {
      await cloudinary.uploader.destroy(asset.public_id, {
        resource_type: "video",
      });
      console.log(`  🗑  Deleted video: ${asset.public_id}`);
      deleted++;
    }
  }

  console.log(`\n✅ Done — deleted ${deleted} sample assets. Project assets preserved.`);
}

run().catch((err) => {
  console.error("❌ Cleanup failed:", err.message);
  process.exit(1);
});
