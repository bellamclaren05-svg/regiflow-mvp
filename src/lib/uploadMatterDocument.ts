import { supabase } from "./supabaseClient";

function sanitizeFileName(name: string) {
  return name.replace(/[^\w.\-]+/g, "_");
}

// Auto-complete the matching missing-doc task (if it exists)
async function autoCompleteMissingDocTask(matterId: string, documentType: string) {
  const label = `Missing doc: ${documentType}`;

  const { error } = await supabase
    .from("tasks")
    .update({ completed: true })
    .eq("matter_id", matterId)
    .eq("label", label)
    .eq("completed", false);

  // Do not block uploads if this fails
  if (error) {
    console.warn("Auto-complete task failed:", error.message);
  }
}

export async function uploadMatterDocument(
  matterId: string,
  file: File,
  documentType?: string
) {
  const safeName = sanitizeFileName(file.name);
  const storagePath = `${matterId}/${crypto.randomUUID()}_${safeName}`;

  // 1) Upload to Storage
  const { error: uploadError } = await supabase.storage
    .from("matter-documents")
    .upload(storagePath, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) throw uploadError;

  // 2) Insert document metadata into DB
  const finalType = documentType || "Other";

  const { error: insertError } = await supabase.from("documents").insert({
    matter_id: matterId,
    file_name: file.name,
    storage_bucket: "matter-documents",
    storage_path: storagePath,
    mime_type: file.type,
    size_bytes: file.size,
    document_type: finalType,
  });

  if (insertError) throw insertError;

  // 3) Auto-complete the corresponding missing-doc task
  if (finalType !== "Other") {
    await autoCompleteMissingDocTask(matterId, finalType);
  }

  return { storagePath, documentType: finalType };
}