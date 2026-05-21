import React from 'react';
import { Avatar } from './Badges';
import { timeAgo } from '../utils/time';


export default function ProgressTimeline({ updates = [] }) {
  if (updates.length === 0) {
    return <p className="text-ink-500 text-sm py-4 text-center">No progress updates yet.</p>;
  }

  return (
    <ol className="relative border-l border-ink-700 space-y-5 pl-5">
      {updates.map((u, i) => (
        <li key={u.id} className="relative animate-fade-up">
          {/* Dot */}
          <span className={`absolute -left-[19px] top-1 w-3 h-3 rounded-full border-2 border-ink-900 ${
            i === 0 ? 'bg-accent' : 'bg-ink-600'
          }`} />

          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <Avatar src={u.author?.avatar_url} name={u.author?.name} />
              <span className="text-xs text-ink-400">{u.author?.name}</span>
              {u.milestone && (
                <span className="text-xs bg-accent/10 text-accent border border-accent/20 px-2 py-0.5 rounded font-medium">
                  {u.milestone}
                </span>
              )}
            </div>
            <span className="text-xs font-mono text-ink-500 shrink-0">{timeAgo(u.created_at)}</span>
          </div>
          <p className="text-sm text-ink-200 mt-1.5 leading-relaxed">{u.note}</p>
        </li>
      ))}
    </ol>
  );
}
