import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useFetch } from '../hooks/useFetch';
import { TagChip, Spinner } from '../components/Badges';

export default function EditRequest() {
  const { id } = useParams();
  const nav = useNavigate();
  const { data: request, loading } = useFetch(() => api.getRequest(id), [id]);
  const { data: tags } = useFetch(() => api.getTags(), []);
  const [form, setForm] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [error, setError] = useState('');

  const suggestTags = async () => {
    if (!form?.title?.trim()) { setError('Enter a title first so AI can suggest tags.'); return; }
    setSuggesting(true);
    try {
      const { suggestions } = await api.suggestTags(form.title, form.description);
      if (suggestions?.length && tags) {
        const ids = tags.filter(t => suggestions.includes(t.name)).map(t => t.id);
        setForm(f => ({ ...f, tag_ids: [...new Set([...f.tag_ids, ...ids])] }));
      }
    } catch (e) {
      setError('AI suggestion failed: ' + e.message);
    } finally {
      setSuggesting(false);
    }
  };

  // Populate form when request loads
  useEffect(() => {
    if (!request) return;
    setForm({
      title: request.title,
      description: request.description,
      type: request.type,
      team: request.team,
      priority: request.priority,
      repo_url: request.repo_url || '',
      tag_ids: request.request_tags?.map(rt => rt.tags?.id || rt.tag_id).filter(Boolean) || [],
    });
  }, [request]);

  if (loading || !form) return <Spinner />;

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const toggleTag = id => setForm(f => ({
    ...f,
    tag_ids: f.tag_ids.includes(id) ? f.tag_ids.filter(t => t !== id) : [...f.tag_ids, id],
  }));

  const submit = async e => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.team.trim()) {
      setError('Title, description, and team are required.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await api.editRequest(id, form);
      nav(-1);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-bold text-xl text-ink-50">Edit Request</h1>
        <p className="text-ink-400 text-sm mt-0.5">Update your request details.</p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        {/* Type */}
        <div>
          <label className="section-label block mb-2">Request Type</label>
          <div className="flex gap-2">
            {['code_review', 'mentorship'].map(t => (
              <button
                type="button" key={t}
                onClick={() => setForm(f => ({ ...f, type: t }))}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                  form.type === t
                    ? 'bg-accent text-white border-accent'
                    : 'bg-ink-800 text-ink-300 border-ink-600 hover:border-ink-400'
                }`}
              >
                {t === 'code_review' ? '🔍 Code Review' : '🎓 Mentorship'}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="section-label block mb-1.5">Title *</label>
          <input className="input" value={form.title} onChange={set('title')} />
        </div>

        {/* Description */}
        <div>
          <label className="section-label block mb-1.5">Description *</label>
          <textarea className="input h-28 resize-none" value={form.description} onChange={set('description')} />
        </div>

        {/* Team + Priority */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="section-label block mb-1.5">Team *</label>
            <input className="input" value={form.team} onChange={set('team')} />
          </div>
          <div>
            <label className="section-label block mb-1.5">Priority</label>
            <select className="input" value={form.priority} onChange={set('priority')}>
              {['low', 'medium', 'high', 'urgent'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {/* Repo URL */}
        <div>
          <label className="section-label block mb-1.5">Repo / PR URL</label>
          <input className="input font-mono text-xs" value={form.repo_url} onChange={set('repo_url')} />
        </div>

        {/* Tags */}
        {tags?.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <label className="section-label">Technology Tags</label>
              <button
                type="button"
                onClick={suggestTags}
                disabled={suggesting}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium
                           bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20
                           transition-colors disabled:opacity-50"
              >
                {suggesting ? '⏳ Analyzing…' : '✦ AI Suggest'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map(t => (
                <TagChip key={t.id} name={t.name} active={form.tag_ids.includes(t.id)} onClick={() => toggleTag(t.id)} />
              ))}
            </div>
          </div>
        )}

        {error && <p className="text-rose text-sm">{error}</p>}

        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={submitting} className="btn-primary flex-1">
            {submitting ? 'Saving…' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => nav(-1)} className="btn-ghost">Cancel</button>
        </div>
      </form>
    </div>
  );
}
