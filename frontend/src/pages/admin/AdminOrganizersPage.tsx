import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { AdminOrganizerRecord } from '../../data/mockAdminData';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Search, Building2, ShieldCheck } from 'lucide-react';

export const AdminOrganizersPage: React.FC = () => {
  const [organizers, setOrganizers] = useState<AdminOrganizerRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrg, setSelectedOrg] = useState<AdminOrganizerRecord | null>(null);
  const [deactivateOrg, setDeactivateOrg] = useState<AdminOrganizerRecord | null>(null);

  useEffect(() => {
    const fetchOrgs = async () => {
      const data = await api.getAdminOrganizers();
      setOrganizers(data);
    };
    fetchOrgs();
  }, []);

  const handleToggleOrganizerStatus = async () => {
    if (!deactivateOrg) return;
    const updated = await api.toggleOrganizerStatus(deactivateOrg.id);
    setOrganizers(updated);
    setDeactivateOrg(null);
  };

  const filteredOrgs = organizers.filter((o) => {
    return (
      o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.telegramHandle.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-[#17211E]">Organizer Management</h1>
        <p className="text-xs text-[#66736E]">Manage event organizers on the Sheba platform.</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search organizers by community name or @telegram handle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F7F8F5] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B5D4B]"
          />
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F7F8F5] border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-[#66736E]">
              <th className="py-3.5 px-5">Organizer</th>
              <th className="py-3.5 px-5">Telegram Handle</th>
              <th className="py-3.5 px-5">Events Hosted</th>
              <th className="py-3.5 px-5">Total Regs</th>
              <th className="py-3.5 px-5">Total Scans</th>
              <th className="py-3.5 px-5">Status</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs text-[#17211E]">
            {filteredOrgs.map((org) => (
              <tr key={org.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="py-3.5 px-5 font-bold text-[#17211E] flex items-center gap-1.5">
                  <span>{org.name}</span>
                  {org.verified && <ShieldCheck className="w-4 h-4 text-[#0B5D4B]" />}
                </td>
                <td className="py-3.5 px-5 font-semibold text-[#0B5D4B]">{org.telegramHandle}</td>
                <td className="py-3.5 px-5 font-bold">{org.eventsCount}</td>
                <td className="py-3.5 px-5 font-bold">{org.totalRegistrations}</td>
                <td className="py-3.5 px-5 font-bold text-[#238B6E]">{org.totalCheckIns}</td>
                <td className="py-3.5 px-5">
                  <Badge variant={org.status === 'Active' ? 'green' : 'error'}>
                    {org.status}
                  </Badge>
                </td>
                <td className="py-3.5 px-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedOrg(org)}>
                      View Details
                    </Button>
                    <button
                      onClick={() => setDeactivateOrg(org)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                        org.status === 'Active'
                          ? 'border-red-200 text-red-600 hover:bg-red-50'
                          : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                      }`}
                    >
                      {org.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {filteredOrgs.map((org) => (
          <div key={org.id} className="bg-white p-4 rounded-2xl border border-gray-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-[#17211E]">{org.name}</p>
                <p className="text-[#0B5D4B] font-semibold">{org.telegramHandle}</p>
              </div>
              <Badge variant={org.status === 'Active' ? 'green' : 'error'}>
                {org.status}
              </Badge>
            </div>
            <div className="flex justify-between text-[#66736E] pt-2 border-t border-gray-100 text-[11px]">
              <span>Events: {org.eventsCount}</span>
              <span>Scans: {org.totalCheckIns}</span>
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedOrg(org)}>
                View
              </Button>
              <Button
                variant={org.status === 'Active' ? 'danger' : 'outline'}
                size="sm"
                onClick={() => setDeactivateOrg(org)}
              >
                {org.status === 'Active' ? 'Deactivate' : 'Activate'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Organizer Detail Modal */}
      <Modal
        isOpen={!!selectedOrg}
        onClose={() => setSelectedOrg(null)}
        title="Organizer Platform Profile"
      >
        <div className="space-y-4 text-xs text-[#17211E]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#0B5D4B] text-[#D6A84F] flex items-center justify-center font-bold">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#17211E]">{selectedOrg?.name}</h3>
              <p className="text-[#0B5D4B] font-semibold">{selectedOrg?.telegramHandle}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-[#F7F8F5] p-3 rounded-xl">
              <span className="text-[#66736E] text-[10px] uppercase font-bold block">Joined Platform</span>
              <span className="font-semibold text-[#17211E]">{selectedOrg?.joinedDate}</span>
            </div>
            <div className="bg-[#F7F8F5] p-3 rounded-xl">
              <span className="text-[#66736E] text-[10px] uppercase font-bold block">Events Hosted</span>
              <span className="font-bold text-[#0B5D4B]">{selectedOrg?.eventsCount} Events</span>
            </div>
            <div className="bg-[#F7F8F5] p-3 rounded-xl">
              <span className="text-[#66736E] text-[10px] uppercase font-bold block">Total Registrations</span>
              <span className="font-bold text-[#17211E]">{selectedOrg?.totalRegistrations}</span>
            </div>
            <div className="bg-[#F7F8F5] p-3 rounded-xl">
              <span className="text-[#66736E] text-[10px] uppercase font-bold block">Door Check-ins</span>
              <span className="font-bold text-[#238B6E]">{selectedOrg?.totalCheckIns}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <Button variant="primary" size="sm" onClick={() => setSelectedOrg(null)}>
              Close Profile
            </Button>
          </div>
        </div>
      </Modal>

      {/* Deactivation Modal */}
      <Modal
        isOpen={!!deactivateOrg}
        onClose={() => setDeactivateOrg(null)}
        title="Organizer Status Confirmation"
      >
        <div className="space-y-4 text-xs text-[#17211E]">
          <p>
            Are you sure you want to{' '}
            <strong>{deactivateOrg?.status === 'Active' ? 'Deactivate' : 'Activate'}</strong>{' '}
            organizer <strong className="text-[#0B5D4B]">{deactivateOrg?.name}</strong>?
          </p>
          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <Button variant="ghost" size="sm" onClick={() => setDeactivateOrg(null)}>
              Cancel
            </Button>
            <Button
              variant={deactivateOrg?.status === 'Active' ? 'danger' : 'primary'}
              size="sm"
              onClick={handleToggleOrganizerStatus}
            >
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
