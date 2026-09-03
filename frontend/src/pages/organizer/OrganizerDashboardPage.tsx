import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { Event } from '../../types/event';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Calendar,
  Users,
  CheckCircle2,
  QrCode,
  PlusCircle,
  Copy,
  Check,
  MapPin,
  Clock,
  ChevronRight,
} from 'lucide-react';

export const OrganizerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const evts = await api.events.getAll(user?.id);
        setEvents(evts);
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.id]);

  const handleCopyLink = (token: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/e/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedId(token);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Section 2: Date-derived event status (Ongoing / Upcoming / Past)
  const getEventTimeState = (evt: Event): 'ongoing' | 'upcoming' | 'past' => {
    return api.getEventTimeStatus(evt);
  };

  // Section 2: Sort order
  // 1. Ongoing events first
  // 2. Upcoming events next, soonest date first
  // 3. Past events last, most recently ended first
  const sortedEvents = [...events].sort((a, b) => {
    const stateA = getEventTimeState(a);
    const stateB = getEventTimeState(b);

    const stateRank = { ongoing: 1, upcoming: 2, past: 3 };
    if (stateRank[stateA] !== stateRank[stateB]) {
      return stateRank[stateA] - stateRank[stateB];
    }

    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();

    if (stateA === 'upcoming') {
      return dateA - dateB; // Soonest first
    }

    if (stateA === 'past') {
      return dateB - dateA; // Most recently ended first
    }

    return dateA - dateB;
  });

  // Section 2: Count label formatting
  const getCountLabel = (evt: Event, state: 'ongoing' | 'upcoming' | 'past') => {
    const reg = evt.registeredCount || 0;
    const checked = evt.checkedInCount || 0;
    if (state === 'upcoming') {
      return `${reg} registered`;
    }
    if (state === 'ongoing') {
      return `${reg} registered · ${checked} checked in`;
    }
    return `${reg} registered · ${checked} attended`;
  };

  const totalEvents = events.length;
  const activeEvents = events.filter((e) => getEventTimeState(e) === 'ongoing' || getEventTimeState(e) === 'upcoming').length;
  const totalRegistrations = events.reduce((acc, curr) => acc + (curr.registeredCount || 0), 0);
  const totalCheckIns = events.reduce((acc, curr) => acc + (curr.checkedInCount || 0), 0);

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div className="space-y-1">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2D1F23]">
            {user?.organization || 'GDG Addis'}
          </h1>
          <p className="text-xs text-gray-500 font-light">
            Organizer Dashboard • Verified attendance, door check-in, and authentic badge issuance.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link to="/organizer/check-in">
            <Button variant="accent" size="sm" icon={<QrCode className="w-4 h-4" />}>
              Door Check-in
            </Button>
          </Link>
          <Link to="/organizer/events/create">
            <Button variant="primary" size="sm" icon={<PlusCircle className="w-4 h-4" />}>
              Create Event
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Metric Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Events', value: totalEvents, icon: Calendar, color: 'text-[#63474D]' },
          { label: 'Upcoming / Active', value: activeEvents, icon: Users, color: 'text-[#AA767C]' },
          { label: 'Total Registrations', value: totalRegistrations, icon: Users, color: 'text-[#D6A184]' },
          { label: 'Verified Attendances', value: totalCheckIns, icon: CheckCircle2, color: 'text-[#2A7B5F]' },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-[#E8DDD7] shadow-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#756366]">{stat.label}</span>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="font-serif text-2xl sm:text-3xl font-extrabold text-[#2D1F23]">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* 3. Section 2 Events Cards List */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-[#2D1F23]">Events</h2>
          <span className="text-xs text-gray-500 font-medium">
            {sortedEvents.length} event{sortedEvents.length === 1 ? '' : 's'} (Sorted: Ongoing → Upcoming → Past)
          </span>
        </div>

        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-gray-100 rounded-2xl"></div>
            ))}
          </div>
        ) : sortedEvents.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 border border-[#E8DDD7] text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-[#63474D]/10 text-[#63474D] flex items-center justify-center mx-auto">
              <Calendar className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-lg text-[#2D1F23]">No Events Created Yet</h3>
              <p className="text-xs text-[#756366] max-w-sm mx-auto">
                Create your first single-day workshop, hackathon, or meetup to accept registrations, check people in, and award badges.
              </p>
            </div>
            <Link to="/organizer/events/create">
              <Button variant="primary" icon={<PlusCircle className="w-4 h-4" />}>
                Create Your First Event
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedEvents.map((evt) => {
              const state = getEventTimeState(evt);
              const countLabel = getCountLabel(evt, state);

              return (
                <div
                  key={evt.id}
                  onClick={() => navigate(`/organizer/events/${evt.id}`)}
                  className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs hover:border-[#63474D] hover:shadow-xs transition-all space-y-3 cursor-pointer group"
                >
                  {/* Top Row: Type, State Badge, Counts, and Share Link */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <Badge variant="primary" className="uppercase font-mono text-[10px]">
                        {evt.type}
                      </Badge>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          state === 'ongoing'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                            : state === 'upcoming'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}
                      >
                        {state === 'ongoing' ? '● Ongoing Today' : state === 'upcoming' ? 'Upcoming' : 'Past Event'}
                      </span>
                      <span className="text-xs font-bold text-[#63474D] ml-1">
                        {countLabel}
                      </span>
                    </div>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={(e) => handleCopyLink(evt.shareLinkToken, e)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF7F5] border border-gray-200 hover:bg-gray-100 rounded-xl text-xs font-semibold text-[#2D1F23] transition-colors cursor-pointer"
                        title="Copy Registration Link"
                      >
                        {copiedId === evt.shareLinkToken ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#2A7B5F]" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-[#AA767C]" />
                            <span>Share Link</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Title & Metadata */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <h3 className="font-serif font-bold text-lg text-[#2D1F23] group-hover:text-[#63474D] transition-colors truncate">
                        {evt.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 font-light">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#63474D]" />
                          {evt.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#63474D]" />
                          {evt.time || `${evt.startTime} - ${evt.endTime}`}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#63474D]" />
                          {evt.location}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center text-xs font-semibold text-[#63474D] group-hover:translate-x-1 transition-transform self-center">
                      <span>View Details</span>
                      <ChevronRight className="w-4 h-4 ml-0.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
