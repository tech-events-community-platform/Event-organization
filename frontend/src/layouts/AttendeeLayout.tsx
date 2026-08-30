import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { AttendeeDrawer } from '../components/attendee/AttendeeDrawer';
import { LayoutDashboard, Award, Ticket, Clock, Menu } from 'lucide-react';

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

      {/* Subnav with Unboxed Tools on Left, Centered 4-Tab Navigation */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2.5">
            {/* Left: Tools Button - Unboxed with Hamburger Menu Icon */}
            <div className="w-24 sm:w-32 flex justify-start">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="inline-flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-sheeba-purple transition-colors cursor-pointer py-1 px-0.5 group"
                title="Open Tools"
              >
                <Menu className="w-4 h-4 text-gray-600 group-hover:text-sheeba-purple transition-colors" />
                <span>Tools</span>
              </button>
            </div>

            {/* Middle: Centered Navigation Tabs */}
            <div className="flex-1 flex justify-center space-x-6 sm:space-x-10 overflow-x-auto scrollbar-none py-1 text-sm font-medium">
              <Link
                to="/app"
                className={`flex items-center gap-2 pb-2 -mb-2 border-b-2 transition-all whitespace-nowrap ${
                  isTabActive('/app') && location.pathname === '/app'
                    ? 'border-sheeba-purple text-sheeba-dark font-bold'
                    : 'border-transparent text-gray-500 hover:text-sheeba-dark'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/app/record"
                className={`flex items-center gap-2 pb-2 -mb-2 border-b-2 transition-all whitespace-nowrap ${
                  isTabActive('/app/record')
                    ? 'border-sheeba-purple text-sheeba-dark font-bold'
                    : 'border-transparent text-gray-500 hover:text-sheeba-dark'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Record</span>
              </Link>

              <Link
                to="/app/events"
                className={`flex items-center gap-2 pb-2 -mb-2 border-b-2 transition-all whitespace-nowrap ${
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
                className={`flex items-center gap-2 pb-2 -mb-2 border-b-2 transition-all whitespace-nowrap ${
                  isTabActive('/app/profile/attendance')
                    ? 'border-sheeba-purple text-sheeba-dark font-bold'
                    : 'border-transparent text-gray-500 hover:text-sheeba-dark'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Attendance Timeline</span>
              </Link>
            </div>

            {/* Right: Balancer spacer */}
            <div className="w-24 sm:w-32 hidden sm:flex justify-end"></div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white">
        <Outlet />
      </main>

      {/* Sliding Sidebar Drawer (Slides from Left) */}
      <AttendeeDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      <Footer />
    </div>
  );
};
