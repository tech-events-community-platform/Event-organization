import React, { useState } from 'react';
import { mockAdminUsers, mockAdminOrganizers, type AdminUserRecord } from '../../data/mockAdminData';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Search, Users, Building2 } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUserRecord[]>(mockAdminUsers);
  const organizers = mockAdminOrganizers;
  const [activeTab, setActiveTab] = useState<'ATTENDEES' | 'ORGANIZERS'>('ATTENDEES');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusModalUser, setStatusModalUser] = useState<AdminUserRecord | null>(null);

  const filteredUsers = users.filter(
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
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#2D1F23]">Platform Users & Organizers</h1>
        <p className="text-xs text-[#756366]">Manage registered attendee accounts and community organizers on Sheba.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E8DDD7] gap-6">
        <button
          onClick={() => setActiveTab('ATTENDEES')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'ATTENDEES'
              ? 'border-[#63474D] text-[#63474D]'
              : 'border-transparent text-[#756366] hover:text-[#2D1F23]'
          }`}
        >
          <Users className="w-4 h-4" />
          Attendees ({users.length})
        </button>
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
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-[#E8DDD7] shadow-xs flex gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756366]" />
          <input
            type="text"
            placeholder={activeTab === 'ATTENDEES' ? "Search attendees by name or email..." : "Search organizers by organization or email..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#FAF7F5] border border-[#E8DDD7] rounded-xl text-xs text-[#2D1F23] focus:outline-none focus:ring-2 focus:ring-[#63474D]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-[#E8DDD7] overflow-hidden shadow-xs">
        {activeTab === 'ATTENDEES' ? (
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
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-[#FAF7F5]/50">
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
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAF7F5] border-b border-[#E8DDD7] text-[10px] font-bold uppercase tracking-wider text-[#756366]">
                <th className="py-3 px-4">Organization / Name</th>
                <th className="py-3 px-4">Contact Email</th>
                <th className="py-3 px-4">Events Hosted</th>
                <th className="py-3 px-4">Total Turnout</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DDD7] text-[#2D1F23]">
              {filteredOrganizers.map((o) => (
                <tr key={o.id} className="hover:bg-[#FAF7F5]/50">
                  <td className="py-3.5 px-4">
                    <p className="font-bold">{o.organization}</p>
                    <p className="text-[11px] text-[#756366]">{o.name}</p>
                  </td>
                  <td className="py-3.5 px-4 text-[#756366]">{o.email}</td>
                  <td className="py-3.5 px-4 font-bold text-[#63474D]">{o.eventsCount}</td>
                  <td className="py-3.5 px-4 font-bold text-[#2A7B5F]">{o.totalCheckIns}</td>
                  <td className="py-3.5 px-4">
                    <Badge variant="success">Active Partner</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
            Are you sure you want to change account status for <strong>{statusModalUser?.name}</strong> ({statusModalUser?.email})?
          </p>
          <div className="pt-2 flex justify-end gap-3">
            <Button variant="outline" size="sm" onClick={() => setStatusModalUser(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (statusModalUser) {
                  setUsers((prev) =>
                    prev.map((u) =>
                      u.id === statusModalUser.id
                        ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' }
                        : u
                    )
                  );
                  setStatusModalUser(null);
                }
              }}
            >
              Confirm Update
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
