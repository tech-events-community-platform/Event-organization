import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { ProfileVisibility } from '../../types/user';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Eye,
  EyeOff,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  FileSpreadsheet,
  User,
  Building,
  Mail,
  AlertCircle,
} from 'lucide-react';

export const AccountSettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [organization, setOrganization] = useState(user?.organization || '');
  const [email] = useState(user?.email || '');
  const [visibility, setVisibility] = useState<ProfileVisibility>(user?.visibility || 'public');
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setOrganization(user.organization || '');
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
      setSaveMsg('Profile details updated successfully.');
      setTimeout(() => setSaveMsg(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleToggleVisibility = async (newVal: ProfileVisibility) => {
    if (!user) return;
    setVisibility(newVal);
    await api.account.updateVisibility(user.id, newVal);
    setSaveMsg(`Profile visibility updated to ${newVal}.`);
    setTimeout(() => setSaveMsg(null), 3000);
  };

  const handleExportData = async (format: 'csv' | 'json') => {
    if (!user) return;
    setIsExporting(true);
    try {
      await api.account.exportFullUserData(user.id, format);
      setSaveMsg(`Account data exported in .${format.toUpperCase()} format.`);
      setTimeout(() => setSaveMsg(null), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  // Section 9: Delete Account with guard
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

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-8 pb-20">
      <div className="space-y-1">
        <Badge variant="primary">Organizer & Profile Settings</Badge>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#2D1F23]">
          Account Settings
        </h1>
        <p className="text-xs text-[#756366]">
          Manage your organizer community profile, data exports, and account lifecycle.
        </p>
      </div>

      {saveMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{saveMsg}</span>
        </div>
      )}

      {/* 1. Section 9: Organizer Profile (Name, Organization, Contact Email) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DDD7] shadow-xs space-y-4">
        <div>
          <h2 className="font-serif font-bold text-base text-[#2D1F23] flex items-center gap-2">
            <User className="w-4 h-4 text-[#63474D]" />
            Organizer Profile Information
          </h2>
          <p className="text-xs text-[#756366] mt-0.5">
            Your name and community organization appear on public event pages and certificates.
          </p>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-3 pt-2">
          <div>
            <label className="block text-xs font-bold text-[#2D1F23] mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#63474D]" />
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#FAF7F5] border border-[#E8DDD7] rounded-xl text-xs text-[#2D1F23] focus:outline-none focus:ring-2 focus:ring-[#63474D]"
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
              className="w-full px-3.5 py-2 bg-[#FAF7F5] border border-[#E8DDD7] rounded-xl text-xs text-[#2D1F23] focus:outline-none focus:ring-2 focus:ring-[#63474D]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2D1F23] mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#63474D]" />
              Contact Email
            </label>
            <input
              type="email"
              readOnly
              value={email}
              className="w-full px-3.5 py-2 bg-gray-100 border border-gray-200 rounded-xl text-xs text-gray-500 cursor-not-allowed"
            />
            <p className="text-[10px] text-gray-400 mt-1">Contact support to modify primary login email.</p>
          </div>

          <div className="pt-2">
            <Button type="submit" variant="primary" size="sm" isLoading={isSavingProfile}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>

      {/* 2. Profile Visibility */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DDD7] shadow-xs space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-serif font-bold text-base text-[#2D1F23] flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#63474D]" />
              Profile Visibility
            </h2>
            <p className="text-xs text-[#756366] mt-0.5">
              Profiles are public by default to display verified badges.
            </p>
          </div>
          <Badge variant={visibility === 'public' ? 'success' : 'gray'}>
            {visibility === 'public' ? 'Public' : 'Private'}
          </Badge>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => handleToggleVisibility('public')}
            className={`flex-1 p-3.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              visibility === 'public'
                ? 'border-[#63474D] bg-[#63474D]/10 text-[#63474D]'
                : 'border-[#E8DDD7] text-[#756366] hover:bg-[#FAF7F5]'
            }`}
          >
            <Eye className="w-4 h-4" />
            Public
          </button>
          <button
            type="button"
            onClick={() => handleToggleVisibility('private')}
            className={`flex-1 p-3.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              visibility === 'private'
                ? 'border-[#63474D] bg-[#63474D]/10 text-[#63474D]'
                : 'border-[#E8DDD7] text-[#756366] hover:bg-[#FAF7F5]'
            }`}
          >
            <EyeOff className="w-4 h-4" />
            Private
          </button>
        </div>
      </div>

      {/* 3. Data Export */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DDD7] shadow-xs space-y-4">
        <div>
          <h2 className="font-serif font-bold text-base text-[#2D1F23] flex items-center gap-2">
            <Download className="w-4 h-4 text-[#63474D]" />
            Full Data Export (CSV & JSON)
          </h2>
          <p className="text-xs text-[#756366] mt-0.5">
            Download an exhaustive backup of all your tickets, hosted events, and badge records.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            onClick={() => handleExportData('csv')}
            variant="outline"
            size="sm"
            isLoading={isExporting}
            icon={<FileSpreadsheet className="w-4 h-4" />}
          >
            Export All Data (.CSV)
          </Button>
          <Button
            onClick={() => handleExportData('json')}
            variant="outline"
            size="sm"
            isLoading={isExporting}
            icon={<FileText className="w-4 h-4" />}
          >
            Export Complete Record (.JSON)
          </Button>
        </div>
      </div>

      {/* 4. Section 9: Account Deletion (Blocked if ongoing/upcoming events exist) */}
      <div className="bg-red-50/50 p-6 sm:p-8 rounded-3xl border border-red-200/80 space-y-4">
        <div>
          <h2 className="font-serif font-bold text-base text-red-900 flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-red-700" />
            Delete Account
          </h2>
          <p className="text-xs text-red-700/80 mt-0.5">
            Permanently erase your Sheba account and organizer data. Account deletion is strictly blocked if you have ongoing or upcoming events.
          </p>
        </div>

        {deleteError && (
          <div className="p-3.5 bg-red-100/80 border border-red-300 rounded-2xl text-xs text-red-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
            <span>{deleteError}</span>
          </div>
        )}

        {!showDeleteConfirm ? (
          <Button
            onClick={() => {
              setDeleteError(null);
              setShowDeleteConfirm(true);
            }}
            variant="danger"
            size="sm"
          >
            Request Account Deletion
          </Button>
        ) : (
          <div className="p-4 bg-white rounded-2xl border border-red-200 space-y-3">
            <p className="text-xs font-bold text-red-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              Are you sure? This action is permanent.
            </p>
            <div className="flex gap-2">
              <Button onClick={handleDeleteAccount} variant="danger" size="sm">
                Yes, Delete My Account
              </Button>
              <Button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteError(null);
                }}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
