import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { AdminSidebar } from '../components/layout/AdminSidebar';
import { Footer } from '../components/layout/Footer';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Building2,
  BarChart3,
  User,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const location = useLocation();

  const isTabActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8F5]">
      <Navbar />

      {/* Mobile Top Sub-bar for Admin */}
      <div className="md:hidden bg-[#064638] text-white py-2.5 px-4 border-b border-[#0B5D4B] overflow-x-auto scrollbar-none flex gap-2">
        {[
          { label: 'Overview', path: '/admin', icon: LayoutDashboard },
          { label: 'Events', path: '/admin/events', icon: Calendar },
          { label: 'Users', path: '/admin/users', icon: Users },
          { label: 'Organizers', path: '/admin/organizers', icon: Building2 },
          { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
          { label: 'Profile', path: '/admin/profile', icon: User },
        ].map((item) => {
          const Icon = item.icon;
          const active = isTabActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 ${
                active ? 'bg-[#0B5D4B] text-[#D6A84F]' : 'text-gray-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <AdminSidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
};
