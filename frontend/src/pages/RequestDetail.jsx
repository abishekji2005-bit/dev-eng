import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { api } from '../api';
import { useFetch } from '../hooks/useFetch';
import { StatusBadge, TypeBadge, PriorityBadge, TagChip, Avatar, Spinner } from '../components/Badges';
import ProgressTimeline from '../components/ProgressTimeline';
import { timeAgo } from '../utils/time';

const STATUS_TRANSITIONS = {
  open:        ['claimed', 'cancelled'],
  claimed:     ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed:   [],
  cancelled:   [],
};

export default function RequestDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const loc = useLocation();
  const { user } = useUser();

  // Determine link prefix from current path
  const prefix = loc.pathname.startsWith('/developer') ? '/developer' : '/engineer';

  const { data: req, loading, error, refetch } = useFetch(() => api.getRequest(id), [id]);

  const [claimMsg, setClaimMsg] = useState('');
  const [claimOpen, setClaimOpen] = useState(false);
  const [progressNote, setProgressNote] = useState('');
  const [milestone, setMilestone] = useState('');
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (loading) return <Spinner />;
  if (error) return <div className="text-rose text-sm text-center py-8">{error}</div>;
  if (!req) return null;

  const tags = req.request_tags?.map(rt => rt.tags).filter(Boolean) || [];
  const isOwner    = req.owner?.clerk_id === user?.id || req.owner?.email === user?.primaryEmailAddress?.emailAddress;
  const isAssignee = req.assignee?.email === user?.primaryEmailAddress?.emailAddress;
  const canAct     = isOwner || isAssignee;
  const canClaim   = !isOwner && req.status === 'open';
  const canEdit    = isOwner && !['completed', 'cancelled'].includes(req.status);
  const nextStatuses = canAct ? (STATUS_TRANSITIONS[req.status] || []) : [];

  const act = fn => async (...args) => { setBusy(true); try { await fn(...args); await refetch(); } catch(e) { alert(e.message); } finally { setBusy(false); } };

  const doClaim = act(async () => {
    await api.claimRequest(id, claimMsg);
    setClaimOpen(false);
    setClaimMsg('');
  });

  const doStatus = act(s => api.updateStatus(id, s));

  const doProgress = act(async () => {
    if (!progressNote.trim()) return;
    await api.addProgress(id, { note: progressNote, milestone });
    setProgressNote(''); setMilestone('');
  });

  const doComment = act(async () => {
    if (!comment.trim()) return;
    await api.addComment(id, { body: comment });
    setComment('');
  });

  const doDeleteComment = act(cid => api.deleteComment(id, cid));

  const doDeleteRequest = async () => {
    setBusy(true);
    try {
      await api.deleteRequest(id);
      nav(`${prefix}/requests`);
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back */}
      <button onClick={() => nav(-1)} className="text-ink-400 text-xs hover:text-ink-200 flex items-center gap-1">
        ← Back
      </button>

      {/* Header card */}
      <div className="card space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <TypeBadge type={req.type} />
          <PriorityBadge priority={req.priority} />
          <StatusBadge status={req.status} />
          <span className="text-ink-600">·</span>
          <span className="text-xs text-ink-400">{req.team}</span>
        </div>

        <h1 className="font-display font-bold text-xl text-ink-50 leading-snug">{req.title}</h1>
        <p className="text-ink-300 text-sm leading-relaxed whitespace-pre-wrap">{req.description}</p>

        {req.repo_url && (
          <a href={req.repo_url} target="_blank" rel="noreferrer"
             className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline font-mono">
            ↗ {req.repo_url}
          </a>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map(t => <TagChip key={t.id} name={t.name} />)}
          </div>
        )}

        {/* Owner / Assignee */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-ink-700 text-xs text-ink-400">
          <div className="flex items-center gap-2">
            <span className="section-label">Owner</span>
            <Avatar src={req.owner?.avatar_url} name={req.owner?.name} />
            <span>{req.owner?.name}</span>
          </div>
          {req.assignee && (
            <div className="flex items-center gap-2">
              <span className="section-label">Assignee</span>
              <Avatar src={req.assignee?.avatar_url} name={req.assignee?.name} />
              <span>{req.assignee?.name}</span>
            </div>
          )}
          <span className="ml-auto font-mono">{new Date(req.created_at).toLocaleString()}</span>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex flex-wrap gap-2">
        {canClaim && !claimOpen && (
          <button onClick={() => setClaimOpen(true)} className="btn-primary">
            ✋ Claim this request
          </button>
        )}

        {canEdit && (
          <button onClick={() => nav(`${prefix}/requests/${id}/edit`)} className="btn-ghost">
            ✎ Edit
          </button>
        )}

        {nextStatuses.map(s => (
          <button key={s} disabled={busy} onClick={() => doStatus(s)} className="btn-ghost">
            → Mark as {s.replace('_', ' ')}
          </button>
        ))}

        {isOwner && !confirmDelete && (
          <button onClick={() => setConfirmDelete(true)} className="btn-danger ml-auto">
            Delete
          </button>
        )}
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="card border-rose/30 animate-fade-up space-y-3">
          <p className="text-sm font-medium text-ink-100">Are you sure you want to delete this request?</p>
          <p className="text-xs text-ink-400">This action cannot be undone. All progress updates and comments will be deleted.</p>
          <div className="flex gap-2">
            <button onClick={doDeleteRequest} disabled={busy} className="btn-danger">Yes, Delete</button>
            <button onClick={() => setConfirmDelete(false)} className="btn-ghost">Cancel</button>
          </div>
        </div>
      )}

      {/* Claim dialog */}
      {claimOpen && (
        <div className="card border-accent/30 animate-fade-up space-y-3">
          <p className="text-sm font-medium text-ink-100">Claim this request</p>
          <textarea
            className="input h-20 resize-none"
            placeholder="Optional message to the owner…"
            value={claimMsg}
            onChange={e => setClaimMsg(e.target.value)}
          />
          <div className="flex gap-2">
            <button onClick={doClaim} disabled={busy} className="btn-primary">Confirm Claim</button>
            <button onClick={() => setClaimOpen(false)} className="btn-ghost">Cancel</button>
          </div>
        </div>
      )}

      {/* Progress timeline */}
      <div className="card space-y-4">
        <h2 className="section-label">Progress</h2>
        <ProgressTimeline updates={req.progress_updates || []} />

        {canAct && (
          <div className="space-y-2 pt-3 border-t border-ink-700">
            <div className="flex gap-2">
              <input className="input text-xs py-1.5 flex-1" placeholder="Milestone label (optional)" value={milestone} onChange={e => setMilestone(e.target.value)} />
            </div>
            <textarea
              className="input h-16 resize-none text-sm"
              placeholder="Add a progress note…"
              value={progressNote}
              onChange={e => setProgressNote(e.target.value)}
            />
            <button onClick={doProgress} disabled={busy || !progressNote.trim()} className="btn-primary text-xs py-1.5">
              Add Update
            </button>
          </div>
        )}
      </div>

      {/* Comments */}
      <div className="card space-y-4">
        <h2 className="section-label">Comments ({(req.comments || []).length})</h2>

        {(req.comments || []).length === 0 && (
          <p className="text-ink-500 text-sm text-center py-2">No comments yet.</p>
        )}

        <div className="space-y-4">
          {(req.comments || []).sort((a,b) => new Date(a.created_at) - new Date(b.created_at)).map(c => {
            const isMyComment = c.author?.clerk_id === user?.id || c.author?.email === user?.primaryEmailAddress?.emailAddress;
            return (
              <div key={c.id} className="flex gap-3 animate-fade-up">
                <Avatar src={c.author?.avatar_url} name={c.author?.name} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-ink-200">{c.author?.name}</span>
                    <span className="text-xs font-mono text-ink-500">{timeAgo(c.created_at)}</span>
                    {isMyComment && (
                      <button
                        onClick={(e) => { e.stopPropagation(); doDeleteComment(c.id); }}
                        className="text-xs text-ink-500 hover:text-rose ml-auto"
                        title="Delete comment"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-ink-300 leading-relaxed whitespace-pre-wrap">{c.body}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add comment */}
        <div className="space-y-2 pt-3 border-t border-ink-700">
          <textarea
            className="input h-20 resize-none text-sm"
            placeholder="Leave a comment…"
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
          <button onClick={doComment} disabled={busy || !comment.trim()} className="btn-ghost text-xs py-1.5">
            Post Comment
          </button>
        </div>
      </div>
    </div>
  );
}
