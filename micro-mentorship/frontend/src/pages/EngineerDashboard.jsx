import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useFetch } from '../hooks/useFetch';
import { useProfile } from '../context/ProfileContext';
import RequestCard from '../components/RequestCard';
import { Spinner, EmptyState, TagChip } from '../components/Badges';

function StatCard({ label, value, color = 'text-ink-50' }) {
  return (
    <div className="card">
      <p className="section-label">{label}</p>
      <p className={`font-display font-bold text-2xl mt-1 ${color}`}>{value}</p>
    </div>
  );
}

export default function EngineerDashboard() {
  const { profile } = useProfile();
  const { data: claimed, loading: clLoad } = useFetch(() => api.myClaims(), []);
  const { data: tags } = useFetch(() => api.getTags(), []);
  const [tagFilter, setTagFilter] = useState('');
  const { data: openRequests, loading: oLoad } = useFetch(
    () => api.listRequests({ status: 'open', tag: tagFilter }),
    [tagFilter]
  );

  if (clLoad && oLoad) return <Spinner />;

  const claimedItems = claimed || [];
  const openItems = openRequests || [];
  const active = claimedItems.filter(r => ['claimed', 'in_progress'].includes(r.status)).length;
  const done = claimedItems.filter(r => r.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-xl text-ink-50">
          Welcome back, {profile?.name?.split(' ')[0] || 'Engineer'}
        </h1>
        <p className="text-ink-400 text-sm mt-0.5">Find requests to help with</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Available" value={openItems.length} color="text-emerald" />
        <StatCard label="My Active" value={active} color="text-amber" />
        <StatCard label="Completed" value={done} color="text-sky" />
      </div>

      {/* Active tasks */}
      {active > 0 && (
        <div>
          <h2 className="section-label mb-3">My Active Tasks</h2>
          <div className="grid gap-3">
            {claimedItems
              .filter(r => ['claimed', 'in_progress'].includes(r.status))
              .slice(0, 3)
              .map(r => <RequestCard key={r.id} request={r} linkPrefix="/engineer" />)}
          </div>
        </div>
      )}

      {/* Open requests with tag filter */}
      <div>
        <h2 className="section-label mb-3">Open Requests</h2>
        {tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tags.map(t => (
              <TagChip
                key={t.id}
                name={t.name}
                active={tagFilter === t.name}
                onClick={() => setTagFilter(tagFilter === t.name ? '' : t.name)}
              />
            ))}
          </div>
        )}
        {oLoad ? <Spinner /> : openItems.length === 0 ? (
          <EmptyState message="No open requests right now." />
        ) : (
          <div className="grid gap-3">
            {openItems.slice(0, 8).map(r => (
              <RequestCard key={r.id} request={r} linkPrefix="/engineer" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
