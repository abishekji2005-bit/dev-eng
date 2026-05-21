import { Router } from 'express';
import { supabase } from '../supabase.js';
import { requireAuth } from '../middleware/auth.js';

const r = Router();

// GET /api/profile  — get profile for the authenticated user
r.get('/', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('clerk_id', req.clerkId)
    .single();

  if (error && error.code !== 'PGRST116') return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Profile not found. Please sign in again.' });
  res.json(data);
});

// PUT /api/profile  — update profile (name, team, role, avatar)
r.put('/', requireAuth, async (req, res) => {
  const { name, team, role, avatar_url } = req.body;

  // Validate role if provided
  const validRoles = ['developer', 'engineer'];
  if (role && !validRoles.includes(role)) {
    return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({ name, team, role, avatar_url })
    .eq('clerk_id', req.clerkId)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /api/profile/sync  — upsert profile (called after Clerk sign-in)
r.post('/sync', requireAuth, async (req, res) => {
  const { email, name, avatar_url, team } = req.body;
  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      { clerk_id: req.clerkId, email, name, avatar_url, team },
      { onConflict: 'clerk_id' }
    )
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/profile/roles  — list valid roles
r.get('/roles', (_req, res) => {
  res.json([
    { value: 'developer', label: 'Developer' },
    { value: 'engineer', label: 'Engineer' },
  ]);
});

export default r;
