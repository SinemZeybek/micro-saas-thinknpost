import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Lazy-initialized — only created when actually uploading a file
let _supabase: SupabaseClient | null = null;
function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _supabase;
}

const BUCKET = "knowledge-files";

export async function uploadKnowledgeFile(
  buffer: Buffer,
  mimeType: string,
  userId: string,
  fileId: string
): Promise<string | null> {
  try {
    const ext = mimeType.includes("pdf") ? "pdf" : "txt";
    const filePath = `${userId}/${fileId}.${ext}`;

    const supabase = getSupabase();
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      console.error("Knowledge file upload error:", error);
      return null;
    }

    const { data } = getSupabase().storage.from(BUCKET).getPublicUrl(filePath);
    return data.publicUrl;
  } catch (err) {
    console.error("Knowledge file upload failed:", err);
    return null;
  }
}
