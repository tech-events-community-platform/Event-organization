import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  User as UserIcon,
  Send,
  ShieldCheck,
  LogOut,
  Settings,
  Tag,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [attendanceCount, setAttendanceCount] = useState(0);

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const fetchAttendance = async () => {
      if (user) {
        const history = await api.getAttendanceHistory(user.id);
        setAttendanceCount(history.length);
      }
    };
    fetchAttendance();
  }, [user]);

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-[#D6A84F] shadow-sm"
          />

          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <h1 className="text-2xl font-extrabold text-[#17211E]">{user.name}</h1>
              <Badge variant="gold" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
                Member Since {user.memberSince}
              </Badge>
            </div>

            <p className="text-sm font-semibold text-[#0B5D4B] flex items-center justify-center sm:justify-start gap-1">
              <Send className="w-4 h-4" />
              {user.telegramHandle}
            </p>

            <p className="text-xs text-[#66736E] leading-relaxed">{user.bio}</p>

            <div className="pt-2 flex items-center justify-center sm:justify-start gap-4 text-xs">
              <div className="bg-[#0B5D4B]/10 px-3 py-1.5 rounded-xl text-[#0B5D4B] font-bold">
                {attendanceCount} Verified Events Attended
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Information */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 space-y-4 shadow-2xs">
          <h3 className="font-bold text-base text-[#17211E] flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-[#0B5D4B]" />
            Profile Information
          </h3>
          <div className="space-y-3 text-xs divide-y divide-gray-100">
            <div className="pt-2 flex justify-between">
              <span className="text-[#66736E]">Full Name</span>
              <span className="font-semibold text-[#17211E]">{user.name}</span>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-[#66736E]">Telegram Identity</span>
              <span className="font-semibold text-[#0B5D4B]">{user.telegramHandle}</span>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-[#66736E]">Account Role</span>
              <span className="font-semibold text-[#17211E]">{user.role}</span>
            </div>
          </div>
        </div>

        {/* Self-Reported Skill Interests */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 space-y-4 shadow-2xs">
          <h3 className="font-bold text-base text-[#17211E] flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#D6A84F]" />
            Self-Reported Tag Topics
          </h3>
          <p className="text-xs text-[#66736E]">
            Tags used for community session recommendations (Not skill credentials).
          </p>
          <div className="flex flex-wrap gap-2">
            {user.selfReportedSkills?.map((skill) => (
              <Badge key={skill} variant="gold">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation & Logout Settings */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200/80 space-y-4 shadow-2xs">
        <h3 className="font-bold text-base text-[#17211E] flex items-center gap-2">
          <Settings className="w-4 h-4 text-[#0B5D4B]" />
          Account & Mode Options
        </h3>
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Link to="/app/profile/attendance" className="w-full sm:w-auto">
            <Button variant="outline" size="sm" icon={<ShieldCheck className="w-4 h-4" />}>
              View Verified Attendance History
            </Button>
          </Link>
          <Button
            onClick={handleSignOut}
            variant="danger"
            size="sm"
            className="w-full sm:w-auto ml-auto"
            icon={<LogOut className="w-4 h-4" />}
          >
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
};
