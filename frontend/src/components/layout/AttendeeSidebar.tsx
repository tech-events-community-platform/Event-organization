import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Ticket,
  Award,
  Settings,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

export const AttendeeSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Badges', path: '/app', icon: Award },
    { label: 'My Registrations', path: '/app/events', icon: Ticket },
    { label: 'Settings', path: '/app/settings', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/app') return location.pathname === '/app' || location.pathname === '/app/badges';
    if (path === '/app/events') return location.pathname === '/app/events' || location.pathname === '/app/registrations' || location.pathname.startsWith('/app/ticket');
    if (path === '/app/settings') return location.pathname === '/app/settings';
    return location.pathname.startsWith(path);
  };

  const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';

  return (
    <aside className="w-64 bg-[#63474D] text-white flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)] border-r border-[#AA767C]/40 shrink-0">
      <div className="p-4 space-y-6">
        {/* Attendee Identity Header */}
        <div className="px-3 py-2 border-b border-[#AA767C]/40 space-y-1">
          <div className="flex items-center gap-1.5">
            <h2 className="font-serif font-bold text-lg text-white tracking-tight truncate">
              {user?.name || 'Attendee'}
            </h2>
            <ShieldCheck className="w-4 h-4 text-[#FFA686] shrink-0" />
          </div>
          <p className="text-[11px] text-[#FFA686] font-medium">Verified Attendee Passholder</p>
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

      {/* Footer User Profile */}
      <div className="p-4 border-t border-[#AA767C]/40 space-y-3">
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={user?.avatarUrl || defaultAvatar}
              alt="Attendee"
              className="w-8 h-8 rounded-full object-cover border border-[#FFA686]"
              onError={(e) => {
                (e.target as HTMLImageElement).src = defaultAvatar;
              }}
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'Attendee'}</p>
              <p className="text-[10px] text-[#D6A184] truncate">{user?.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={async () => {
              await logout();
              navigate('/');
            }}
            className="p-1.5 text-red-200 hover:text-white hover:bg-red-900/40 rounded-lg transition-colors cursor-pointer"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
