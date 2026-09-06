import { createClient } from '@supabase/supabase-js';
import { labCronAuthorized } from './_guard';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'method' });
  }
  if (!labCronAuthorized(req)) {
    return res.status(401).json({ success: false, error: 'unauthorized' });
  }
  const { message_id, subject, body, org_slug } = req.body || {};
  if (!message_id) return res.status(400).json({ success: false, error: 'message_id required' });
  const url = process.env.VITE_LAB_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return res.status(503).json({ success: false, error: 'missing_supabase_admin' });
  try {
    const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await supabase.schema('lab').rpc('process_inbound_email', {
      p_org_slug: org_slug || 'elitech',
      p_message_id: String(message_id),
      p_subject: subject || '',
      p_body: body || '',
    });
    if (error) return res.status(400).json({ success: false, error: error.message });
    return res.json({ success: true, classification: data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'inbound failed' });
  }
}
