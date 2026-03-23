import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET /api/tasks-by-matter?matterId=...
  if (req.method === "GET") {
    const matterId = req.query.matterId as string;
    if (!matterId) return res.status(400).json({ error: "matterId is required" });

    const { data, error } = await supabase
      .from("tasks")
      .select("id, matter_id, label, completed, created_at")
      .eq("matter_id", matterId)
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data ?? []);
  }

  // PATCH /api/tasks-by-matter  { id, completed }
  if (req.method === "PATCH") {
    const { id, completed } = req.body || {};
    if (!id || typeof completed !== "boolean") {
      return res.status(400).json({ error: "id and completed(boolean) are required" });
    }

    const { data, error } = await supabase
      .from("tasks")
      .update({ completed })
      .eq("id", id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  res.setHeader("Allow", ["GET", "PATCH"]);
  return res.status(405).json({ error: "Method not allowed" });
}
