import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import {
  Trash2,
  AlertTriangle,
  User,
  Building,
  Mail,
  AlertCircle,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { TelegramIcon, XIcon, TikTokIcon, YouTubeIcon } from '../../components/ui/SocialIcons';

export const AccountSettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [organization, setOrganization] = useState(user?.organization || '');
  const [email] = useState(user?.email || '');
  const [telegram, setTelegram] = useState('');
  const [xHandle, setXHandle] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [youtube, setYoutube] = useState('');
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isDangerZoneOpen, setIsDangerZoneOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setOrganization(user.organization || '');
      try {
        const stored =
          localStorage.getItem(`sheeba_organizer_socials_${user.id}`) ||
          localStorage.getItem('sheeba_organizer_socials');
        if (stored) {
          const parsed = JSON.parse(stored);
          setTelegram(parsed.telegram || '');
          setXHandle(parsed.x || '');
          setTiktok(parsed.tiktok || '');
          setYoutube(parsed.youtube || '');
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSavingProfile(true);
    try {
      await api.account.updateProfile(user.id, {
        name,
        organization,
      });

      const socialsData = {
        telegram: telegram.trim(),
        x: xHandle.trim(),
        tiktok: tiktok.trim(),
        youtube: youtube.trim(),
      };
      localStorage.setItem(`sheeba_organizer_socials_${user.id}`, JSON.stringify(socialsData));
      localStorage.setItem('sheeba_organizer_socials', JSON.stringify(socialsData));

      setSaveMsg('Profile & socials updated successfully.');
      setTimeout(() => setSaveMsg(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleteError(null);
    try {
      await api.account.deleteAccount(user.id);
      logout();
      navigate('/');
    } catch (err: any) {
      setDeleteError(
        err.message ||
          'Cannot delete account: You have upcoming or ongoing events. Complete or cancel them first.'
      );
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="w-full max-w-5xl py-6 px-2 sm:px-4 space-y-8 pb-20">
      {/* Page Heading (Unboxed, expanded to left & right) */}
      <div className="space-y-1">
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#2D1F23]">
          Organizer Account Settings
        </h1>
        <p className="text-xs text-[#756366]">
          Manage your organizer community profile, socials, and account.
        </p>
      </div>

      {saveMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 animate-fade-in max-w-xl">
          <img src="/tick.png" alt="Success" className="w-4 h-4 object-contain shrink-0" />
          <span>{saveMsg}</span>
        </div>
      )}

      {/* 1. Organizer Profile Information (Unboxed, no rectangle box background) */}
      <div className="space-y-6">
        <div>
          <h2 className="font-serif font-bold text-base text-[#2D1F23] flex items-center gap-2">
            <User className="w-4 h-4 text-[#63474D]" />
            Organizer Profile Information
          </h2>
          <p className="text-xs text-[#756366] mt-0.5">
            Your name, community organization, and social channels appear on public event pages.
          </p>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-5 max-w-3xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#2D1F23] mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#63474D]" />
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF7F5] border border-[#E8DDD7] rounded-xl text-xs text-[#2D1F23] focus:outline-none focus:ring-2 focus:ring-[#63474D]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D1F23] mb-1 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[#63474D]" />
                Organization / Community Name
              </label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. GDG Addis, ALX Tech Community"
                className="w-full px-3.5 py-2.5 bg-[#FAF7F5] border border-[#E8DDD7] rounded-xl text-xs text-[#2D1F23] focus:outline-none focus:ring-2 focus:ring-[#63474D]"
              />
            </div>
          </div>

          {/* Email input brought halfway to the left */}
          <div className="max-w-xs sm:max-w-sm">
            <label className="block text-xs font-bold text-[#2D1F23] mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#63474D]" />
              Contact Email
            </label>
            <input
              type="email"
              readOnly
              value={email}
              className="w-full px-3.5 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-xs text-gray-500 cursor-not-allowed"
            />
            <p className="text-[10px] text-gray-400 mt-1">Contact support to modify primary login email.</p>
          </div>

          {/* Social Accounts: Telegram, X, TikTok (black icon), YouTube */}
          <div className="pt-4 border-t border-[#E8DDD7]/70 space-y-3">
            <div>
              <h3 className="text-xs font-bold text-[#2D1F23]">Social Accounts</h3>
              <p className="text-[11px] text-[#756366]">
                Provide your community social links. These will appear beside your organizer name below event posters on public registration pages.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#2D1F23] mb-1 flex items-center gap-1.5">
                  <TelegramIcon className="w-3.5 h-3.5 text-[#0088cc]" />
                  Telegram
                </label>
                <input
                  type="text"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  placeholder="@channel or https://t.me/..."
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F5] border border-[#E8DDD7] rounded-xl text-xs text-[#2D1F23] focus:outline-none focus:ring-2 focus:ring-[#63474D]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D1F23] mb-1 flex items-center gap-1.5">
                  <XIcon className="w-3.5 h-3.5 text-[#2D1F23]" />
                  X (Twitter)
                </label>
                <input
                  type="text"
                  value={xHandle}
                  onChange={(e) => setXHandle(e.target.value)}
                  placeholder="@handle or https://x.com/..."
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F5] border border-[#E8DDD7] rounded-xl text-xs text-[#2D1F23] focus:outline-none focus:ring-2 focus:ring-[#63474D]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D1F23] mb-1 flex items-center gap-1.5">
                  <TikTokIcon className="w-3.5 h-3.5 text-black" />
                  TikTok
                </label>
                <input
                  type="text"
                  value={tiktok}
                  onChange={(e) => setTiktok(e.target.value)}
                  placeholder="@account or https://tiktok.com/@..."
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F5] border border-[#E8DDD7] rounded-xl text-xs text-[#2D1F23] focus:outline-none focus:ring-2 focus:ring-[#63474D]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D1F23] mb-1 flex items-center gap-1.5">
                  <YouTubeIcon className="w-3.5 h-3.5 text-[#ff0000]" />
                  YouTube
                </label>
                <input
                  type="text"
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                  placeholder="@channel or https://youtube.com/..."
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F5] border border-[#E8DDD7] rounded-xl text-xs text-[#2D1F23] focus:outline-none focus:ring-2 focus:ring-[#63474D]"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" variant="primary" size="sm" isLoading={isSavingProfile}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>

      {/* 2. Danger Zone as a Dropdown (Logout and Do an account deletion) */}
      <div className="pt-6 border-t border-red-200/80 space-y-4 max-w-3xl">
        <button
          type="button"
          onClick={() => setIsDangerZoneOpen(!isDangerZoneOpen)}
          className="w-full flex items-center justify-between text-left group cursor-pointer py-1"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <div>
              <h2 className="font-serif font-bold text-base text-red-900 group-hover:text-red-700 transition-colors">
                Danger Zone
              </h2>
              <p className="text-xs text-[#756366]">
                Manage session logout or perform permanent account deletion.
              </p>
            </div>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-red-700 transition-transform duration-200 ${
              isDangerZoneOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isDangerZoneOpen && (
          <div className="space-y-4 pt-1 animate-fade-in">
            {deleteError && (
              <div className="p-3.5 bg-red-100/80 border border-red-300 rounded-2xl text-xs text-red-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4">
              {/* Logout Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleLogout}
                icon={<LogOut className="w-4 h-4 text-[#63474D]" />}
              >
                Log Out
              </Button>

              {/* Do an account deletion Button */}
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => {
                  setDeleteError(null);
                  setShowDeleteConfirm(true);
                }}
                icon={<Trash2 className="w-4 h-4" />}
              >
                Do an account deletion
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal Pop-up (In front of the user) */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-red-200 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-red-100 text-red-600 rounded-2xl shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-lg text-red-900">
                  Are you sure?
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  This action is permanent. This will permanently erase your organizer profile and data. Deletion is blocked if you have ongoing or upcoming events.
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteError(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={handleDeleteAccount}
                icon={<Trash2 className="w-4 h-4" />}
              >
                Yes, Delete My Account
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
