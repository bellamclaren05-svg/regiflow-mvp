import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const matterId = req.query.matterId as string;
  if (!matterId) return res.status(400).json({ error: "matterId is required" });

  const { data, error } = await supabase
    .from("documents")
    .select("id, file_name, document_type, created_at")
    .eq("matter_id", matterId)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json(data ?? []);
}