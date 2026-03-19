import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { supabase } from '@/lib/supabaseClient';

const CreateMatterSchema = z.object({
  title: z.string().min(1, 'Title required'),
  reference: z.string().optional(),
  completion_date: z.string().optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const { id } = req.query;

    if (id && typeof id === 'string') {
      const { data, error } = await supabase
        .from('matters')
        .select('*')
        .eq('id', id)
        .single();

      if (error) return res.status(404).json({ error: error.message });
      return res.status(200).json(data);
    }

    const { data, error } = await supabase
      .from('matters')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const parsed = CreateMatterSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    }

    const { data, error } = await supabase
      .from('matters')
      .insert([parsed.data])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: 'Method not allowed' });
}
