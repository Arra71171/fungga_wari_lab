"use server"

import { requireUser } from "./authHelpers"
import { z } from "zod"
import crypto from "crypto"

const signatureSchema = z.object({
  folder: z.enum(["fungga-wari-lab/assets"]).default("fungga-wari-lab/assets"),
})

const authorizedUploadRoles = new Set(["admin", "superadmin", "editor"])

export async function getCloudinarySignature(folderInput: string = "fungga-wari-lab/assets") {
  const { profile } = await requireUser()
  
  if (!profile.role || !authorizedUploadRoles.has(profile.role)) {
    throw new Error("Forbidden")
  }

  const { folder } = signatureSchema.parse({ folder: folderInput })

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
