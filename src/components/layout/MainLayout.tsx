import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { DemoNoticeBanner } from '../common/DemoBadge';

export const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-poppins text-slate-800">
      {/* Top Demo Simulation Banner */}
      <DemoNoticeBanner />

      <div className="flex-1 flex">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
          <Topbar onToggleSidebar={() => setSidebarOpen(prev => !prev)} />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>

          {/* Footer note */}
          <footer className="py-4 px-6 border-t border-slate-200 text-center text-xs text-slate-400 bg-white">
            <p>
              <strong>DEMO ENVIRONMENT — NO REAL CUSTOMER DATA — NO REAL CALLS</strong> • © 2026 XPOOL Technology. All telephony streams, transcripts, and KPIs are locally simulated for frontend evaluation.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

