import React from 'react';

const STATUS_STYLE = {
  open:        'bg-emerald/10 text-emerald border border-emerald/20',
  claimed:     'bg-sky/10 text-sky border border-sky/20',
  in_progress: 'bg-amber/10 text-amber border border-amber/20',
  completed:   'bg-ink-600/40 text-ink-400 border border-ink-600',
  cancelled:   'bg-rose/10 text-rose border border-rose/20',
};

const STATUS_DOT = {
  open: 'bg-emerald', claimed: 'bg-sky', in_progress: 'bg-amber',
  completed: 'bg-ink-500', cancelled: 'bg-rose',
};

export function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${STATUS_STYLE[status] || ''}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status] || 'bg-ink-400'}`} />
      {status.replace('_', ' ')}
    </span>
  );
}

const PRIORITY_STYLE = {
  urgent: 'text-rose',
  high:   'text-amber',
  medium: 'text-sky',
  low:    'text-ink-400',
};

export function PriorityBadge({ priority }) {
  return (
    <span className={`text-xs font-mono uppercase tracking-wider ${PRIORITY_STYLE[priority] || ''}`}>
      {priority}
    </span>
  );
}

export function TypeBadge({ type }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-medium ${
      type === 'code_review'
        ? 'bg-accent/10 text-accent border border-accent/20'
        : 'bg-emerald/10 text-emerald border border-emerald/20'
    }`}>
      {type === 'code_review' ? 'Code Review' : 'Mentorship'}
    </span>
  );
}

export function TagChip({ name, onClick, active }) {
  return (
    <button
      onClick={onClick}
      className={`tag-chip cursor-pointer transition-all ${
        active ? 'bg-accent text-white border-accent' : 'hover:bg-accent/20'
      }`}
    >
      {name}
    </button>
  );
}

export function Avatar({ src, name, size = 'sm' }) {
  const sz = size === 'sm' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm';
  if (src) return <img src={src} alt={name} className={`${sz} rounded-full object-cover`} />;
  return (
    <div className={`${sz} rounded-full bg-accent/20 text-accent flex items-center justify-center font-medium`}>
      {(name || '?')[0].toUpperCase()}
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
    </div>
  );
}

export function EmptyState({ message = 'Nothing here yet.' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-ink-500 text-sm gap-2">
      <span className="text-2xl">·</span>
      <span>{message}</span>
    </div>
  );
}
