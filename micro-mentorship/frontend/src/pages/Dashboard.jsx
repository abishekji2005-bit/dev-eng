import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useFetch } from '../hooks/useFetch';
import RequestCard from '../components/RequestCard';
import Filters from '../components/Filters';
import { Spinner, EmptyState } from '../components/Badges';

const EMPTY_FILTERS = { type: '', status: '', priority: '', tag: '' };

export default function Dashboard() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebounced] = useState('');

  const { data: tags } = useFetch(() => api.getTags(), []);
  const { data: requests, loading, error, refetch } = useFetch(
    () => api.listRequests({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch]
  );

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const counts = (requests || []).reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display font-bold text-xl text-ink-50">Browse Requests</h1>
          <p className="text-ink-400 text-sm mt-0.5">
            {requests?.length ?? '—'} requests
            {counts.open ? ` · ${counts.open} open` : ''}
            {counts.in_progress ? ` · ${counts.in_progress} in progress` : ''}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <Filters
          filters={filters}
          onChange={setFilters}
          tags={tags || []}
          search={search}
          onSearch={setSearch}
        />
      </div>

      {/* List */}
      {loading ? <Spinner /> : error ? (
        <div className="text-rose text-sm text-center py-8">{error}</div>
      ) : !requests?.length ? (
        <EmptyState message="No requests match your filters." />
      ) : (
        <div className="grid gap-3">
          {requests.map(r => (
            <RequestCard key={r.id} request={r} onTagClick={tag => setFilters(f => ({ ...f, tag }))} />
          ))}
        </div>
      )}
    </div>
  );
}
