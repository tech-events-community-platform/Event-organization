import React, { useState, useEffect } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import {
  Search,
  Users,
  Building2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { api } from '../../services/api';

export interface AttendeeRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  eventsRegistered: number;
  eventsAttended: number;
  status: string;
  approvalStatus: string;
  registeredAt: string;
}

export interface OrganizerRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  organization: string;
  eventsCount: number;
  totalCheckIns: number;
  status: string;
  approvalStatus: string;
  isActive: boolean;
  registeredAt: string;
}

export const AdminUsersPage: React.FC = () => {
  const [attendees, setAttendees] = useState<AttendeeRecord[]>([]);
  const [organizers, setOrganizers] = useState<OrganizerRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'ORGANIZERS' | 'ATTENDEES'>('ORGANIZERS');
  const [searchQuery, setSearchQuery] = useState('');

  const [statusModalUser, setStatusModalUser] = useState<AttendeeRecord | OrganizerRecord | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await api.admin.getUsers();
      if (data) {
        setAttendees(data.attendees || []);
        setOrganizers(data.organizers || []);
      }
    } catch (err: any) {
      console.error('Failed to load users from backend:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApproveOrganizer = async (organizerId: string) => {
    setActionLoadingId(organizerId);
    setActionSuccessMsg(null);
    setActionErrorMsg(null);

    try {
      await api.admin.approveOrganizer(organizerId);
      setActionSuccessMsg('Organizer approved and activated successfully! They can now log in.');
      await fetchUsers();
    } catch (err: any) {
      setActionErrorMsg(err.message || 'Failed to approve organizer.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleStatus = async () => {
    if (!statusModalUser) return;
    const userId = statusModalUser.id;
    setActionLoadingId(userId);

    try {
      await api.admin.toggleUserStatus(userId);
      setStatusModalUser(null);
      await fetchUsers();
    } catch (err: any) {
      setActionErrorMsg(err.message || 'Failed to update user status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const pendingOrganizersCount = organizers.filter((o) => o.approvalStatus === 'pending').length;

  const filteredAttendees = attendees.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrganizers = organizers.filter(
    (o) =>
      o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#2D1F23]">
            Platform Users & Organizers
          </h1>
          <p className="text-xs text-[#756366]">
            Review organizer approval requests and manage registered attendee accounts.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchUsers}
          isLoading={isLoading}
          className="flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh List
        </Button>
      </div>

      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-700 font-bold text-xs">
            ✕
          </button>
        </div>
      )}

      {actionErrorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>{actionErrorMsg}</span>
          </div>
          <button onClick={() => setActionErrorMsg(null)} className="text-red-700 font-bold text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[#E8DDD7] gap-6">
        <button
          onClick={() => setActiveTab('ORGANIZERS')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'ORGANIZERS'
              ? 'border-[#63474D] text-[#63474D]'
              : 'border-transparent text-[#756366] hover:text-[#2D1F23]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Organizers ({organizers.length})
          {pendingOrganizersCount > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black animate-pulse">
              {pendingOrganizersCount} Pending
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('ATTENDEES')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'ATTENDEES'
              ? 'border-[#63474D] text-[#63474D]'
              : 'border-transparent text-[#756366] hover:text-[#2D1F23]'
          }`}
        >
          <Users className="w-4 h-4" />
          Attendees ({attendees.length})
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-[#E8DDD7] shadow-xs flex gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756366]" />
          <input
            type="text"
            placeholder={
              activeTab === 'ORGANIZERS'
                ? 'Search organizers by organization name, lead name, or email...'
                : 'Search attendees by name or email...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#FAF7F5] border border-[#E8DDD7] rounded-xl text-xs text-[#2D1F23] focus:outline-none focus:ring-2 focus:ring-[#63474D]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-[#E8DDD7] overflow-hidden shadow-xs">
        {activeTab === 'ORGANIZERS' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#FAF7F5] border-b border-[#E8DDD7] text-[10px] font-bold uppercase tracking-wider text-[#756366]">
                  <th className="py-3 px-4">Organization & Lead</th>
                  <th className="py-3 px-4">Contact Email</th>
                  <th className="py-3 px-4">Events Hosted</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4">Approval Status</th>
                  <th className="py-3 px-4 text-right">Approval Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DDD7] text-[#2D1F23]">
                {filteredOrganizers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-[#756366]">
                      No organizers registered yet.
                    </td>
                  </tr>
                ) : (
                  filteredOrganizers.map((o) => (
                    <tr
                      key={o.id}
                      className={`hover:bg-[#FAF7F5]/50 transition-colors ${
                        o.approvalStatus === 'pending' ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-[#2D1F23]">{o.organization}</p>
                        <p className="text-[11px] text-[#756366]">Lead: {o.name}</p>
                      </td>
                      <td className="py-3.5 px-4 text-[#756366]">
                        {o.email}
                        {o.phone && <p className="text-[10px] text-[#756366]/80">{o.phone}</p>}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#63474D]">
                        {o.eventsCount} events
                      </td>
                      <td className="py-3.5 px-4 text-[#756366]">
                        {new Date(o.registeredAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        {o.approvalStatus === 'pending' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            <Clock className="w-3 h-3 text-amber-700 animate-pulse" />
                            Pending Approval
                          </span>
                        ) : o.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Approved & Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700 border border-gray-300">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {o.approvalStatus === 'pending' ? (
                          <Button
                            variant="primary"
                            size="sm"
                            isLoading={actionLoadingId === o.id}
                            onClick={() => handleApproveOrganizer(o.id)}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                            Approve Organizer
                          </Button>
                        ) : (
                          <button
                            onClick={() => setStatusModalUser(o)}
                            className="text-xs font-semibold text-[#63474D] hover:underline"
                          >
                            {o.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#FAF7F5] border-b border-[#E8DDD7] text-[10px] font-bold uppercase tracking-wider text-[#756366]">
                  <th className="py-3 px-4">Attendee Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Registered Events</th>
                  <th className="py-3 px-4">Attended Events</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Account Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DDD7] text-[#2D1F23]">
                {filteredAttendees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-[#756366]">
                      No attendees registered yet.
                    </td>
                  </tr>
                ) : (
                  filteredAttendees.map((u) => (
                    <tr key={u.id} className="hover:bg-[#FAF7F5]/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold">{u.name}</td>
                      <td className="py-3.5 px-4 text-[#756366]">{u.email}</td>
                      <td className="py-3.5 px-4">{u.eventsRegistered}</td>
                      <td className="py-3.5 px-4 font-bold text-[#2A7B5F]">{u.eventsAttended}</td>
                      <td className="py-3.5 px-4">
                        <Badge variant={u.status === 'Active' ? 'success' : 'gray'}>
                          {u.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setStatusModalUser(u)}
                          className="text-xs font-semibold text-[#63474D] hover:underline"
                        >
                          {u.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={!!statusModalUser}
        onClose={() => setStatusModalUser(null)}
        title="Update User Account Status"
      >
        <div className="space-y-4 text-xs text-[#2D1F23]">
          <p>
            Are you sure you want to change the status of{' '}
            <strong>{statusModalUser?.name}</strong> ({statusModalUser?.email})?
          </p>
          <div className="pt-2 flex justify-end gap-3">
            <Button variant="outline" size="sm" onClick={() => setStatusModalUser(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={!!actionLoadingId}
              onClick={handleToggleStatus}
            >
              Confirm Update
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
