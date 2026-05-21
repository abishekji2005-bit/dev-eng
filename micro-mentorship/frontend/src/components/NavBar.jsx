import React from 'react';
import { Link } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import { useProfile } from '../context/ProfileContext';

export default function NavBar({ onMenuToggle }) {
  const { profile } = useProfile();

  return (
    <header className="border-b border-ink-700 bg-ink-900/80 backdrop-blur sticky top-0 z-50">
      <div className="px-4 h-14 flex items-center justify-between">
        {/* Left: hamburger + brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="lg:hidden text-ink-400 hover:text-ink-100 p-1"
            aria-label="Toggle menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 5h14M3 10h14M3 15h14" />
            </svg>
          </button>
          <Link to="/" className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-accent flex items-center justify-center text-white text-xs font-bold">M</span>
            <span className="font-display font-semibold text-sm text-ink-100 hidden sm:block">Mentorship<span className="text-accent">.</span></span>
          </Link>
        </div>

        {/* Right: profile info + user button */}
        <div className="flex items-center gap-3">
          {profile?.team && (
            <span className="text-xs text-ink-400 hidden sm:block">{profile.team}</span>
          )}
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
}
