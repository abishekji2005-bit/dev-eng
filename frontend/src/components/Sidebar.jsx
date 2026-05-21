import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';

const DEV_LINKS = [
  { to: '/developer/dashboard', icon: '◈', label: 'Dashboard' },
  { to: '/developer/requests/new', icon: '+', label: 'New Request' },
  { to: '/developer/requests', icon: '☰', label: 'My Requests' },
];
const ENG_LINKS = [
  { to: '/engineer/dashboard', icon: '◈', label: 'Dashboard' },
  { to: '/engineer/browse', icon: '⌕', label: 'Browse' },
  { to: '/engineer/claimed', icon: '✓', label: 'My Claims' },
];

function SideLink({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
          isActive
            ? 'bg-accent/10 text-accent font-medium'
            : 'text-ink-400 hover:text-ink-100 hover:bg-ink-700/50'
        }`
      }
    >
      <span className="w-5 text-center text-xs opacity-70">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}

export default function Sidebar({ open, onClose }) {
  const { profile } = useProfile();
  const nav = useNavigate();
  const links = profile?.role === 'developer' ? DEV_LINKS : ENG_LINKS;
  const prefix = profile?.role === 'developer' ? '/developer' : '/engineer';

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed top-14 left-0 bottom-0 w-56 bg-ink-900 border-r border-ink-700 z-50
          flex flex-col transition-transform duration-200
          lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Role badge */}
        <div className="px-4 pt-5 pb-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
            profile?.role === 'developer'
              ? 'bg-emerald/10 text-emerald border border-emerald/20'
              : 'bg-accent/10 text-accent border border-accent/20'
          }`}>
            {profile?.role === 'developer' ? '🛠 Developer' : '⚡ Engineer'}
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 space-y-1">
          {links.map(l => <SideLink key={l.to} {...l} />)}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-4 space-y-1 border-t border-ink-700 pt-3">
          <SideLink to={`${prefix}/profile`} icon="⚙" label="Settings" />
        </div>
      </aside>
    </>
  );
}
