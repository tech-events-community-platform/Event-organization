import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { Ticket } from '../../types/ticket';
import type { BadgeAward } from '../../types/attendance';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  QrCode,
  Calendar,
  Award,
  ArrowRight,
  ShieldCheck,
  MapPin,
} from 'lucide-react';

export const AttendeeDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [badges, setBadges] = useState<BadgeAward[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const userTickets = await api.registration.getAttendeeTickets(user.id);
        const userBadges = await api.badges.getAttendeeBadges(user.id);
        setTickets(userTickets);
        setBadges(userBadges);
      }
    };
    fetchData();
  }, [user]);

  const activeTicket = tickets.find((t) => t.status === 'Valid') || tickets[0];
  const stats = user?.stats || {
    meetupsCount: 8,
    workshopsCount: 4,
    hackathonsCount: 2,
    totalEventsAttended: 14,
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-[#63474D] text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FFA686]/20 border border-[#FFA686]/30 text-[#FFA686] text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Attendee Verified Account</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, {user?.name.split(' ')[0]} 👋
            </h1>
            <p className="text-xs text-[#E8DDD7]">
              {user?.email} • {stats.totalEventsAttended} Verified Events Attended
            </p>
          </div>

          <Link to="/app/profile">
            <Button variant="accent" size="sm" icon={<Award className="w-4 h-4" />}>
              View Public Credential Record
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Breakdown Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-[#E8DDD7] text-center shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-[#756366]">Total Turnout</span>
          <p className="font-serif text-2xl font-bold text-[#63474D]">{stats.totalEventsAttended}</p>
          <span className="text-[10px] text-[#756366]">Events</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-[#E8DDD7] text-center shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-[#756366]">Meetups</span>
          <p className="font-serif text-2xl font-bold text-[#AA767C]">{stats.meetupsCount}</p>
          <span className="text-[10px] text-[#756366]">Attended</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-[#E8DDD7] text-center shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-[#756366]">Workshops</span>
          <p className="font-serif text-2xl font-bold text-[#D6A184]">{stats.workshopsCount}</p>
          <span className="text-[10px] text-[#756366]">Completed</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-[#E8DDD7] text-center shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-[#756366]">Hackathons</span>
          <p className="font-serif text-2xl font-bold text-[#FFA686]">{stats.hackathonsCount}</p>
          <span className="text-[10px] text-[#756366]">Built</span>
        </div>
      </div>

      {/* Main Grid: Active Pass & Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active QR Pass Card */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-[#2D1F23] flex items-center gap-2">
              <QrCode className="w-5 h-5 text-[#63474D]" />
              Active Door Pass
            </h2>
            <Link to="/app/events" className="text-xs font-semibold text-[#63474D] hover:underline">
              All Tickets ({tickets.length}) →
            </Link>
          </div>

          {activeTicket ? (
            <div className="bg-white rounded-3xl p-6 border border-[#E8DDD7] shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#E8DDD7]">
                <Badge variant="success" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
                  Status: {activeTicket.status}
                </Badge>
                <span className="text-xs font-mono text-[#756366]">ID: {activeTicket.id}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                <div className="sm:col-span-2 space-y-3">
                  <Badge variant="primary" className="uppercase font-mono text-[10px]">
                    {activeTicket.eventType}
                  </Badge>
                  <h3 className="font-serif text-xl font-bold text-[#2D1F23]">
                    {activeTicket.eventTitle}
                  </h3>

                  <div className="space-y-1.5 text-xs text-[#756366]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#63474D]" />
                      <span>{activeTicket.eventDate} • {activeTicket.eventTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#63474D]" />
                      <span>{activeTicket.eventLocation}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#AA767C] pt-2">
                    Valid through the day after the event. Automatically adjusts if postponed.
                  </p>
                </div>

                <div className="bg-[#FAF7F5] p-4 rounded-2xl border border-[#E8DDD7] text-center space-y-2">
                  <QrCode className="w-28 h-28 mx-auto text-[#63474D]" />
                  <p className="text-[10px] text-[#756366] font-mono">Present at Venue Door</p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E8DDD7] flex justify-end">
                <Link to={`/app/ticket/${activeTicket.eventId}`}>
                  <Button variant="outline" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
                    Open Dedicated Pass View
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-3xl border border-[#E8DDD7] text-center space-y-2">
              <p className="text-xs text-[#756366]">No active event passes registered currently.</p>
              <Link to="/search">
                <Button variant="outline" size="sm">
                  Search Events
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Right Sidebar: Recent Badges */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-[#2D1F23] flex items-center gap-2">
              <Award className="w-5 h-5 text-[#63474D]" />
              Recent Badges
            </h2>
            <Link to="/app/profile" className="text-xs font-semibold text-[#63474D] hover:underline">
              View All ({badges.length}) →
            </Link>
          </div>

          <div className="space-y-3">
            {badges.slice(0, 3).map((b) => (
              <Link
                key={b.id}
                to={`/badge/${b.id}`}
                className="bg-white p-4 rounded-2xl border border-[#E8DDD7] hover:border-[#63474D] transition-all shadow-2xs space-y-2 block group"
              >
                <div className="flex items-center justify-between">
                  <Badge
                    variant={
                      b.badgeCode === 'winner'
                        ? 'accent'
                        : b.badgeCode === 'speaker'
                        ? 'tertiary'
                        : b.badgeCode === 'participant'
                        ? 'secondary'
                        : 'primary'
                    }
                    icon={<Award className="w-3 h-3" />}
                  >
                    {b.badgeLabel}
                  </Badge>
                  <span className="text-[10px] text-[#756366]">{b.eventDate}</span>
                </div>
                <h4 className="font-serif font-bold text-xs text-[#2D1F23] group-hover:text-[#63474D] line-clamp-1">
                  {b.eventTitle}
                </h4>
                <p className="text-[11px] text-[#AA767C]">Given by {b.issuerName}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
