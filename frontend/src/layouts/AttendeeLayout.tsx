import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { AttendeeDrawer } from '../components/attendee/AttendeeDrawer';
import { LayoutDashboard, Ticket, Clock, Menu } from 'lucide-react';

export const AttendeeLayout: React.FC = () => {
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const isTabActive = (path: string) => {
    if (path === '/app') return location.pathname === '/app';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar onOpenAttendeeDrawer={() => setIsDrawerOpen(true)} />

      {/* Clean 3-Tab Formal Attendee Subnav */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex space-x-6 sm:space-x-8 overflow-x-auto scrollbar-none py-3 text-sm font-medium">
              <Link
                to="/app"
                className={`flex items-center gap-2 pb-2 -mb-3 border-b-2 transition-all whitespace-nowrap ${
                  isTabActive('/app') && location.pathname === '/app'
                    ? 'border-sheeba-purple text-sheeba-dark font-bold'
                    : 'border-transparent text-gray-500 hover:text-sheeba-dark'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/app/events"
                className={`flex items-center gap-2 pb-2 -mb-3 border-b-2 transition-all whitespace-nowrap ${
                  isTabActive('/app/events') || isTabActive('/app/ticket')
                    ? 'border-sheeba-purple text-sheeba-dark font-bold'
                    : 'border-transparent text-gray-500 hover:text-sheeba-dark'
                }`}
              >
                <Ticket className="w-4 h-4" />
                <span>Tickets</span>
              </Link>

              <Link
                to="/app/profile/attendance"
                className={`flex items-center gap-2 pb-2 -mb-3 border-b-2 transition-all whitespace-nowrap ${
                  isTabActive('/app/profile/attendance')
                    ? 'border-sheeba-purple text-sheeba-dark font-bold'
                    : 'border-transparent text-gray-500 hover:text-sheeba-dark'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Attendance Timeline</span>
              </Link>
            </div>

            {/* Quick Drawer Opener Button on Subnav right */}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:text-sheeba-dark hover:bg-gray-50 border border-gray-200/80 transition-colors cursor-pointer"
            >
              <Menu className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Account & Tools</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white">
        <Outlet />
      </main>

      {/* Sliding Sidebar Drawer */}
      <AttendeeDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      <Footer />
    </div>
  );
};
