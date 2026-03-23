import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { matterId, labels } = req.body || {};

  if (!matterId || !Array.isArray(labels)) {
    return res.status(400).json({ error: "matterId and labels[] are required" });
  }

  const cleanedLabels = labels
    .map((s: any) => (typeof s === "string" ? s.trim() : ""))
    .filter(Boolean);

  if (cleanedLabels.length === 0) {
    return res.status(200).json({ created: 0, skipped: 0 });
  }

  // Fetch existing labels for this matter to prevent duplicates
  const { data: existing, error: fetchErr } = await supabase
    .from("tasks")
    .select("label")
    .eq("matter_id", matterId);

  if (fetchErr) return res.status(500).json({ error: fetchErr.message });

  const existingSet = new Set((existing ?? []).map((t: any) => t.label));
  const toCreate = cleanedLabels.filter((l: string) => !existingSet.has(l));

  if (toCreate.length === 0) {
    return res.status(200).json({ created: 0, skipped: cleanedLabels.length });
  }

  const rows = toCreate.map((label: string) => ({
    matter_id: matterId,
    label,
    completed: false,
  }));

  const { error: insertErr } = await supabase.from("tasks").insert(rows);
  if (insertErr) return res.status(500).json({ error: insertErr.message });

  return res.status(200).json({
    created: toCreate.length,
    skipped: cleanedLabels.length - toCreate.length,
  });
}