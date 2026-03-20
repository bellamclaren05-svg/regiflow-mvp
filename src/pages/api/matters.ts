import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { supabase } from "@/lib/supabaseClient";

const CreateMatterSchema = z.object({
  title: z.string().min(1, "Title required"),
  reference: z.string().optional(),
  completion_date: z.string().optional(),
});

const PatchMatterSchema = z.object({
  id: z.string().min(1, "id required"),
  transaction_type: z.union([z.literal("purchase"), z.literal("sale")]).nullable().optional(),
  is_leasehold: z.boolean().nullable().optional(),
  has_mortgage: z.boolean().nullable().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET: one matter (by id) or list
  if (req.method === "GET") {
    const { id } = req.query;

    if (id && typeof id === "string") {
      const { data, error } = await supabase
        .from("matters")
        .select("*")
        .eq("id", id)
        .single();

      if (error) return res.status(404).json({ error: error.message });
      return res.status(200).json(data);
    }

    const { data, error } = await supabase
      .from("matters")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  // POST: create matter
  if (req.method === "POST") {
    const parsed = CreateMatterSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    }

    const { data, error } = await supabase
      .from("matters")
      .insert([parsed.data])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  // PATCH: update automation flags
  if (req.method === "PATCH") {
    const parsed = PatchMatterSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    }

    const { id, transaction_type, is_leasehold, has_mortgage } = parsed.data;

    // Only update fields that were provided
    const updatePayload: Record<string, any> = {};
    if (parsed.data.transaction_type !== undefined) updatePayload.transaction_type = transaction_type;
    if (parsed.data.is_leasehold !== undefined) updatePayload.is_leasehold = is_leasehold;
    if (parsed.data.has_mortgage !== undefined) updatePayload.has_mortgage = has_mortgage;

    const { data, error } = await supabase
      .from("matters")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  res.setHeader("Allow", ["GET", "POST", "PATCH"]);
  return res.status(405).json({ error: "Method not allowed" });
}
