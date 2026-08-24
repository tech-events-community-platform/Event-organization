import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  PlusCircle,
  BarChart3,
  LogOut,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const OrganizerSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Overview', path: '/organizer', icon: LayoutDashboard },
    { label: 'Manage Events', path: '/organizer/events', icon: Calendar },
    { label: 'Create Event', path: '/organizer/events/create', icon: PlusCircle },
    { label: 'Sponsor Reports', path: '/organizer/events/evt_react_workshop_2026/report', icon: BarChart3 },
  ];

  const isActive = (path: string) => {
    if (path === '/organizer') return location.pathname === '/organizer';
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-64 bg-[#064638] text-white flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)] border-r border-[#0B5D4B]">
      <div className="p-4 space-y-6">
        {/* Console Banner Header */}
        <div className="bg-[#0B5D4B] rounded-xl p-3 border border-[#D6A84F]/30 space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D6A84F] animate-pulse"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#D6A84F]">
              Organizer Console
            </span>
          </div>
          <p className="text-xs font-medium text-white truncate">DevCommunity Ethiopia</p>
        </div>

        {/* Navigation links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-[#0B5D4B] text-white font-semibold border-l-4 border-[#D6A84F] shadow-sm'
                    : 'text-gray-300 hover:bg-[#0B5D4B]/50 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-[#D6A84F]' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile Box */}
      <div className="p-4 border-t border-[#0B5D4B] space-y-3">
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=150&q=80'}
              alt="Organizer Avatar"
              className="w-8 h-8 rounded-full object-cover border border-[#D6A84F]"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'Sara Tesfaye'}</p>
              <p className="text-[10px] text-gray-300 truncate">{user?.telegramHandle || '@sara_demo'}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="p-1.5 text-red-300 hover:text-white hover:bg-red-950/40 rounded-lg transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
