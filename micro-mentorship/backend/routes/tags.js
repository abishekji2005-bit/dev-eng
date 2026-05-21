import { Router } from 'express';
import { supabase } from '../supabase.js';

const r = Router();

// GET /api/tags
r.get('/', async (_req, res) => {
  const { data, error } = await supabase.from('tags').select('*').order('name');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default r;
