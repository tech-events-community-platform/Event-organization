import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ShieldCheck, LogOut, Home, Lock, AlertCircle } from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F7F8F5] flex flex-col justify-between">
      {/* Header Bar */}
      <header className="bg-[#064638] text-white py-4 px-6 border-b border-[#0B5D4B] shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#D6A84F] text-[#064638] flex items-center justify-center font-bold">
            <Lock className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-lg text-white">
            SHEBA<span className="text-[#D6A84F]">.</span> ADMIN
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-white">{user?.name || 'Hanan Admin'}</p>
            <p className="text-[10px] text-[#D6A84F]">Administrator</p>
          </div>
          <Button onClick={handleLogout} variant="ghost" size="sm" className="text-white hover:bg-[#0B5D4B]" icon={<LogOut className="w-4 h-4" />}>
            Log out
          </Button>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-12 flex flex-col items-center justify-center">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200 shadow-xl text-center space-y-6 w-full relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#D6A84F]/10 rounded-full blur-xl pointer-events-none"></div>

          <div className="w-16 h-16 bg-[#064638] text-[#D6A84F] rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <Badge variant="gold" icon={<Lock className="w-3 h-3" />}>
              Role: Administrator
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17211E] pt-1">
              Admin Dashboard
            </h1>
            <p className="text-sm font-semibold text-[#0B5D4B]">
              Authenticated as {user?.name || 'Hanan Admin'} ({user?.telegramHandle || '@admin_demo'})
            </p>
          </div>

          <div className="bg-[#F7F8F5] p-5 rounded-2xl border border-gray-200 text-xs text-[#66736E] space-y-2 text-left">
            <div className="flex items-center gap-2 text-amber-900 font-bold">
              <AlertCircle className="w-4 h-4 text-[#D6A84F]" />
              Notice
            </div>
            <p className="leading-relaxed">
              Admin functionality is being prepared for upcoming infrastructure management. High-level community administration and audit logs will be accessible here.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/" className="w-full sm:w-auto">
              <Button variant="primary" size="md" icon={<Home className="w-4 h-4" />}>
                Back to Home
              </Button>
            </Link>
            <Button onClick={handleLogout} variant="outline" size="md" icon={<LogOut className="w-4 h-4" />}>
              Log out
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 text-center text-xs text-[#66736E]">
        © {new Date().getFullYear()} SHEBA Platform Admin Console.
      </footer>
    </div>
  );
};
