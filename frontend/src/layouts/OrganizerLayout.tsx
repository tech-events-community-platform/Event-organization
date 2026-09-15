import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { OrganizerSidebar } from '../components/layout/OrganizerSidebar';
import { Footer } from '../components/layout/Footer';
import { LayoutDashboard, PlusCircle, QrCode, Award, BarChart3, Settings } from 'lucide-react';

export const OrganizerLayout: React.FC = () => {
  const location = useLocation();

  const isTabActive = (path: string) => {
    if (path === '/organizer') return location.pathname === '/organizer';
    if (path === '/organizer/events/create') return location.pathname === '/organizer/events/create';
    if (path === '/organizer/check-in') {
      return location.pathname.startsWith('/organizer/check-in') || location.pathname.includes('/scanner');
    }
    if (path === '/organizer/badges') {
      return location.pathname.startsWith('/organizer/badges') || location.pathname.includes('/attendees');
    }
    if (path === '/organizer/reports') {
      return location.pathname.startsWith('/organizer/reports') || location.pathname.includes('/report');
    }
    if (path === '/organizer/settings') {
      return location.pathname.startsWith('/organizer/settings');
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Mobile Top Sub-bar for Organizers (Section 1: 6 tabs) */}
      <div className="md:hidden bg-[#63474D] text-white py-2 px-3 border-b border-[#AA767C]/40 overflow-x-auto scrollbar-none flex gap-1.5">
        <Link
          to="/organizer"
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1 ${
            isTabActive('/organizer') ? 'bg-[#AA767C] text-white' : 'text-[#E8DDD7]'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          Dashboard
        </Link>
        <Link
          to="/organizer/events/create"
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1 ${
            isTabActive('/organizer/events/create') ? 'bg-[#AA767C] text-white' : 'text-[#E8DDD7]'
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Create Event
        </Link>
        <Link
          to="/organizer/check-in"
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1 ${
            isTabActive('/organizer/check-in') ? 'bg-[#AA767C] text-white' : 'text-[#E8DDD7]'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          Check-in
        </Link>
        <Link
          to="/organizer/badges"
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1 ${
            isTabActive('/organizer/badges') ? 'bg-[#AA767C] text-white' : 'text-[#E8DDD7]'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          Badges
        </Link>
        <Link
          to="/organizer/reports"
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1 ${
            isTabActive('/organizer/reports') ? 'bg-[#AA767C] text-white' : 'text-[#E8DDD7]'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          Reports
        </Link>
        <Link
          to="/organizer/settings"
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1 ${
            isTabActive('/organizer/settings') ? 'bg-[#AA767C] text-white' : 'text-[#E8DDD7]'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          Settings
        </Link>
      </div>

      <div className="flex-1 flex w-full items-start">
        <OrganizerSidebar />
        <div className="flex-1 min-w-0 flex flex-col min-h-[calc(100vh-4rem)]">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};
