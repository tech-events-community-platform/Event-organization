import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Handshake, Compass, Calendar, Settings } from 'lucide-react';

export const SponsorLayout: React.FC = () => {
  const location = useLocation();

  const isTabActive = (path: string) => {
    if (path === '/sponsor') return location.pathname === '/sponsor';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Sponsor Top Subnav */}
      <div className="bg-[#153E2A] text-white py-2.5 px-4 sm:px-6 lg:px-8 border-b border-[#8BA448]/30 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2 shrink-0">
            <span className="p-1.5 rounded-xl bg-[#F9FF46]/20 text-[#F9FF46]">
              <Handshake className="w-4 h-4" />
            </span>
            <span className="font-serif font-bold text-sm text-white">Sponsor Portal</span>
          </div>

          <div className="flex items-center gap-2 text-xs shrink-0 whitespace-nowrap">
            <Link
              to="/sponsor"
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                isTabActive('/sponsor')
                  ? 'bg-[#F9FF46] text-[#153E2A] shadow-xs'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Discover Events to Sponsor</span>
            </Link>

            <Link
              to="/search"
              className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
                location.pathname === '/search'
                  ? 'bg-[#F9FF46] text-[#153E2A] shadow-xs'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>All Tech Events</span>
            </Link>

            <Link
              to="/app/settings"
              className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
                location.pathname === '/app/settings'
                  ? 'bg-[#F9FF46] text-[#153E2A] shadow-xs'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Account Settings</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 min-w-0">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};
