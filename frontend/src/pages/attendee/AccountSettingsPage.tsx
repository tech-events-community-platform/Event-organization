import React, { useState } from 'react';
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
} from 'lucide-react';

export const AccountSettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [visibility, setVisibility] = useState<ProfileVisibility>(user?.visibility || 'public');
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  const handleDeleteAccount = async () => {
    if (!user) return;
    await api.account.deleteAccount(user.id);
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 space-y-8 pb-20">
      <div className="space-y-1">
        <Badge variant="primary">Account & Privacy</Badge>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#2D1F23]">
          Account Settings
        </h1>
        <p className="text-xs text-[#756366]">
          Manage your public visibility, personal data exports, and account lifecycle.
        </p>
      </div>

      {saveMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{saveMsg}</span>
        </div>
      )}

      {/* 1. Profile Visibility (SRS 3.4) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DDD7] shadow-xs space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-serif font-bold text-base text-[#2D1F23] flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#63474D]" />
              Profile Visibility (Public / Private)
            </h2>
            <p className="text-xs text-[#756366] mt-0.5">
              Profiles are public by default to display verified badges. You can switch to private at any time.
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
            Public (Badges Visible)
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
            Private (Hidden from Search)
          </button>
        </div>
      </div>

      {/* 2. Data Export (SRS 3.5) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DDD7] shadow-xs space-y-4">
        <div>
          <h2 className="font-serif font-bold text-base text-[#2D1F23] flex items-center gap-2">
            <Download className="w-4 h-4 text-[#63474D]" />
            Full Data Export (CSV & JSON)
          </h2>
          <p className="text-xs text-[#756366] mt-0.5">
            Download an exhaustive backup of all your tickets, verified attendance records, and badge awards.
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

      {/* 3. Account Deletion (SRS 3.5) */}
      <div className="bg-red-50/50 p-6 sm:p-8 rounded-3xl border border-red-200/80 space-y-4">
        <div>
          <h2 className="font-serif font-bold text-base text-red-900 flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-red-700" />
            Delete Account
          </h2>
          <p className="text-xs text-red-700/80 mt-0.5">
            Permanently erase your Sheba account, profile information, and access credentials.
          </p>
        </div>

        {!showDeleteConfirm ? (
          <Button
            onClick={() => setShowDeleteConfirm(true)}
            variant="danger"
            size="sm"
          >
            Request Account Deletion
          </Button>
        ) : (
          <div className="p-4 bg-white rounded-2xl border border-red-200 space-y-3">
            <p className="text-xs font-bold text-red-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              Are you sure? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <Button onClick={handleDeleteAccount} variant="danger" size="sm">
                Yes, Delete My Account
              </Button>
              <Button onClick={() => setShowDeleteConfirm(false)} variant="outline" size="sm">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
