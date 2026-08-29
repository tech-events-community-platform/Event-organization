import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  PlusCircle,
  BarChart3,
  LogOut,
  Settings,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const OrganizerSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Overview', path: '/organizer', icon: LayoutDashboard },
    { label: 'My Events', path: '/organizer/events', icon: Calendar },
    { label: 'Create Event', path: '/organizer/events/create', icon: PlusCircle },
    { label: 'Sponsor Reports', path: '/organizer/events/evt_react_workshop_2026/report', icon: BarChart3 },
    { label: 'Account & Data Export', path: '/organizer/settings', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/organizer') return location.pathname === '/organizer';
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-64 bg-[#63474D] text-white flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)] border-r border-[#AA767C]/40">
      <div className="p-4 space-y-6">
        {/* Console Header */}
        <div className="bg-[#523a3f] rounded-xl p-3 border border-[#FFA686]/30 space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FFA686] animate-pulse"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#FFA686]">
              Organizer Console
            </span>
          </div>
          <p className="text-xs font-medium text-white truncate">{user?.organization || 'GDG Addis'}</p>
        </div>

        {/* Navigation */}
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
                    ? 'bg-[#AA767C] text-white font-semibold border-l-4 border-[#FFA686] shadow-xs'
                    : 'text-[#E8DDD7] hover:bg-[#523a3f] hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-[#FFA686]' : 'text-[#D6A184]'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile */}
      <div className="p-4 border-t border-[#AA767C]/40 space-y-3">
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'}
              alt="Organizer"
              className="w-8 h-8 rounded-full object-cover border border-[#FFA686]"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'Sara Tesfaye'}</p>
              <p className="text-[10px] text-[#D6A184] truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="p-1.5 text-red-200 hover:text-white hover:bg-red-900/40 rounded-lg transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
