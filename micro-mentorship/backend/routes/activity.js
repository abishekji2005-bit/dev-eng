import { Router } from 'express';
import { supabase } from '../supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { profileByClerk } from '../utils/profile.js';

const r = Router({ mergeParams: true }); // mergeParams to get :requestId

// ──────────────────────────────────────────
// POST /api/requests/:requestId/progress
// ──────────────────────────────────────────
r.post('/progress', requireAuth, async (req, res) => {
  const authorId = await profileByClerk(req.clerkId);
  if (!authorId) return res.status(404).json({ error: 'Profile not found' });

  const { note, milestone } = req.body;
  const { data, error } = await supabase
    .from('progress_updates')
    .insert({ request_id: req.params.requestId, author_id: authorId, note, milestone })
    .select('*, author:profiles(id,name,avatar_url)')
    .single();
  if (error) return res.status(500).json({ error: error.message });

  // Auto-advance status to in_progress if still "claimed"
  await supabase
    .from('requests')
    .update({ status: 'in_progress' })
    .eq('id', req.params.requestId)
    .eq('status', 'claimed');

  res.status(201).json(data);
});

// ──────────────────────────────────────────
// POST /api/requests/:requestId/comments
// ──────────────────────────────────────────
r.post('/comments', requireAuth, async (req, res) => {
  const authorId = await profileByClerk(req.clerkId);
  if (!authorId) return res.status(404).json({ error: 'Profile not found' });

  const { body } = req.body;
  const { data, error } = await supabase
    .from('comments')
    .insert({ request_id: req.params.requestId, author_id: authorId, body })
    .select('*, author:profiles(id,name,avatar_url)')
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// DELETE /api/requests/:requestId/comments/:id
r.delete('/comments/:id', requireAuth, async (req, res) => {
  const authorId = await profileByClerk(req.clerkId);
  await supabase.from('comments').delete().eq('id', req.params.id).eq('author_id', authorId);
  res.json({ ok: true });
});

export default r;
