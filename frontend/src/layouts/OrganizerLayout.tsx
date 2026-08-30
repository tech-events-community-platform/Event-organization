import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { OrganizerSidebar } from '../components/layout/OrganizerSidebar';
import { Footer } from '../components/layout/Footer';
import { LayoutDashboard, Calendar, PlusCircle, QrCode } from 'lucide-react';

export const OrganizerLayout: React.FC = () => {
  const location = useLocation();

  const isTabActive = (path: string) => {
    if (path === '/organizer') return location.pathname === '/organizer';
    if (path === '/organizer/events') return location.pathname === '/organizer/events';
    if (path === '/organizer/events/create') return location.pathname === '/organizer/events/create';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Mobile Top Sub-bar for Organizers */}
      <div className="md:hidden bg-[#63474D] text-white py-2.5 px-4 border-b border-[#AA767C]/40 overflow-x-auto scrollbar-none flex gap-2">
        <Link
          to="/organizer"
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 ${
            isTabActive('/organizer')
              ? 'bg-[#AA767C] text-white'
              : 'text-[#E8DDD7]'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          Overview
        </Link>
        <Link
          to="/organizer/events"
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 ${
            isTabActive('/organizer/events')
              ? 'bg-[#AA767C] text-white'
              : 'text-[#E8DDD7]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          My Events
        </Link>
        <Link
          to="/organizer/events/create"
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 ${
            isTabActive('/organizer/events/create')
              ? 'bg-[#AA767C] text-white'
              : 'text-[#E8DDD7]'
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Create Event
        </Link>
        <Link
          to="/organizer/events/evt_react_workshop_2026/scanner"
          className="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap bg-[#FFA686] text-[#2D1F23] flex items-center gap-1.5"
        >
          <QrCode className="w-3.5 h-3.5" />
          Door Scanner
        </Link>
      </div>

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <OrganizerSidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto bg-white">
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
};
