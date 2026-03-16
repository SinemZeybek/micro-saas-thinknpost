/**
 * Supabase Storage Client
 *
 * We use Supabase Storage to store AI-generated images.
 * The service_role key gives us full access to upload files
 * to the "post-images" bucket we created in the dashboard.
 *
 * Flow:
 * 1. Gemini generates an image → returns base64 data
 * 2. We convert base64 to a Buffer
 * 3. Upload that Buffer to Supabase Storage
 * 4. Get the public URL back
 * 5. Store the URL in the Post record
 */

import { createClient } from "@supabase/supabase-js";

// Create a Supabase client with the service_role key
// This key has full permissions — only use it on the server!
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = "post-images";

/**
 * Upload a base64 image to Supabase Storage.
 * Returns the public URL of the uploaded image, or null if it fails.
 */
export async function uploadPostImage(
  base64Data: string,
  mimeType: string,
  userId: string,
  postId: string
): Promise<string | null> {
  try {
    // Convert base64 string to a Buffer (binary data)
    const buffer = Buffer.from(base64Data, "base64");

    // Figure out the file extension from the MIME type
    const ext = mimeType.includes("png") ? "png" : "jpg";

    // Create a unique path: userId/postId.png
    const filePath = `${userId}/${postId}.${ext}`;

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, buffer, {
        contentType: mimeType,
        upsert: true, // Overwrite if exists
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return null;
    }

    // Get the public URL for this file
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);

    return data.publicUrl;
  } catch (err) {
    console.error("Upload failed:", err);
    return null;
  }
}
