import React from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useFetch } from '../hooks/useFetch';
import { useProfile } from '../context/ProfileContext';
import RequestCard from '../components/RequestCard';
import { Spinner, EmptyState } from '../components/Badges';

function StatCard({ label, value, color = 'text-ink-50' }) {
  return (
    <div className="card">
      <p className="section-label">{label}</p>
      <p className={`font-display font-bold text-2xl mt-1 ${color}`}>{value}</p>
    </div>
  );
}

export default function DeveloperDashboard() {
  const { profile } = useProfile();
  const { data: requests, loading } = useFetch(() => api.myRequests(), []);

  if (loading) return <Spinner />;

  const items = requests || [];
  const open = items.filter(r => r.status === 'open').length;
  const active = items.filter(r => ['claimed', 'in_progress'].includes(r.status)).length;
  const completed = items.filter(r => r.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display font-bold text-xl text-ink-50">
            Welcome back, {profile?.name?.split(' ')[0] || 'Developer'}
          </h1>
          <p className="text-ink-400 text-sm mt-0.5">Your mentorship & code review requests</p>
        </div>
        <Link to="/developer/requests/new" className="btn-primary text-xs py-1.5">+ New Request</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total" value={items.length} />
        <StatCard label="Open" value={open} color="text-emerald" />
        <StatCard label="Active" value={active} color="text-amber" />
        <StatCard label="Completed" value={completed} color="text-sky" />
      </div>

      {/* Active collaborations */}
      <div>
        <h2 className="section-label mb-3">Active Collaborations</h2>
        {items.filter(r => ['claimed', 'in_progress'].includes(r.status)).length === 0 ? (
          <EmptyState message="No active collaborations yet." />
        ) : (
          <div className="grid gap-3">
            {items
              .filter(r => ['claimed', 'in_progress'].includes(r.status))
              .slice(0, 5)
              .map(r => <RequestCard key={r.id} request={r} linkPrefix="/developer" />)}
          </div>
        )}
      </div>

      {/* Recent requests */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-label">Recent Requests</h2>
          <Link to="/developer/requests" className="text-xs text-accent hover:underline">View all →</Link>
        </div>
        {items.length === 0 ? (
          <EmptyState message="No requests yet. Create your first one!" />
        ) : (
          <div className="grid gap-3">
            {items.slice(0, 5).map(r => <RequestCard key={r.id} request={r} linkPrefix="/developer" />)}
          </div>
        )}
      </div>
    </div>
  );
}
