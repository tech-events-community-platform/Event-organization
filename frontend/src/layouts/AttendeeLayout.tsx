import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { AttendeeSidebar } from '../components/layout/AttendeeSidebar';
import { Footer } from '../components/layout/Footer';
import {
  Ticket,
  Award,
  Compass,
  LayoutDashboard,
  User,
  Clock,
} from 'lucide-react';

export const AttendeeLayout: React.FC = () => {
  const location = useLocation();

  const isTabActive = (path: string) => {
    if (path === '/app') return location.pathname === '/app';
    if (path === '/app/events') return location.pathname === '/app/events' || location.pathname.startsWith('/app/ticket');
    if (path === '/app/profile') return location.pathname === '/app/profile';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Mobile Top Sub-bar for Attendees (Visible on Small Screens) */}
      <div className="md:hidden bg-[#63474D] text-white py-2 px-3 border-b border-[#AA767C]/40 overflow-x-auto scrollbar-none flex gap-1.5 shrink-0 text-xs">
        <Link
          to="/app"
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 ${
            isTabActive('/app') && location.pathname === '/app'
              ? 'bg-[#AA767C] text-white'
              : 'text-[#E8DDD7]'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </Link>
        <Link
          to="/app/events"
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 ${
            isTabActive('/app/events')
              ? 'bg-[#AA767C] text-white'
              : 'text-[#E8DDD7]'
          }`}
        >
          <Ticket className="w-3.5 h-3.5" />
          <span>Tickets & Passes</span>
        </Link>
        <Link
          to="/app/record"
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 ${
            isTabActive('/app/record')
              ? 'bg-[#AA767C] text-white'
              : 'text-[#E8DDD7]'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>My Badges</span>
        </Link>
        <Link
          to="/app/explore"
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 ${
            isTabActive('/app/explore')
              ? 'bg-[#AA767C] text-white'
              : 'text-[#E8DDD7]'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Explore</span>
        </Link>
        <Link
          to="/app/profile"
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 ${
            isTabActive('/app/profile') && location.pathname !== '/app/profile/attendance'
              ? 'bg-[#AA767C] text-white'
              : 'text-[#E8DDD7]'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Profile</span>
        </Link>
      </div>

      {/* Main Layout Area with Attendee Sidebar */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <AttendeeSidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto bg-white">
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
};
