import { Router } from 'express';
import { supabase } from '../supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { profileByClerk } from '../utils/profile.js';

const r = Router();

const REQUEST_SELECT = `
  *,
  owner:profiles!requests_owner_id_fkey(id, clerk_id, name, email, team, avatar_url),
  assignee:profiles!requests_assignee_id_fkey(id, clerk_id, name, email, team, avatar_url),
  request_tags(tag_id, tags(id, name))
`;

// ──────────────────────────────────────────
// GET /api/requests  — list + filter
// Query params: type, status, priority, team, tag (tag name), search
// ──────────────────────────────────────────
r.get('/', async (req, res) => {
  const { type, status, priority, team, tag, search } = req.query;

  let query = supabase.from('requests').select(REQUEST_SELECT).order('created_at', { ascending: false });

  if (type)     query = query.eq('type', type);
  if (status)   query = query.eq('status', status);
  if (priority) query = query.eq('priority', priority);
  if (team)     query = query.ilike('team', `%${team}%`);
  if (search)   query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  let results = data;

  // Filter by tag name (post-process — small dataset)
  if (tag) {
    results = results.filter(r =>
      r.request_tags?.some(rt => rt.tags?.name?.toLowerCase() === tag.toLowerCase())
    );
  }

  res.json(results);
});

// ──────────────────────────────────────────
// GET /api/requests/mine  — requests I own
// ──────────────────────────────────────────
r.get('/mine', requireAuth, async (req, res) => {
  const ownerId = await profileByClerk(req.clerkId);
  if (!ownerId) return res.status(404).json({ error: 'Profile not found' });

  const { data, error } = await supabase
    .from('requests').select(REQUEST_SELECT).eq('owner_id', ownerId)
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ──────────────────────────────────────────
// GET /api/requests/claimed  — requests I claimed
// ──────────────────────────────────────────
r.get('/claimed', requireAuth, async (req, res) => {
  const claimerId = await profileByClerk(req.clerkId);
  if (!claimerId) return res.status(404).json({ error: 'Profile not found' });

  const { data, error } = await supabase
    .from('requests').select(REQUEST_SELECT).eq('assignee_id', claimerId)
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ──────────────────────────────────────────
// GET /api/requests/:id  — request detail
// ──────────────────────────────────────────
r.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('requests')
    .select(`${REQUEST_SELECT}, progress_updates(*, author:profiles(id,name,avatar_url)), comments(*, author:profiles(id,name,avatar_url))`)
    .eq('id', req.params.id)
    .single();
  if (error) return res.status(error.code === 'PGRST116' ? 404 : 500).json({ error: error.message });
  res.json(data);
});

// ──────────────────────────────────────────
// POST /api/requests  — create request
// ──────────────────────────────────────────
r.post('/', requireAuth, async (req, res) => {
  const ownerId = await profileByClerk(req.clerkId);
  if (!ownerId) return res.status(404).json({ error: 'Profile not found' });

  const { title, description, type, team, priority, repo_url, tag_ids = [] } = req.body;

  if (!title?.trim() || !description?.trim() || !team?.trim()) {
    return res.status(400).json({ error: 'Title, description, and team are required' });
  }
  const validTypes = ['mentorship', 'code_review'];
  const validPriorities = ['low', 'medium', 'high', 'urgent'];
  if (!validTypes.includes(type)) return res.status(400).json({ error: `Invalid type. Must be: ${validTypes.join(', ')}` });
  if (priority && !validPriorities.includes(priority)) return res.status(400).json({ error: `Invalid priority. Must be: ${validPriorities.join(', ')}` });

  const { data: request, error } = await supabase
    .from('requests')
    .insert({ title, description, type, team, priority, repo_url, owner_id: ownerId })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });

  if (tag_ids.length > 0) {
    await supabase.from('request_tags').insert(
      tag_ids.map(tag_id => ({ request_id: request.id, tag_id }))
    );
  }

  res.status(201).json(request);
});

