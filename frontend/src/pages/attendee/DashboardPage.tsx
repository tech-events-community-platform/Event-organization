import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { Ticket } from '../../types/ticket';
import type { BadgeAward } from '../../types/attendance';
import {
  Award,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  Clock,
  QrCode,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

export const AttendeeDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [badges, setBadges] = useState<BadgeAward[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (user) {
          const [userTickets, userBadges] = await Promise.all([
            api.registration.getAttendeeTickets(user.id),
            api.badges.getAttendeeBadges(user.id),
          ]);
          setTickets(userTickets);
          setBadges(userBadges);
        }
      } catch (err) {
        console.error('Failed to load attendee data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const stats = user?.stats || {
    meetupsCount: 8,
    workshopsCount: 4,
    hackathonsCount: 2,
    totalEventsAttended: 14,
  };

  const getEventEmoji = (type?: string) => {
    const t = (type || '').toLowerCase();
    if (t.includes('hackathon')) return '💻';
    if (t.includes('workshop')) return '🛠️';
    if (t.includes('meetup')) return '🤝';
    return '📅';
  };

  const toggleExpand = (id: string) => {
    setExpandedEventId(expandedEventId === id ? null : id);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* 1. Formal Attendee Credential Intro */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-gray-100 pb-4">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-sheeba-dark">
              {user?.name || 'Abebe Kebede'}
            </h1>
            <p className="text-sm text-gray-500 font-light mt-0.5">
              Verified Event Participation Record • Member since {user?.memberSince || 'August 2026'}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-sheeba-purple font-medium">
            <ShieldCheck className="w-4 h-4 text-[#2A7B5F]" />
            <span>Official Sheeba Credential ID: {user?.id ? user.id.slice(0, 8) : 'SHB-8921'}</span>
          </div>
        </div>

        {/* Clean Numerical Stats - Free of loud box clutter */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-2">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">Total Turnout</span>
            <p className="font-serif text-3xl font-bold text-sheeba-dark mt-0.5">{stats.totalEventsAttended}</p>
            <span className="text-xs text-gray-500 font-light">Verified Events</span>
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">Meetups 🤝</span>
            <p className="font-serif text-3xl font-bold text-sheeba-purple mt-0.5">{stats.meetupsCount}</p>
            <span className="text-xs text-gray-500 font-light">Evenings Attended</span>
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">Workshops 🛠️</span>
            <p className="font-serif text-3xl font-bold text-sheeba-rose mt-0.5">{stats.workshopsCount}</p>
            <span className="text-xs text-gray-500 font-light">Hands-on Labs</span>
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">Hackathons 💻</span>
            <p className="font-serif text-3xl font-bold text-sheeba-pink mt-0.5">{stats.hackathonsCount}</p>
            <span className="text-xs text-gray-500 font-light">Prototypes Built</span>
          </div>
        </div>
      </div>

      {/* 2. Verified Badges Shelf */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-sheeba-dark flex items-center gap-2">
            <Award className="w-5 h-5 text-sheeba-purple" />
            Verified Credential Badges
          </h2>
          {user?.id && (
            <Link
              to={`/profile/${user.id}`}
              className="text-xs font-semibold text-sheeba-purple hover:underline inline-flex items-center gap-1"
            >
              <span>Public Credential Link</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>

        {badges.length === 0 && !loading ? (
          <div className="py-6 text-center text-sm text-gray-500 font-light border border-dashed border-gray-200 rounded-2xl">
            No badges awarded yet. Check in at upcoming events to unlock permanent participation badges.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {badges.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-2xl border border-gray-200/80 bg-white hover:border-sheeba-purple transition-all duration-200 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-sm text-sheeba-dark">{b.badgeLabel}</span>
                  <span className="w-2 h-2 rounded-full bg-sheeba-pink"></span>
                </div>
                <p className="text-xs text-sheeba-rose font-medium truncate">{b.eventTitle}</p>
                <p className="text-[11px] text-gray-400 font-light">Issued by {b.issuerName}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. The Core Event Attendance Showcase (One Long Formal List Box) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-sheeba-dark">
              Event Attendance Record
            </h2>
            <p className="text-xs text-gray-500 font-light mt-0.5">
              Comprehensive list of hackathons, workshops, and meetups you registered and checked in for. Click any row for details.
            </p>
          </div>
          <Link
            to="/app/events"
            className="text-xs font-semibold text-sheeba-purple hover:underline"
          >
            View All Tickets ({tickets.length}) →
          </Link>
        </div>

        {/* Single Unified Event Table Container */}
        <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-xs divide-y divide-gray-100">
          {loading ? (
            <div className="p-8 text-center text-sm text-gray-400 animate-pulse font-light">
              Loading verified attendance records...
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <p className="font-serif text-base font-bold text-sheeba-dark">No event records found</p>
              <p className="text-xs text-gray-500 font-light max-w-sm mx-auto">
                Discover upcoming hackathons and meetups on Sheeba to start building your verified event timeline.
              </p>
              <Link
                to="/search"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sheeba-purple text-white text-xs font-semibold hover:bg-sheeba-indigo transition-colors"
              >
                Browse Upcoming Events
              </Link>
            </div>
          ) : (
            tickets.map((t) => {
              const isExpanded = expandedEventId === t.id;
              const emoji = getEventEmoji(t.eventType);
              const isCheckedIn = t.status === 'Checked in';

              return (
                <div key={t.id} className="transition-colors hover:bg-gray-50/70">
                  {/* Summary Row */}
                  <div
                    onClick={() => toggleExpand(t.id)}
                    className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none"
                  >
                    {/* Left: Emoji + Title + Organizer */}
                    <div className="flex items-center gap-4 min-w-0">
                      <span
                        className="text-3xl sm:text-4xl shrink-0 transition-transform group-hover:scale-110"
                        title={t.eventType}
                      >
                        {emoji}
                      </span>
                      <div className="min-w-0 space-y-0.5">
                        <h3 className="font-serif font-bold text-base sm:text-lg text-sheeba-dark truncate">
                          {t.eventTitle}
                        </h3>
                        <p className="text-xs text-gray-500 font-light flex items-center gap-2">
                          <span className="capitalize text-sheeba-rose font-medium">{t.eventType}</span>
                          <span>•</span>
                          <span>{t.eventDate}</span>
                        </p>
                      </div>
                    </div>

                    {/* Middle/Right: Location + Status */}
                    <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                      <div className="hidden md:flex flex-col text-right">
                        <span className="text-xs text-gray-700 font-medium truncate max-w-[200px]">
                          {t.eventLocation.split(',')[0]}
                        </span>
                        <span className="text-[11px] text-gray-400 font-light">{t.eventTime}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isCheckedIn ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#2A7B5F]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Verified Attended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-sheeba-purple">
                            <QrCode className="w-3.5 h-3.5" />
                            Active Pass
                          </span>
                        )}

                        <div className="text-gray-400 p-1">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Detail Panel */}
                  {isExpanded && (
                    <div className="px-5 pb-6 pt-2 bg-[#fbf9fc] border-t border-gray-100 text-xs space-y-4 animate-fade-in">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                        <div className="space-y-1">
                          <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Date & Schedule
                          </span>
                          <p className="font-semibold text-sheeba-dark">{t.eventDate}</p>
                          <p className="text-gray-500 font-light flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {t.eventTime}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> Venue & Location
                          </span>
                          <p className="font-semibold text-sheeba-dark">{t.eventLocation}</p>
                          <p className="text-gray-500 font-light">Addis Ababa, Ethiopia</p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Pass Credential
                          </span>
                          <p className="font-mono text-xs font-semibold text-sheeba-dark">Pass #{t.id}</p>
                          <p className="text-gray-500 font-light">
                            Status: <strong className={isCheckedIn ? 'text-[#2A7B5F]' : 'text-sheeba-purple'}>{t.status}</strong>
                          </p>
                        </div>
                      </div>

                      {/* Action Shortcuts */}
                      <div className="pt-3 border-t border-gray-200/60 flex items-center justify-between">
                        <span className="text-[11px] text-gray-400 font-light">
                          Signed cryptographic pass code: <code className="font-mono text-[10px] text-gray-600">{t.qrToken.slice(0, 16)}...</code>
                        </span>
                        <Link
                          to={`/app/ticket/${t.eventId}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-sheeba-dark hover:bg-gray-50 font-semibold text-xs transition-colors shadow-2xs"
                        >
                          <QrCode className="w-3.5 h-3.5 text-sheeba-pink" />
                          <span>Open Full QR Ticket Pass</span>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
