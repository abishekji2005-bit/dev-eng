import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useProfile } from '../context/ProfileContext';

export default function ProfileSettings() {
  const { profile, refetch } = useProfile();
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: profile?.name || '',
    team: profile?.team || '',
    role: profile?.role || 'engineer',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (!form.name.trim() || !form.team.trim()) { setMsg('Name and team are required.'); return; }
    setSaving(true);
    setMsg('');
    try {
      await api.updateProfile(form);
      await refetch();
      setMsg('Profile updated.');
    } catch (e) {
      setMsg(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="font-display font-bold text-xl text-ink-50">Profile Settings</h1>
        <p className="text-ink-400 text-sm mt-0.5">Manage your account details</p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        {/* Email (read-only) */}
        <div>
          <label className="section-label block mb-1.5">Email</label>
          <input className="input opacity-60" value={profile?.email || ''} disabled />
        </div>

        {/* Name */}
        <div>
          <label className="section-label block mb-1.5">Display Name</label>
          <input className="input" value={form.name} onChange={set('name')} />
        </div>

        {/* Team */}
        <div>
          <label className="section-label block mb-1.5">Team / Department</label>
          <input className="input" placeholder="e.g. Platform" value={form.team} onChange={set('team')} />
        </div>

        {/* Role */}
        <div>
          <label className="section-label block mb-1.5">Role</label>
          <select className="input" value={form.role} onChange={set('role')}>
            <option value="developer">Developer</option>
            <option value="engineer">Engineer</option>
          </select>
          <p className="text-xs text-ink-500 mt-1">Changing your role will update your dashboard and navigation.</p>
        </div>

        {msg && (
          <p className={`text-sm ${msg.includes('updated') ? 'text-emerald' : 'text-rose'}`}>{msg}</p>
        )}

        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => nav(-1)} className="btn-ghost">Cancel</button>
        </div>
      </form>
    </div>
  );
}
