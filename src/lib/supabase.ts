import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase Client for Storage
 *
 * We use Supabase Storage to store AI-generated images.
 * The service role key gives us server-side write access
 * to upload images. The images are stored in a public bucket
 * so they can be displayed directly via URL.
 *
 * We lazy-initialize the client so it doesn't crash during
 * Next.js build time when env vars aren't available yet.
 *
 * NEVER expose the service role key to the client!
 */

let supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return supabase;
}

/**
 * Upload an image to Supabase Storage and return the public URL.
 *
 * @param base64Data - The raw base64 image data (no data URI prefix)
 * @param mimeType - The MIME type (e.g., "image/png")
 * @param userId - The user's ID (used as folder name)
 * @param postId - The post's ID (used as filename)
 * @returns The public URL of the uploaded image, or null on failure
 */
export async function uploadPostImage(
  base64Data: string,
  mimeType: string,
  userId: string,
  postId: string
): Promise<string | null> {
  try {
    const client = getSupabase();

    // Convert base64 to a Buffer for upload
    const buffer = Buffer.from(base64Data, "base64");

    // Determine file extension from MIME type
    const ext = mimeType.includes("png") ? "png" : "jpg";
    const filePath = `${userId}/${postId}.${ext}`;

    // Upload to the "post-images" bucket
    const { error } = await client.storage
      .from("post-images")
      .upload(filePath, buffer, {
        contentType: mimeType,
        upsert: true, // Overwrite if exists (for regeneration)
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return null;
    }

    // Get the public URL
    const { data } = client.storage
      .from("post-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (err) {
    console.error("Upload error:", err);
    return null;
  }
}
