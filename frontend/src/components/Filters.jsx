import React, { useState } from 'react';
import { TagChip } from './Badges';
import { api } from '../api';

const TYPES     = ['', 'mentorship', 'code_review'];
const STATUSES  = ['', 'open', 'claimed', 'in_progress', 'completed'];
const PRIORITIES= ['', 'urgent', 'high', 'medium', 'low'];

function Select({ value, onChange, options, label }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="input py-1.5 text-xs w-auto min-w-[110px]"
    >
      {options.map(o => (
        <option key={o} value={o}>{o ? o.replace('_', ' ') : label}</option>
      ))}
    </select>
  );
}

export default function Filters({ filters, onChange, tags = [], search, onSearch }) {
  const set = k => v => onChange({ ...filters, [k]: v });

  const [loadingAi, setLoadingAi] = useState(false);
  const [aiTags, setAiTags] = useState([]);
  const [aiError, setAiError] = useState('');

  const searchAiTags = async () => {
    if (!search.trim()) {
      setAiError('Type search query first (e.g. "postgres query leak").');
      return;
    }
    setLoadingAi(true);
    setAiError('');
    try {
      const { tags: matched } = await api.searchTags(search);
      setAiTags(matched || []);
      if (!matched || matched.length === 0) {
        setAiError('No matching technology tags found.');
      }
    } catch (err) {
      setAiError('Failed to search tags: ' + err.message);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Search + dropdowns */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex flex-1 min-w-[200px] gap-2">
          <input
            className="input py-1.5 text-xs flex-1"
            placeholder="Search requests…"
            value={search}
            onChange={e => onSearch(e.target.value)}
          />
          <button
            type="button"
            onClick={searchAiTags}
            disabled={loadingAi}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                       bg-accent/15 text-accent hover:bg-accent/25 transition-colors disabled:opacity-50 border border-accent/20 cursor-pointer shrink-0"
          >
            {loadingAi ? '⏳ Analyzing…' : '✦ AI Tags'}
          </button>
        </div>
        <Select value={filters.type}     onChange={set('type')}     options={TYPES}     label="All Types" />
        <Select value={filters.status}   onChange={set('status')}   options={STATUSES}  label="All Status" />
        <Select value={filters.priority} onChange={set('priority')} options={PRIORITIES} label="Any Priority" />
      </div>

      {/* AI tag search results */}
      {(aiTags.length > 0 || aiError) && (
        <div className="p-2.5 rounded-lg bg-ink-700/50 border border-ink-600 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-ink-400 font-medium">AI Match:</span>
          {aiError && <span className="text-rose font-medium">{aiError}</span>}
          {aiTags.map(t => {
            const isApplied = filters.tag === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => set('tag')(isApplied ? '' : t)}
                className={`px-2 py-0.5 rounded text-xs transition-all cursor-pointer border ${
                  isApplied
                    ? 'bg-accent text-white border-accent'
                    : 'bg-accent/5 text-accent border-accent/20 hover:bg-accent/15'
                }`}
              >
                {t} {isApplied ? '✓' : '+'}
              </button>
            );
          })}
          {aiTags.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setAiTags([]);
                setAiError('');
              }}
              className="ml-auto text-ink-500 hover:text-ink-300 font-medium"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Tag filter chips */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map(t => (
            <TagChip
              key={t.id}
              name={t.name}
              active={filters.tag === t.name}
              onClick={() => set('tag')(filters.tag === t.name ? '' : t.name)}
            />
          ))}
        </div>
      )}

      {/* Active filter summary */}
      {Object.values({ ...filters, search }).some(Boolean) && (
        <button
          onClick={() => { onChange({ type: '', status: '', priority: '', tag: '' }); onSearch(''); setAiTags([]); setAiError(''); }}
          className="text-xs text-accent hover:underline"
        >
          × Clear all filters
        </button>
      )}
    </div>
  );
}
