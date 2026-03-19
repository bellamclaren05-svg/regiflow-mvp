import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { supabase } from '@/lib/supabaseClient';

const CreateRequisitionSchema = z.object({
  matter_id: z.string().uuid('Invalid matter ID'),
  description: z.string().min(1, 'Description required'),
  raised_by: z.string().optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const { matter_id } = req.query;
    if (!matter_id || typeof matter_id !== 'string') {
      return res.status(400).json({ error: 'matter_id query param required' });
    }

    const { data, error } = await supabase
      .from('requisitions')
      .select('*')
      .eq('matter_id', matter_id)
      .order('created_at', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const parsed = CreateRequisitionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    }

    const { data, error } = await supabase
      .from('requisitions')
      .insert([parsed.data])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    // Log the event
    await supabase.from('event_logs').insert([{
      matter_id: parsed.data.matter_id,
      event_type: 'requisition_created',
      payload: { requisition_id: data.id },
    }]);

    return res.status(201).json(data);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: 'Method not allowed' });
}
