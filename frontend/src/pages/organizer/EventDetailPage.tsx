import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import type { Event } from '../../types/event';
import type { AttendeeRosterItem, BadgeCode } from '../../types/attendance';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  Award,
  QrCode,
  BarChart3,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Search,
  ArrowLeft,
  Sparkles,
  Image,
  UserPlus,
  Mail,
  Phone,
  User,
  AlertCircle,
} from 'lucide-react';

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [event, setEvent] = useState<Event | null>(null);
  const [roster, setRoster] = useState<AttendeeRosterItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Search queries for both independent lists (Section 3)
  const [registeredSearch, setRegisteredSearch] = useState('');
  const [attendedSearch, setAttendedSearch] = useState('');

  // Expand / collapse states
  const [isRegisteredExpanded, setIsRegisteredExpanded] = useState(true);
  const [isAttendedExpanded, setIsAttendedExpanded] = useState(true);

  // Badge award modal / action state
  const [awardingAttendee, setAwardingAttendee] = useState<AttendeeRosterItem | null>(null);
  const [selectedBadgeCode, setSelectedBadgeCode] = useState<BadgeCode>('participant');
  const [isSubmittingAward, setIsSubmittingAward] = useState(false);
  const [awardSuccessMsg, setAwardSuccessMsg] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Manual Add Attendee Modal State
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [manualForm, setManualForm] = useState({ name: '', email: '', phone: '' });
  const [isSubmittingManualUser, setIsSubmittingManualUser] = useState(false);
  const [manualUserError, setManualUserError] = useState<string | null>(null);

  const fetchEventData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const evt = await api.events.getById(id);
      setEvent(evt || null);
      const rosterData = await api.roster.getByEventId(id);
      setRoster(rosterData);
    } catch (err) {
      console.error('Failed to load event details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventData();
  }, [id]);

  const handleCopyLink = () => {
    if (!event) return;
    const url = `${window.location.origin}/e/${event.shareLinkToken}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Manual Attendee Creation (Walk-in check-in)
  const handleAddManualAttendee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;
    if (!manualForm.name.trim() || !manualForm.email.trim()) {
      setManualUserError('Please provide both full name and email address.');
      return;
    }
    setIsSubmittingManualUser(true);
    setManualUserError(null);
    try {
      await api.checkIn.addManualAttendee({
        eventId: event.id,
        name: manualForm.name.trim(),
        email: manualForm.email.trim(),
        phone: manualForm.phone.trim() || undefined,
      });

      setAwardSuccessMsg(
        `Successfully added "${manualForm.name}" as an attended participant with verified badge!`
      );
      setTimeout(() => setAwardSuccessMsg(null), 5000);
      setIsAddUserModalOpen(false);
      setManualForm({ name: '', email: '', phone: '' });
      await fetchEventData();
    } catch (err: any) {
      setManualUserError(err.message || 'Failed to add attendee.');
    } finally {
      setIsSubmittingManualUser(false);
    }
  };

  // Section 7: Shared badge-award action
  const handleAwardBadge = async () => {
    if (!event || !awardingAttendee) return;
    setIsSubmittingAward(true);
    try {
      await api.badges.awardBadge({
        eventId: event.id,
        attendeeId: awardingAttendee.attendeeId || awardingAttendee.id,
        badgeCode: selectedBadgeCode,
      });

      setAwardSuccessMsg(
        `Successfully awarded "${selectedBadgeCode.toUpperCase()}" badge to ${awardingAttendee.name}!`
      );
      setTimeout(() => setAwardSuccessMsg(null), 4000);
      setAwardingAttendee(null);
      await fetchEventData();
    } catch (err: any) {
      alert(err.message || 'Failed to award badge.');
    } finally {
      setIsSubmittingAward(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-pulse py-8">
        <div className="h-8 bg-gray-200 rounded-xl w-48"></div>
        <div className="h-64 bg-gray-100 rounded-3xl"></div>
        <div className="h-96 bg-gray-100 rounded-3xl"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[#2D1F23]">Event Not Found</h2>
        <p className="text-xs text-gray-500">The requested event could not be located.</p>
        <Link to="/organizer">
          <Button variant="primary">Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const timeState = api.getEventTimeStatus(event);

  // Section 3: Registered list (everyone with registration row)
  const registeredList = roster.filter((item) => {
    const q = registeredSearch.toLowerCase().trim();
    if (!q) return true;
    return item.name.toLowerCase().includes(q) || item.email.toLowerCase().includes(q);
  });

  // Section 3: Attended list (non-voided check-in only)
  const attendedList = roster.filter((item) => {
    const isAttended = item.status === 'Checked in' || item.badges?.includes('attended');
    if (!isAttended) return false;
    const q = attendedSearch.toLowerCase().trim();
    if (!q) return true;
    return item.name.toLowerCase().includes(q) || item.email.toLowerCase().includes(q);
  });

  const totalAttendedCount = roster.filter((r) => r.status === 'Checked in' || r.badges?.includes('attended')).length;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24">
      {/* Back Navigation & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/organizer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#63474D] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => {
              setManualUserError(null);
              setIsAddUserModalOpen(true);
            }}
            variant="primary"
            size="sm"
            icon={<UserPlus className="w-4 h-4" />}
          >
            Add User Manually
          </Button>
          <Link to={`/organizer/check-in/${event.id}`}>
            <Button variant="accent" size="sm" icon={<QrCode className="w-4 h-4" />}>
              Door Check-in
            </Button>
          </Link>
          <Link to={`/organizer/reports/${event.id}`}>
            <Button variant="outline" size="sm" icon={<BarChart3 className="w-4 h-4" />}>
              View Report
            </Button>
          </Link>
        </div>
      </div>

      {/* Success Banner */}
      {awardSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-2xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{awardSuccessMsg}</span>
          </div>
        </div>
      )}

      {/* Event Details Card (Everything captured at creation) */}
      <div className="bg-white rounded-3xl border border-[#E8DDD7] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Poster Image */}
          {event.posterImageUrl || event.bannerUrl ? (
            <img
              src={event.posterImageUrl || event.bannerUrl}
              alt={event.title}
              className="w-full md:w-56 h-40 object-cover rounded-2xl border border-gray-200 shrink-0"
            />
          ) : (
            <div className="w-full md:w-56 h-40 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 shrink-0">
              <Image className="w-8 h-8" />
            </div>
          )}

          {/* Core Info */}
          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary" className="uppercase font-mono text-[10px]">
                {event.type}
              </Badge>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                  timeState === 'ongoing'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : timeState === 'upcoming'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                }`}
              >
                {timeState === 'ongoing' ? 'Ongoing Today' : timeState === 'upcoming' ? 'Upcoming' : 'Past Event'}
              </span>
              <span className="text-xs font-bold text-[#63474D]">
                {event.isPaid ? `${event.ticketPrice} ETB` : 'FREE ADMISSION'}
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#2D1F23]">
              {event.title}
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#63474D]" />
                {event.date}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#63474D]" />
                {event.time || `${event.startTime} - ${event.endTime}`}
              </span>
              <span className="flex items-center gap-1.5 sm:col-span-2">
                <MapPin className="w-4 h-4 text-[#63474D]" />
                {event.location} {event.venueName && `(${event.venueName})`}
              </span>
            </div>

            {/* Turnout Statistics Bar */}
            <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-gray-100 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Registered</span>
                <span className="font-bold text-base text-[#2D1F23]">{event.registeredCount || roster.length}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Checked In</span>
                <span className="font-bold text-base text-[#2A7B5F]">{totalAttendedCount}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Capacity</span>
                <span className="font-bold text-base text-[#63474D]">{event.capacity}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5 pt-2 border-t border-gray-100">
          <h3 className="font-serif font-bold text-sm text-[#2D1F23]">Description</h3>
          <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{event.description}</p>
        </div>

        {/* Shareable Link Box */}
        <div className="bg-[#FAF7F5] p-4 rounded-2xl border border-[#E8DDD7] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-[#63474D] block">Public Registration Link</span>
            <span className="font-mono text-xs text-gray-700 select-all truncate block max-w-md">
              {window.location.origin}/e/{event.shareLinkToken}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-semibold text-[#2D1F23] transition-colors cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-[#2A7B5F]" /> : <Copy className="w-3.5 h-3.5 text-[#AA767C]" />}
              <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
            </button>
            <Link
              to={`/e/${event.shareLinkToken}`}
              target="_blank"
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#63474D] text-white rounded-xl text-xs font-semibold hover:bg-[#523a3f] transition-colors"
            >
              <span>Preview</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Section 3: Two Collapsible & Independently Searchable Lists */}
      <div className="space-y-6">
        {/* List 1: ATTENDED (Non-voided CheckIn only) */}
        <div className="bg-white rounded-3xl border border-[#E8DDD7] overflow-hidden shadow-xs">
          <div
            onClick={() => setIsAttendedExpanded(!isAttendedExpanded)}
            className="p-5 bg-[#FAF7F5] border-b border-[#E8DDD7] flex items-center justify-between cursor-pointer select-none"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#2A7B5F]" />
              <h2 className="font-serif font-bold text-base text-[#2D1F23]">
                Attended List ({attendedList.length})
              </h2>
              <Badge variant="success" className="text-[10px]">
                Verified Door Check-ins
              </Badge>
            </div>
            <button type="button" className="p-1 text-gray-500">
              {isAttendedExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>

          {isAttendedExpanded && (
            <div className="p-5 space-y-4">
              {/* Toolbar: Client-side search bar and Add User Manually button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Filter attended by name or email..."
                    value={attendedSearch}
                    onChange={(e) => setAttendedSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#2D1F23] focus:outline-none focus:ring-2 focus:ring-[#63474D]"
                  />
                </div>

                <Button
                  onClick={() => {
                    setManualUserError(null);
                    setIsAddUserModalOpen(true);
                  }}
                  variant="primary"
                  size="sm"
                  icon={<UserPlus className="w-4 h-4" />}
                >
                  + Add User Manually
                </Button>
              </div>

              {attendedList.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  {roster.filter((r) => r.status === 'Checked in').length === 0
                    ? 'No attendees checked in at the door yet.'
                    : 'No attended records match your search filter.'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Attendee</th>
                        <th className="py-3 px-4">Check-in Time</th>
                        <th className="py-3 px-4">Current Badges</th>
                        <th className="py-3 px-4 text-right">Award Higher Badge</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {attendedList.map((att) => (
                        <tr key={att.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-[#2D1F23]">{att.name}</p>
                            <p className="text-[11px] text-gray-500">{att.email}</p>
                          </td>
                          <td className="py-3.5 px-4 text-gray-600 font-mono text-[11px]">
                            {att.checkInTime || 'Checked in'}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap gap-1">
                              {att.badges && att.badges.length > 0 ? (
                                att.badges.map((b) => (
                                  <span
                                    key={b}
                                    className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-gray-100 text-gray-800 border border-gray-200"
                                  >
                                    {b}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-400 italic">Attended</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => setAwardingAttendee(att)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#63474D] hover:bg-[#523a3f] text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                            >
                              <Award className="w-3.5 h-3.5 text-[#FFA686]" />
                              <span>Award Badge</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* List 2: REGISTERED (Everyone with a registration row) */}
        <div className="bg-white rounded-3xl border border-[#E8DDD7] overflow-hidden shadow-xs">
          <div
            onClick={() => setIsRegisteredExpanded(!isRegisteredExpanded)}
            className="p-5 bg-[#FAF7F5] border-b border-[#E8DDD7] flex items-center justify-between cursor-pointer select-none"
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-5 h-5 text-[#63474D]" />
              <h2 className="font-serif font-bold text-base text-[#2D1F23]">
                Registered List ({registeredList.length})
              </h2>
              <Badge variant="gray" className="text-[10px]">
                All Registrants
              </Badge>
            </div>
            <button type="button" className="p-1 text-gray-500">
              {isRegisteredExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>

          {isRegisteredExpanded && (
            <div className="p-5 space-y-4">
              {/* Client-side search bar */}
              <div className="relative max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter registrants by name or email..."
                  value={registeredSearch}
                  onChange={(e) => setRegisteredSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#2D1F23] focus:outline-none focus:ring-2 focus:ring-[#63474D]"
                />
              </div>

              {registeredList.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  {roster.length === 0 ? 'No registrations received yet.' : 'No registrants match your search filter.'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Attendee Name & Email</th>
                        <th className="py-3 px-4">Registration Date</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Registration Answers</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {registeredList.map((att) => {
                        const isCheckedIn = att.status === 'Checked in' || att.badges?.includes('attended');
                        return (
                          <tr key={att.id} className="hover:bg-gray-50/60 transition-colors">
                            <td className="py-3.5 px-4">
                              <p className="font-bold text-[#2D1F23]">{att.name}</p>
                              <p className="text-[11px] text-gray-500">{att.email}</p>
                            </td>
                            <td className="py-3.5 px-4 text-gray-600 font-mono text-[11px]">
                              {att.registrationDate}
                            </td>
                            <td className="py-3.5 px-4">
                              <Badge variant={isCheckedIn ? 'success' : 'gray'}>
                                {isCheckedIn ? 'Checked in' : 'Registered (Pending Door)'}
                              </Badge>
                            </td>
                            <td className="py-3.5 px-4 max-w-xs truncate text-gray-600">
                              {att.answers && Object.keys(att.answers).length > 0 ? (
                                <span title={JSON.stringify(att.answers)}>
                                  {Object.entries(att.answers)
                                    .map(([q, a]) => `${q}: ${a}`)
                                    .join('; ')}
                                </span>
                              ) : (
                                <span className="text-gray-400 italic">None</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Award Badge Modal (Shared action offering Participant / Winner / Speaker) */}
      {awardingAttendee && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            onClick={() => !isSubmittingAward && setAwardingAttendee(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-gray-100 z-10 space-y-5 animate-fade-in">
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#63474D]">
                  Award Verified Badge
                </span>
                <h3 className="font-serif font-bold text-xl text-[#2D1F23]">
                  {awardingAttendee.name}
                </h3>
                <p className="text-xs text-gray-500">
                  {event.title} • Floor status: Attended (Verified)
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-[#2D1F23] block">
                Select Higher-Tier Badge Type:
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { code: 'participant' as BadgeCode, label: 'Participant', icon: '🎖️' },
                  { code: 'winner' as BadgeCode, label: 'Winner', icon: '🏆' },
                  { code: 'speaker' as BadgeCode, label: 'Speaker', icon: '🎤' },
                ].map((b) => (
                  <button
                    key={b.code}
                    type="button"
                    onClick={() => setSelectedBadgeCode(b.code)}
                    className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      selectedBadgeCode === b.code
                        ? 'border-[#63474D] bg-[#63474D]/10 text-[#63474D] font-bold shadow-xs'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-2xl">{b.icon}</span>
                    <span className="text-xs">{b.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setAwardingAttendee(null)}
                disabled={isSubmittingAward}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <Button
                onClick={handleAwardBadge}
                isLoading={isSubmittingAward}
                variant="primary"
                size="sm"
                icon={<Sparkles className="w-4 h-4" />}
              >
                Confirm & Issue Badge
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Add User Modal (Name, Email, Phone -> Automatically Marked as Attended) */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            onClick={() => !isSubmittingManualUser && setIsAddUserModalOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-gray-100 z-10 space-y-5 animate-fade-in">
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#63474D]">
                  Walk-in Check-in
                </span>
                <h3 className="font-serif font-bold text-xl text-[#2D1F23]">
                  Add User Manually
                </h3>
                <p className="text-xs text-gray-500">
                  {event.title} • Automatically registered & marked as Attended
                </p>
              </div>
            </div>

            {manualUserError && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{manualUserError}</span>
              </div>
            )}

            <form onSubmit={handleAddManualAttendee} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2D1F23] mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#63474D]" />
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Abebe Bikila"
                  value={manualForm.name}
                  onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F5] border border-[#E8DDD7] rounded-xl text-xs text-[#2D1F23] focus:outline-none focus:ring-2 focus:ring-[#63474D]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D1F23] mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#63474D]" />
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. abebe@example.com"
                  value={manualForm.email}
                  onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F5] border border-[#E8DDD7] rounded-xl text-xs text-[#2D1F23] focus:outline-none focus:ring-2 focus:ring-[#63474D]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D1F23] mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#63474D]" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +251 91 234 5678"
                  value={manualForm.phone}
                  onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F5] border border-[#E8DDD7] rounded-xl text-xs text-[#2D1F23] focus:outline-none focus:ring-2 focus:ring-[#63474D]"
                />
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-[11px] text-emerald-900 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  Adding this attendee will instantly create their registration, record their door check-in, and award them the official <strong>Attended</strong> badge.
                </span>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  disabled={isSubmittingManualUser}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  isLoading={isSubmittingManualUser}
                  variant="primary"
                  size="sm"
                  icon={<UserPlus className="w-4 h-4" />}
                >
                  Add & Mark Attended
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
