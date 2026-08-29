import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Home, Calendar, QrCode, User, ShieldCheck, Compass } from 'lucide-react';

export const AttendeeLayout: React.FC = () => {
  const location = useLocation();

  const isTabActive = (path: string) => {
    if (path === '/app') return location.pathname === '/app';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8F5]">
      <Navbar />

      {/* Mobile-first top subnav bar */}
      <div className="bg-white border-b border-gray-200/80 sticky top-16 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-6 overflow-x-auto scrollbar-none py-2 text-xs font-semibold">
            <Link
              to="/app"
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg transition-colors whitespace-nowrap ${
                isTabActive('/app') && location.pathname === '/app'
                  ? 'bg-[#63474D] text-white'
                  : 'text-[#66736E] hover:text-[#17211E] hover:bg-gray-100'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Attendee Hub</span>
            </Link>
            <Link
              to="/search"
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg transition-colors whitespace-nowrap ${
                isTabActive('/search')
                  ? 'bg-[#63474D] text-white'
                  : 'text-[#66736E] hover:text-[#17211E] hover:bg-gray-100'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Events</span>
            </Link>
            <Link
              to="/app/events"
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg transition-colors whitespace-nowrap ${
                isTabActive('/app/events')
                  ? 'bg-[#63474D] text-white'
                  : 'text-[#66736E] hover:text-[#17211E] hover:bg-gray-100'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>My Events</span>
            </Link>
            <Link
              to="/app/ticket/evt_react_workshop_2026"
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg transition-colors whitespace-nowrap ${
                isTabActive('/app/ticket')
                  ? 'bg-[#63474D] text-white'
                  : 'text-[#66736E] hover:text-[#17211E] hover:bg-gray-100'
              }`}
            >
              <QrCode className="w-3.5 h-3.5 text-[#FFA686]" />
              <span>QR Ticket Pass</span>
            </Link>
            <Link
              to="/app/profile"
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg transition-colors whitespace-nowrap ${
                isTabActive('/app/profile') && location.pathname !== '/app/profile/attendance'
                  ? 'bg-[#63474D] text-white'
                  : 'text-[#66736E] hover:text-[#17211E] hover:bg-gray-100'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Profile</span>
            </Link>
            <Link
              to="/app/profile/attendance"
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg transition-colors whitespace-nowrap ${
                isTabActive('/app/profile/attendance')
                  ? 'bg-[#63474D] text-white'
                  : 'text-[#66736E] hover:text-[#17211E] hover:bg-gray-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#FFA686]" />
              <span>Verified Attendance</span>
            </Link>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};
