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
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8F5]">
      <Navbar />

      {/* Mobile Top Sub-bar for Organizers */}
      <div className="md:hidden bg-[#064638] text-white py-2.5 px-4 border-b border-[#0B5D4B] overflow-x-auto scrollbar-none flex gap-2">
        <Link
          to="/organizer"
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 ${
            isTabActive('/organizer') && location.pathname === '/organizer'
              ? 'bg-[#0B5D4B] text-[#D6A84F]'
              : 'text-gray-300'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          Overview
        </Link>
        <Link
          to="/organizer/events"
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 ${
            isTabActive('/organizer/events') && !location.pathname.includes('create')
              ? 'bg-[#0B5D4B] text-[#D6A84F]'
              : 'text-gray-300'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          Events
        </Link>
        <Link
          to="/organizer/events/create"
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 ${
            location.pathname.includes('create')
              ? 'bg-[#0B5D4B] text-[#D6A84F]'
              : 'text-gray-300'
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Create Event
        </Link>
        <Link
          to="/organizer/events/evt_react_workshop_2026/scanner"
          className="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap bg-[#D6A84F] text-[#17211E] flex items-center gap-1.5"
        >
          <QrCode className="w-3.5 h-3.5" />
          QR Scanner
        </Link>
      </div>

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <OrganizerSidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
};
