import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { Event } from '../../types/event';
import type { AttendeeRosterItem, BadgeCode } from '../../types/attendance';
import {
  Search,
  Award,
  CheckCircle2,
  CheckSquare,
  Square,
  Sparkles,
  X,
  Check,
  Clock,
} from 'lucide-react';

export const AttendeeListPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>(id || '');
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [roster, setRoster] = useState<AttendeeRosterItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Single & Multi-selection state for badge awarding
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);
  const [targetAttendee, setTargetAttendee] = useState<AttendeeRosterItem | null>(null);

  // Badge Form State
  const [badgeToAward, setBadgeToAward] = useState<BadgeCode>('participant');
  const [badgeDomain, setBadgeDomain] = useState<string>('Frontend Architecture & Modern Web');
  const [endorsementNote, setEndorsementNote] = useState<string>('Demonstrated practical technical proficiency and completed hands-on project milestone.');
  const [isAwarding, setIsAwarding] = useState(false);
  const [awardSuccessMsg, setAwardSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const evts = await api.events.getAll();
        setEvents(evts);
        if (id) {
          setSelectedEventId(id);
        } else if (evts.length > 0 && !selectedEventId) {
          setSelectedEventId(evts[0].id);
        }
      } catch (err) {
        console.error('Failed to load events:', err);
      }
    };
    fetchEvents();
  }, [id]);

  const loadRoster = async (eventId: string) => {
    setLoading(true);
    try {
      const evt = await api.events.getById(eventId);
      setCurrentEvent(evt || null);
      const items = await api.roster.getByEventId(eventId);
      setRoster(items);
    } catch (e) {
      console.error('Failed to load roster:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedEventId) {
      loadRoster(selectedEventId);
    }
  }, [selectedEventId]);

  const handleSelectEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    setSelectedIds([]);
    navigate(`/organizer/badges/${eventId}`);
  };

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

  // Open modal for a specific individual attendee
  const handleOpenIndividualAward = (attendee: AttendeeRosterItem) => {
    setTargetAttendee(attendee);
    setSelectedIds([attendee.id]);
    setIsAwardModalOpen(true);
  };

  // Open modal for bulk selected attendees
  const handleOpenBulkAward = () => {
    if (selectedIds.length === 0) return;
    setTargetAttendee(null);
    setIsAwardModalOpen(true);
  };

  const handleConfirmAwardBadges = async () => {
    if (!selectedEventId || selectedIds.length === 0) return;
    setIsAwarding(true);
    try {
      const res = await api.badges.bulkAwardBadges({
        eventId: selectedEventId,
        attendeeRosterIds: selectedIds,
        badgeCode: badgeToAward,
        awardedByOrganizerId: user?.id || 'demo-organizer-001',
      });
      setIsAwardModalOpen(false);
      setSelectedIds([]);
      setTargetAttendee(null);
      setAwardSuccessMsg(`Successfully approved & issued "${badgeToAward.toUpperCase()}" badge (${badgeDomain}) to ${res.awardedCount} attendee(s)!`);
      setTimeout(() => setAwardSuccessMsg(null), 5000);
      loadRoster(selectedEventId);
    } catch (e: any) {
      alert(e.message || 'Badge approval failed.');
    } finally {
      setIsAwarding(false);
    }
  };

  const badgeTypeOptions: { code: BadgeCode; label: string; icon: string; desc: string }[] = [
    { code: 'attended', label: 'Attended Badge', icon: '🎟️', desc: 'Proof of presence & physical/virtual attendance verification' },
    { code: 'participant', label: 'Participant Badge', icon: '🎖️', desc: 'Active project submission & hands-on track completion' },
    { code: 'winner', label: 'Winner / Champion Badge', icon: '🏆', desc: 'Hackathon champion, top podium award, or category winner' },
    { code: 'speaker', label: 'Speaker / Keynote Badge', icon: '🎤', desc: 'Workshop instructor, keynote speaker, or expert panelist' },
  ];

  const domainOptions = [
    'Frontend Architecture & React',
    'AI & Machine Learning Engineering',
    'Backend Systems & Cloud Infrastructure',
    'Mobile Application Development',
    'UI/UX & Product Design',
    'Web3 & Smart Contract Engineering',
    'Open Source Ecosystem Contribution',
    'Founder & Product Pitch',
  ];

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      {/* 1. Header */}
      <div className="border-b border-gray-100 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#0e0622]">
              Give & Approve Badges
            </h1>
            <p className="text-xs text-gray-600 font-light mt-0.5">
              Select an event to review attendees, verify participation, and issue cryptographically signed organizer badges.
            </p>
          </div>
          <span className="text-xs font-semibold text-[#C84B18] bg-[#FAF7F5] px-3 py-1 rounded-xl border border-gray-200 shrink-0">
            {user?.organization || 'GDG Addis'} • Authorized Issuer
          </span>
        </div>
      </div>

      {/* Success Notification Banner */}
      {awardSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-2xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{awardSuccessMsg}</span>
          </div>
          <button onClick={() => setAwardSuccessMsg(null)} className="p-1 hover:text-emerald-950">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Event Scope Selector (Choose which event's attendees to manage) */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">
          Select Event to Manage Attendees
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {events.map((evt) => (
            <button
              key={evt.id}
              type="button"
              onClick={() => handleSelectEvent(evt.id)}
              className={`p-3.5 rounded-2xl text-left transition-all border cursor-pointer ${
                selectedEventId === evt.id
                  ? 'bg-[#fcf7f8] border-2 border-[#C84B18] shadow-xs'
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] uppercase font-mono font-bold text-[#C84B18]">
                <span>{evt.type}</span>
                <span className="text-gray-400 font-sans">{evt.date}</span>
              </div>
              <h3 className="font-serif font-bold text-sm text-[#0e0622] truncate mt-1">
                {evt.title}
              </h3>
              <p className="text-[11px] text-gray-500 font-light mt-0.5">
                {evt.checkedInCount} checked in / {evt.registeredCount} registered
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Attendee Management Workspace */}
      <div className="space-y-4 pt-2">
        {/* Controls Bar: Search, Filters & Bulk Action */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search attendee by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#0e0622] focus:outline-none focus:ring-2 focus:ring-[#C84B18]"
              />
            </div>

            <div className="flex gap-1">
              {['All', 'Checked in', 'Registered'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    statusFilter === st
                      ? 'bg-sheeba-purple text-white'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Bulk Award Action */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={handleOpenBulkAward}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C84B18] text-white text-xs font-bold hover:bg-[#b04014] transition-all shadow-xs cursor-pointer active:scale-98 animate-fade-in"
              >
                <Award className="w-4 h-4" />
                <span>Bulk Approve Badges ({selectedIds.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Attendees Master Table */}
        <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fcfafc] border-b border-gray-200 text-gray-700 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 w-10 text-center">
                    <button
                      type="button"
                      onClick={handleToggleSelectAll}
                      className="text-gray-400 hover:text-gray-700 cursor-pointer"
                    >
                      {selectedIds.length === filtered.length && filtered.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-[#C84B18]" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3.5 px-4">Attendee Name & Email</th>
                  <th className="py-3.5 px-4">Check-in Status</th>
                  <th className="py-3.5 px-4">Currently Awarded Badges</th>
                  <th className="py-3.5 px-4">Domain / Survey Info</th>
                  <th className="py-3.5 px-4 text-right">Badge Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400 font-light">
                      Loading attendee records...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400 font-light">
                      No attendees matched your filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((att) => {
                    const isChecked = selectedIds.includes(att.id);
                    const isCheckedIn = att.status === 'Checked in';

                    return (
                      <tr
                        key={att.id}
                        className={`transition-colors ${
                          isChecked ? 'bg-[#fcf7f8]' : 'hover:bg-gray-50/70'
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-4 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleSelectOne(att.id)}
                            className="text-gray-400 hover:text-gray-700 cursor-pointer"
                          >
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-[#C84B18]" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        {/* Attendee Info */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#FAF7F5] border border-gray-200 flex items-center justify-center font-bold text-xs text-[#0e0622]">
                              {att.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-serif font-bold text-sm text-[#0e0622]">{att.name}</p>
                              <p className="text-[11px] text-gray-500 font-light">{att.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Check-In Status */}
                        <td className="py-4 px-4">
                          {isCheckedIn ? (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1B4332]">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#1B4332]" />
                                Checked in
                              </span>
                              <p className="text-[10px] text-gray-400 flex items-center gap-1 font-mono">
                                <Clock className="w-3 h-3" /> {att.checkInTime || '09:15 AM'}
                              </p>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-400">
                              Registered (Pending Door Scan)
                            </span>
                          )}
                        </td>

                        {/* Badges Held */}
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1.5">
                            {att.badges && att.badges.length > 0 ? (
                              att.badges.map((b) => (
                                <span
                                  key={b}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold capitalize bg-gray-100 border border-gray-200 text-[#0e0622]"
                                >
                                  <span>{b === 'winner' ? '🏆' : b === 'speaker' ? '🎤' : b === 'participant' ? '🎖️' : '🎟️'}</span>
                                  <span>{b}</span>
                                </span>
                              ))
                            ) : (
                              <span className="text-[11px] text-gray-400 font-light italic">None issued yet</span>
                            )}
                          </div>
                        </td>

                        {/* Domain / Survey Track Answer */}
                        <td className="py-4 px-4 max-w-xs">
                          <p className="text-[11px] text-gray-600 font-light truncate" title={att.answers ? Object.values(att.answers)[0] : 'General Track'}>
                            {att.answers ? Object.values(att.answers)[0] : 'Frontend / Full Stack Engineering'}
                          </p>
                        </td>

                        {/* Action: Give Badge Button */}
                        <td className="py-4 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenIndividualAward(att)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#C84B18] text-[#C84B18] hover:bg-[#C84B18] hover:text-white text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                          >
                            <Award className="w-3.5 h-3.5" />
                            <span>Give Badge</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. Give / Approve Badge Modal */}
      {isAwardModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            onClick={() => setIsAwardModalOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          />

          <div className="relative bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-gray-100 z-10 space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#C84B18]">
                  <Award className="w-4 h-4" />
                  <span>Issue & Endorse Badge</span>
                </div>
                <h3 className="font-serif font-bold text-xl text-[#0e0622]">
                  {targetAttendee ? `Give Badge to ${targetAttendee.name}` : `Approve Badges for ${selectedIds.length} Attendees`}
                </h3>
                <p className="text-xs text-gray-500 font-light">
                  {currentEvent?.title || 'Selected Event'} • Permanent cryptographic profile credentials
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAwardModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step 1: Choose Badge Type */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block">
                1. Select Badge Tier / Type
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {badgeTypeOptions.map((opt) => (
                  <button
                    key={opt.code}
                    type="button"
                    onClick={() => setBadgeToAward(opt.code)}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                      badgeToAward === opt.code
                        ? 'bg-[#fcf7f8] border-2 border-[#C84B18] shadow-xs'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl select-none">{opt.icon}</span>
                      {badgeToAward === opt.code && (
                        <Check className="w-3.5 h-3.5 text-[#C84B18]" />
                      )}
                    </div>
                    <div className="mt-1.5">
                      <p className="font-serif font-bold text-xs text-[#0e0622]">{opt.label}</p>
                      <p className="text-[10px] text-gray-500 font-light mt-0.5 leading-snug">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Choose Technical Domain / Specialization Area */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block">
                2. Technical Track / Specialization Area
              </label>
              <select
                value={badgeDomain}
                onChange={(e) => setBadgeDomain(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-[#0e0622] focus:outline-none focus:ring-2 focus:ring-[#C84B18]"
              >
                {domainOptions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 3: Achievement Endorsement Note */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block">
                3. Organizer Achievement Endorsement (Public on Profile)
              </label>
              <textarea
                rows={2}
                value={endorsementNote}
                onChange={(e) => setEndorsementNote(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#0e0622] focus:outline-none focus:ring-2 focus:ring-[#C84B18]"
                placeholder="Describe milestone achievements, track completion, or project specifics..."
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAwardModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAwardBadges}
                disabled={isAwarding}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C84B18] hover:bg-[#b04014] text-white text-xs font-bold shadow-xs transition-all active:scale-98 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isAwarding ? 'Signing & Minting Badges...' : 'Approve & Issue Badge'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
