import { supabase } from "./supabaseClient";

export async function listMatterDocuments(matterId: string) {
  const { data, error } = await supabase
    .from("documents")
    .select("id, file_name, storage_bucket, storage_path, created_at")
    .eq("matter_id", matterId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
``