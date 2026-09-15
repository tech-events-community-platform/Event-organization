import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Award,
  CreditCard,
  User,
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { label: 'Platform Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Event Oversight', path: '/admin/events', icon: Calendar },
    { label: 'Users & Organizers', path: '/admin/users', icon: Users },
    { label: 'Badge Revocation Queue', path: '/admin#badges', icon: Award },
    { label: 'Payment Issues Log', path: '/admin#payments', icon: CreditCard },
    { label: 'Admin Profile', path: '/admin/profile', icon: User },
  ];

  const isActive = (path: string) => {
    if (path.includes('#')) {
      return location.pathname + location.hash === path;
    }
    if (path === '/admin') {
      return location.pathname === '/admin' && !location.hash;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-64 bg-[#63474D] text-white flex flex-col hidden md:flex sticky top-16 h-[calc(100vh-4rem)] border-r border-[#AA767C]/40 shrink-0 self-start overflow-y-auto">
      <div className="p-4 space-y-5">
        {/* Console Header */}
        <div className="bg-[#523a3f] rounded-xl p-3 border border-[#FFA686]/30 space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FFA686] animate-pulse"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#FFA686]">
              Platform Admin
            </span>
          </div>
          <p className="text-xs font-medium text-white truncate">Sheba Operations</p>
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

        {/* Brought-up Profile */}
        <div className="pt-4 border-t border-[#AA767C]/40">
          <div className="flex items-center gap-2.5 px-1 min-w-0">
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'}
              alt="Admin"
              className="w-8 h-8 rounded-full object-cover border border-[#FFA686] shrink-0"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'Hanan Admin'}</p>
              <p className="text-[10px] text-[#FFA686] truncate">Platform Ops</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