// ──────────────────────────────────────────
// PUT /api/requests/:id  — edit request
// ──────────────────────────────────────────
r.put('/:id', requireAuth, async (req, res) => {
  const ownerId = await profileByClerk(req.clerkId);
  const { data: existing } = await supabase
    .from('requests').select('owner_id, status').eq('id', req.params.id).single();
  if (!existing) return res.status(404).json({ error: 'Not found' });
  if (existing.owner_id !== ownerId) return res.status(403).json({ error: 'Only the owner can edit' });
  if (['completed', 'cancelled'].includes(existing.status)) {
    return res.status(400).json({ error: 'Cannot edit a completed or cancelled request' });
  }

  const { title, description, type, team, priority, repo_url, tag_ids } = req.body;
  const updates = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (type !== undefined) updates.type = type;
  if (team !== undefined) updates.team = team;
  if (priority !== undefined) updates.priority = priority;
  if (repo_url !== undefined) updates.repo_url = repo_url;

  const { data, error } = await supabase
    .from('requests').update(updates).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });

  // Update tags if provided
  if (Array.isArray(tag_ids)) {
    await supabase.from('request_tags').delete().eq('request_id', req.params.id);
    if (tag_ids.length > 0) {
      await supabase.from('request_tags').insert(
        tag_ids.map(tag_id => ({ request_id: req.params.id, tag_id }))
      );
    }
  }

  res.json(data);
});

// ──────────────────────────────────────────
// DELETE /api/requests/:id  — delete request
// ──────────────────────────────────────────
r.delete('/:id', requireAuth, async (req, res) => {
  const ownerId = await profileByClerk(req.clerkId);
  const { data: existing } = await supabase
    .from('requests').select('owner_id, status').eq('id', req.params.id).single();
  if (!existing) return res.status(404).json({ error: 'Not found' });
  if (existing.owner_id !== ownerId) return res.status(403).json({ error: 'Only the owner can delete' });

  await supabase.from('requests').delete().eq('id', req.params.id);
  res.json({ ok: true });
});

// ──────────────────────────────────────────
// PATCH /api/requests/:id/status  — update status
// ──────────────────────────────────────────
r.patch('/:id/status', requireAuth, async (req, res) => {
  const { status } = req.body;
  const profileId = await profileByClerk(req.clerkId);

  // Only owner or assignee can update
  const { data: existing } = await supabase
    .from('requests').select('owner_id, assignee_id').eq('id', req.params.id).single();
  if (!existing) return res.status(404).json({ error: 'Not found' });
  if (existing.owner_id !== profileId && existing.assignee_id !== profileId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { data, error } = await supabase
    .from('requests').update({ status }).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ──────────────────────────────────────────
// POST /api/requests/:id/claim  — claim a request
// ──────────────────────────────────────────
r.post('/:id/claim', requireAuth, async (req, res) => {
  const claimerId = await profileByClerk(req.clerkId);
  if (!claimerId) return res.status(404).json({ error: 'Profile not found' });

  const { message } = req.body;
  const requestId = req.params.id;

  // Check not already claimed/completed
  const { data: existing } = await supabase
    .from('requests').select('status, owner_id').eq('id', requestId).single();
  if (!existing) return res.status(404).json({ error: 'Not found' });
  if (existing.owner_id === claimerId) return res.status(400).json({ error: 'Cannot claim your own request' });
  if (!['open'].includes(existing.status)) return res.status(400).json({ error: `Request is ${existing.status}` });

  // Insert claim record
  const { error: claimErr } = await supabase
    .from('claims').insert({ request_id: requestId, claimer_id: claimerId, message });
  if (claimErr) return res.status(500).json({ error: claimErr.message });

  // Update request
  const { data, error } = await supabase
    .from('requests')
    .update({ assignee_id: claimerId, status: 'claimed' })
    .eq('id', requestId).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default r;
