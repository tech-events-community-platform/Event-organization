import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { Event } from '../../types/event';
import type { AttendeeRosterItem, BadgeCode } from '../../types/attendance';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import {
  Search,
  ArrowLeft,
  CheckCircle2,
  QrCode,
  Award,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';

export const AttendeeListPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [roster, setRoster] = useState<AttendeeRosterItem[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Multi-selection state for bulk badge awarding
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);
  const [badgeToAward, setBadgeToAward] = useState<BadgeCode>('participant');
  const [isAwarding, setIsAwarding] = useState(false);
  const [awardSuccessMsg, setAwardSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    if (id) {
      const evt = await api.events.getById(id);
      setEvent(evt || null);
      const items = await api.roster.getByEventId(id);
      setRoster(items);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const filtered = roster.filter((att) => {
    const matchesSearch =
      att.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      att.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || att.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((a) => a.id));
    }
  };

  const handleToggleSelectOne = (rosterId: string) => {
    setSelectedIds((prev) =>
      prev.includes(rosterId) ? prev.filter((i) => i !== rosterId) : [...prev, rosterId]
    );
  };

  const handleConfirmAwardBadges = async () => {
    if (!id || selectedIds.length === 0) return;
    setIsAwarding(true);
    try {
      const res = await api.badges.bulkAwardBadges({
        eventId: id,
        attendeeRosterIds: selectedIds,
        badgeCode: badgeToAward,
        awardedByOrganizerId: user?.id || 'demo-organizer-001',
      });
      setIsAwardModalOpen(false);
      setSelectedIds([]);
      setAwardSuccessMsg(`Successfully awarded "${badgeToAward.toUpperCase()}" badge to ${res.awardedCount} attendees!`);
      setTimeout(() => setAwardSuccessMsg(null), 4000);
      loadData();
    } catch (e: any) {
      alert(e.message || 'Badge awarding failed.');
    } finally {
      setIsAwarding(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <Link
        to={`/organizer`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#63474D] hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#2D1F23]">Manage Attendees & Badges</h1>
            <Badge variant="primary">{roster.length} Registered</Badge>
          </div>
          <p className="text-xs text-[#756366]">
            {event ? event.title : 'Event'} • Multi-select checked-in attendees to bulk-assign Participant, Winner, or Speaker badges.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to={`/organizer/events/${id}/scanner`}>
            <Button variant="accent" size="sm" icon={<QrCode className="w-4 h-4" />}>
              Door Scanner
            </Button>
          </Link>
        </div>
      </div>

      {awardSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{awardSuccessMsg}</span>
        </div>
      )}

      {/* Bulk Action Bar when items selected */}
      {selectedIds.length > 0 && (
        <div className="bg-[#63474D] text-white p-4 rounded-2xl flex items-center justify-between shadow-md animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-bold">
            <Award className="w-4 h-4 text-[#FFA686]" />
            <span>{selectedIds.length} attendee(s) selected</span>
          </div>

          <Button
            onClick={() => setIsAwardModalOpen(true)}
            variant="accent"
            size="sm"
            icon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Assign Badge to Selected ({selectedIds.length})
          </Button>
        </div>
      )}

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-3xl border border-[#E8DDD7] shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756366]" />
          <input
            type="text"
            placeholder="Search attendee by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#FAF7F5] border border-[#E8DDD7] rounded-xl text-xs text-[#2D1F23] focus:outline-none focus:ring-2 focus:ring-[#63474D]"
          />
        </div>

        <div className="flex gap-2">
          {['All', 'Checked in', 'Registered'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-[#63474D] text-white shadow-xs'
                  : 'bg-[#FAF7F5] text-[#756366] hover:bg-[#F4EFEB]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Roster Table */}
      <div className="hidden md:block bg-white rounded-3xl border border-[#E8DDD7] overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#FAF7F5] border-b border-[#E8DDD7] text-[11px] font-bold uppercase tracking-wider text-[#756366]">
              <th className="py-3.5 px-4 w-12 text-center">
                <button onClick={handleToggleSelectAll} className="p-1 hover:text-[#63474D]">
                  {selectedIds.length === filtered.length && filtered.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-[#63474D]" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="py-3.5 px-4">Attendee Details</th>
              <th className="py-3.5 px-4">Status & Door Time</th>
              <th className="py-3.5 px-4">Awarded Badges</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8DDD7] text-xs text-[#2D1F23]">
            {filtered.map((att) => {
              const isSelected = selectedIds.includes(att.id);
              return (
                <tr
                  key={att.id}
                  className={`hover:bg-[#FAF7F5] transition-colors ${
                    isSelected ? 'bg-[#63474D]/5' : ''
                  }`}
                >
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => handleToggleSelectOne(att.id)}
                      className="p-1 text-[#756366] hover:text-[#63474D]"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#63474D]" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-[#2D1F23]">{att.name}</p>
                    <p className="text-[11px] text-[#756366]">{att.email}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      <Badge variant={att.status === 'Checked in' ? 'success' : 'gray'}>
                        {att.status}
                      </Badge>
                      {att.checkInTime && (
                        <p className="text-[10px] text-[#756366] font-mono">{att.checkInTime}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1.5">
                      {att.badges.map((b) => (
                        <Badge
                          key={b}
                          variant={
                            b === 'winner'
                              ? 'accent'
                              : b === 'speaker'
                              ? 'tertiary'
                              : b === 'participant'
                              ? 'secondary'
                              : 'primary'
                          }
                          className="capitalize text-[10px]"
                        >
                          {b}
                        </Badge>
                      ))}
                      {att.badges.length === 0 && (
                        <span className="text-[11px] text-[#756366] italic">None awarded yet</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden space-y-3">
        {filtered.map((att) => {
          const isSelected = selectedIds.includes(att.id);
          return (
            <div
              key={att.id}
              onClick={() => handleToggleSelectOne(att.id)}
              className={`bg-white p-4 rounded-2xl border shadow-xs space-y-2 text-xs transition-all cursor-pointer ${
                isSelected ? 'border-[#63474D] ring-2 ring-[#63474D]/20' : 'border-[#E8DDD7]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isSelected ? (
                    <CheckSquare className="w-4 h-4 text-[#63474D]" />
                  ) : (
                    <Square className="w-4 h-4 text-[#756366]" />
                  )}
                  <div>
                    <p className="font-bold text-[#2D1F23]">{att.name}</p>
                    <p className="text-[11px] text-[#756366]">{att.email}</p>
                  </div>
                </div>
                <Badge variant={att.status === 'Checked in' ? 'success' : 'gray'}>
                  {att.status}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-1 pt-1">
                {att.badges.map((b) => (
                  <Badge key={b} variant="secondary" className="capitalize text-[10px]">
                    {b}
                  </Badge>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bulk Badge Award Modal */}
      <Modal
        isOpen={isAwardModalOpen}
        onClose={() => setIsAwardModalOpen(false)}
        title={`Award Badge to ${selectedIds.length} Selected Attendees`}
      >
        <div className="space-y-4 text-xs">
          <p className="text-[#756366]">
            Select the credential badge you wish to assign. Selected attendees&apos; public profiles will update immediately.
          </p>

          <div className="space-y-2">
            {[
              { code: 'participant' as BadgeCode, label: 'Participant Badge', desc: 'Award to hands-on workshop coders & active contributors' },
              { code: 'winner' as BadgeCode, label: 'Winner Badge', desc: 'Award to hackathon 1st/2nd/3rd prize winners' },
              { code: 'speaker' as BadgeCode, label: 'Speaker Badge', desc: 'Award to session keynotes & lightning talk presenters' },
            ].map((opt) => (
              <label
                key={opt.code}
                onClick={() => setBadgeToAward(opt.code)}
                className={`p-3.5 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                  badgeToAward === opt.code
                    ? 'border-[#63474D] bg-[#63474D]/10'
                    : 'border-[#E8DDD7] hover:bg-[#FAF7F5]'
                }`}
              >
                <input
                  type="radio"
                  name="badge_select"
                  checked={badgeToAward === opt.code}
                  onChange={() => setBadgeToAward(opt.code)}
                  className="mt-0.5 text-[#63474D]"
                />
                <div>
                  <p className="font-bold text-[#2D1F23]">{opt.label}</p>
                  <p className="text-[11px] text-[#756366]">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>

          <div className="pt-2 flex gap-3">
            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={() => setIsAwardModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              fullWidth
              isLoading={isAwarding}
              onClick={handleConfirmAwardBadges}
            >
              Confirm & Award Badges
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
