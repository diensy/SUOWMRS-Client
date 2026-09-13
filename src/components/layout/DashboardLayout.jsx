import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

export default function DashboardLayout({ userRole = 'Resident', onRoleChange }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [role, setRole] = useState(userRole);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    if (onRoleChange) onRoleChange(newRole);
  };

  return (
    <div className="h-screen dark:bg-[#090E17] bg-[#F8FAFC] text-slate-800 dark:text-slate-100 flex flex-col overflow-hidden transition-colors duration-200">
      {/* Top Navbar — pinned */}
      <Navbar
        onMenuToggle={() => setSidebarOpen(p => !p)}
        userRole={role}
        onRoleChange={handleRoleChange}
      />

      {/* Body: Pinned Sidebar + Scrollable Content */}
      <div className="flex flex-1 w-full min-h-0 overflow-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          userRole={role}
        />

        {/* Main scrollable content area */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto custom-scrollbar">
          <div className="p-4 sm:p-6 lg:p-7 pb-24 sm:pb-8">
            <Outlet context={{ userRole: role }} />
          </div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <BottomNav />
    </div>
  );
}
