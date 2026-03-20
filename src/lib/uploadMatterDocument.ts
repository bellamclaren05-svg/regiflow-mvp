import { supabase } from "./supabaseClient";

function sanitizeFileName(name: string) {
  return name.replace(/[^\w.\-]+/g, "_");
}

export async function uploadMatterDocument(
  matterId: string,
  file: File,
  documentType?: string
) {
  const safeName = sanitizeFileName(file.name);
  const storagePath = `${matterId}/${crypto.randomUUID()}_${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from("matter-documents")
    .upload(storagePath, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) throw uploadError;

const { error: insertError } = await supabase.from("documents").insert({
  matter_id: matterId,
  file_name: file.name,
  storage_bucket: "matter-documents",
  storage_path: storagePath,
  mime_type: file.type,
  size_bytes: file.size,
  document_type: documentType || null,
});


  if (insertError) throw insertError;

  return storagePath;
}
