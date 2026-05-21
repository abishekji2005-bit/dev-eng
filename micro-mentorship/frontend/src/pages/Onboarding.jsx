import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { api } from '../api';

const ROLES = [
  { value: 'developer', icon: '🛠', label: 'Developer', desc: 'Post mentorship & code review requests' },
  { value: 'engineer',  icon: '⚡', label: 'Engineer',  desc: 'Browse, claim & help with requests' },
];

export default function Onboarding() {
  const { profile, refetch } = useProfile();
  const nav = useNavigate();
  const [role, setRole] = useState('');
  const [team, setTeam] = useState(profile?.team || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async e => {
    e.preventDefault();
    if (!role || !team.trim()) { setError('Please select a role and enter your team.'); return; }
    setSaving(true);
    setError('');
    try {
      await api.updateProfile({ role, team: team.trim() });
      await refetch();
      nav(`/${role}/dashboard`);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">M</div>
          <h1 className="font-display font-bold text-2xl text-ink-50">Welcome aboard</h1>
          <p className="text-ink-400 text-sm mt-1">Let's set up your profile to get started.</p>
        </div>

        <form onSubmit={submit} className="space-y-5">
          {/* Role selection */}
          <div>
            <label className="section-label block mb-3">Choose your role</label>
            <div className="grid grid-cols-2 gap-3">
              {ROLES.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`card text-left transition-all ${
                    role === r.value
                      ? 'border-accent bg-accent/5'
                      : 'hover:border-ink-500'
                  }`}
                >
                  <span className="text-2xl">{r.icon}</span>
                  <p className="font-display font-semibold text-ink-50 text-sm mt-2">{r.label}</p>
                  <p className="text-ink-400 text-xs mt-1">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Team */}
          <div>
            <label className="section-label block mb-1.5">Team / Department</label>
            <input
              className="input"
              placeholder="e.g. Platform, Growth, Data"
              value={team}
              onChange={e => setTeam(e.target.value)}
            />
          </div>

          {error && <p className="text-rose text-sm">{error}</p>}

          <button type="submit" disabled={saving} className="btn-primary w-full justify-center">
            {saving ? 'Saving…' : 'Get Started →'}
          </button>
        </form>
      </div>
    </div>
  );
}
