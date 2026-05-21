import React from 'react';
import { api } from '../api';
import { useFetch } from '../hooks/useFetch';
import RequestCard from '../components/RequestCard';
import { Spinner, EmptyState } from '../components/Badges';
import { useNavigate, useLocation } from 'react-router-dom';

function RequestList({ fetcher, emptyMsg, title, subtitle, showNew, linkPrefix }) {
  const { data, loading, error } = useFetch(fetcher, []);
  const nav = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display font-bold text-xl text-ink-50">{title}</h1>
          <p className="text-ink-400 text-sm mt-0.5">{subtitle}</p>
        </div>
        {showNew && (
          <button onClick={() => nav(`${linkPrefix}/requests/new`)} className="btn-primary text-xs py-1.5">
            + New Request
          </button>
        )}
      </div>

      {loading ? <Spinner /> : error ? (
        <div className="text-rose text-sm text-center py-8">{error}</div>
      ) : !data?.length ? (
        <EmptyState message={emptyMsg} />
      ) : (
        <div className="grid gap-3">
          {data.map(r => <RequestCard key={r.id} request={r} linkPrefix={linkPrefix} />)}
        </div>
      )}
    </div>
  );
}

export function MyRequests() {
  return (
    <RequestList
      fetcher={api.myRequests}
      title="My Requests"
      subtitle="Requests you've posted"
      emptyMsg="You haven't posted any requests yet."
      showNew
      linkPrefix="/developer"
    />
  );
}

export function MyClaims() {
  return (
    <RequestList
      fetcher={api.myClaims}
      title="My Claims"
      subtitle="Requests you're working on"
      emptyMsg="You haven't claimed any requests yet."
      linkPrefix="/engineer"
    />
  );
}

export default MyRequests;
