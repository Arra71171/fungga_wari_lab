"use server"

import { createClient } from "@/lib/supabase/server"
import crypto from "crypto"

export async function getCloudinarySignature(folder: string = "fungga-wari-lab/assets") {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) {
    throw new Error("Unauthenticated");
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const apiKey = process.env.CLOUDINARY_API_KEY;

  if (!apiSecret || !apiKey) {
    throw new Error("Cloudinary secrets are missing on the server");
  }

  // To sign a Cloudinary upload request, we need to sort the parameters and calculate the SHA-1
  // Parameters to sign (alphabetical order): folder, timestamp
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash("sha1").update(paramsToSign).digest("hex");

  return { timestamp, signature, apiKey, folder };
}
