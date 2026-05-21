import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusBadge, PriorityBadge, TypeBadge, TagChip, Avatar } from './Badges';

const PRIORITY_BORDER = { urgent: 'border-l-rose', high: 'border-l-amber', medium: 'border-l-sky', low: 'border-l-ink-600' };

export default function RequestCard({ request, onTagClick, linkPrefix = '' }) {
  const nav = useNavigate();
  const tags = request.request_tags?.map(rt => rt.tags).filter(Boolean) || [];
  const link = `${linkPrefix}/requests/${request.id}`;

  return (
    <div
      onClick={() => nav(link)}
      className={`card cursor-pointer hover:border-ink-500 hover:bg-ink-700/60 border-l-2 animate-fade-up
                  ${PRIORITY_BORDER[request.priority] || 'border-l-ink-600'}`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <TypeBadge type={request.type} />
          <PriorityBadge priority={request.priority} />
        </div>
        <StatusBadge status={request.status} />
      </div>

      {/* Title */}
      <h3 className="font-display font-semibold text-ink-50 text-sm leading-snug mb-1 line-clamp-2">
        {request.title}
      </h3>
      <p className="text-ink-400 text-xs line-clamp-2 mb-3">{request.description}</p>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3" onClick={e => e.stopPropagation()}>
          {tags.map(t => (
            <TagChip key={t.id} name={t.name} onClick={() => onTagClick?.(t.name)} />
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-ink-500 text-xs mt-auto pt-2 border-t border-ink-700">
        <div className="flex items-center gap-2">
          <Avatar src={request.owner?.avatar_url} name={request.owner?.name} />
          <span>{request.owner?.name}</span>
          <span className="text-ink-700">·</span>
          <span>{request.team}</span>
        </div>
        <span className="font-mono">{new Date(request.created_at).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
