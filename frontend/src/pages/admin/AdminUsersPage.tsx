import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { AdminUserRecord } from '../../data/mockAdminData';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Search } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [deactivateModalUser, setDeactivateModalUser] = useState<AdminUserRecord | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const data = await api.getAdminUsers();
      setUsers(data);
    };
    fetchUsers();
  }, []);

  const handleToggleStatus = async () => {
    if (!deactivateModalUser) return;
    const updated = await api.toggleUserStatus(deactivateModalUser.id);
    setUsers(updated);
    setDeactivateModalUser(null);
  };

  const totalUsersCount = users.length;
  const attendeesCount = users.filter((u) => u.role === 'ATTENDEE').length;
  const organizersCount = users.filter((u) => u.role === 'ORGANIZER').length;

  const filteredUsers = users.filter((u) => {
    const matchesRole =
      roleFilter === 'All' ||
      (roleFilter === 'Attendees' && u.role === 'ATTENDEE') ||
      (roleFilter === 'Organizers' && u.role === 'ORGANIZER');
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.telegramHandle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-[#17211E]">User Management</h1>
        <p className="text-xs text-[#66736E]">Manage users registered on the Sheba platform.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-[#66736E]">Total Users</span>
          <p className="text-3xl font-extrabold text-[#17211E]">{totalUsersCount}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-[#66736E]">Attendees</span>
          <p className="text-3xl font-extrabold text-[#0B5D4B]">{attendeesCount}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-[#66736E]">Organizers</span>
          <p className="text-3xl font-extrabold text-[#D6A84F]">{organizersCount}</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or @telegram username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F7F8F5] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B5D4B]"
          />
        </div>

        <div className="flex gap-2">
          {['All', 'Attendees', 'Organizers'].map((roleOpt) => (
            <button
              key={roleOpt}
              onClick={() => setRoleFilter(roleOpt)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                roleFilter === roleOpt
                  ? 'bg-[#0B5D4B] text-white shadow-xs'
                  : 'bg-[#F7F8F5] text-[#66736E] hover:bg-gray-200/60'
              }`}
            >
              {roleOpt}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F7F8F5] border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-[#66736E]">
              <th className="py-3.5 px-5">Name</th>
              <th className="py-3.5 px-5">Telegram Handle</th>
              <th className="py-3.5 px-5">Role</th>
              <th className="py-3.5 px-5">Events Registered</th>
              <th className="py-3.5 px-5">Events Attended</th>
              <th className="py-3.5 px-5">Status</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs text-[#17211E]">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="py-3.5 px-5 font-bold text-[#17211E]">{user.name}</td>
                <td className="py-3.5 px-5 font-semibold text-[#0B5D4B]">{user.telegramHandle}</td>
                <td className="py-3.5 px-5">
                  <Badge variant={user.role === 'ORGANIZER' ? 'gold' : 'green'}>
                    {user.role}
                  </Badge>
                </td>
                <td className="py-3.5 px-5 font-bold">{user.eventsRegistered}</td>
                <td className="py-3.5 px-5 font-bold text-[#238B6E]">{user.eventsAttended}</td>
                <td className="py-3.5 px-5">
                  <Badge variant={user.status === 'Active' ? 'green' : 'error'}>
                    {user.status}
                  </Badge>
                </td>
                <td className="py-3.5 px-5 text-right">
                  <button
                    onClick={() => setDeactivateModalUser(user)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      user.status === 'Active'
                        ? 'border-red-200 text-red-600 hover:bg-red-50'
                        : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                    }`}
                  >
                    {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {filteredUsers.map((user) => (
          <div key={user.id} className="bg-white p-4 rounded-2xl border border-gray-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-[#17211E]">{user.name}</p>
                <p className="text-[#0B5D4B] font-semibold">{user.telegramHandle}</p>
              </div>
              <Badge variant={user.status === 'Active' ? 'green' : 'error'}>
                {user.status}
              </Badge>
            </div>
            <div className="flex justify-between text-[#66736E] pt-2 border-t border-gray-100 text-[11px]">
              <span>Regs: {user.eventsRegistered}</span>
              <span>Attended: {user.eventsAttended}</span>
            </div>
            <div className="pt-2 flex justify-end">
              <Button
                variant={user.status === 'Active' ? 'danger' : 'outline'}
                size="sm"
                onClick={() => setDeactivateModalUser(user)}
              >
                {user.status === 'Active' ? 'Deactivate' : 'Activate'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={!!deactivateModalUser}
        onClose={() => setDeactivateModalUser(null)}
        title="User Account Status Confirmation"
      >
        <div className="space-y-4 text-xs text-[#17211E]">
          <p className="leading-relaxed">
            Are you sure you want to{' '}
            <strong>
              {deactivateModalUser?.status === 'Active' ? 'Deactivate' : 'Activate'}
            </strong>{' '}
            user <strong className="text-[#0B5D4B]">{deactivateModalUser?.name}</strong> (
            {deactivateModalUser?.telegramHandle})?
          </p>
          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <Button variant="ghost" size="sm" onClick={() => setDeactivateModalUser(null)}>
              Cancel
            </Button>
            <Button
              variant={deactivateModalUser?.status === 'Active' ? 'danger' : 'primary'}
              size="sm"
              onClick={handleToggleStatus}
            >
              Confirm Status Change
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
