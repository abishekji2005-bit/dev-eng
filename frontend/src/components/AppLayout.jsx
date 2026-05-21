import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';
import Sidebar from './Sidebar';
import AiChat from './AiChat';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar onMenuToggle={() => setSidebarOpen(o => !o)} />
      <div className="flex flex-1">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 lg:ml-56 max-w-5xl w-full mx-auto px-4 py-6 sm:px-6">
          <Outlet />
        </main>
      </div>
      <AiChat />
    </div>
  );
}
