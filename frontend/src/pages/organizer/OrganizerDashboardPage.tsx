import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { Event } from '../../types/event';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Calendar,
  Users,
  QrCode,
  CheckCircle2,
  PlusCircle,
  BarChart3,
  ShieldCheck,
  Copy,
  Check,
  ExternalLink,
  Award,
} from 'lucide-react';

export const OrganizerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const evts = await api.events.getAll();
      setEvents(evts);
    };
    fetchData();
  }, []);

  const totalEvents = events.length;
  const activeEvents = events.filter((e) => e.status === 'open').length;
  const totalRegistrations = events.reduce((acc, curr) => acc + curr.registeredCount, 0);
  const totalCheckIns = events.reduce((acc, curr) => acc + curr.checkedInCount, 0);

  const handleCopyLink = (token: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/e/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedId(token);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Badge variant="secondary" icon={<ShieldCheck className="w-3 h-3" />}>
            {user?.organization || 'GDG Addis'}
          </Badge>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#2D1F23]">
            Organizer Dashboard
          </h1>
          <p className="text-xs text-[#756366]">
            Manage single-day events, shareable registration links, door check-ins, and sponsor reports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/organizer/events/evt_react_workshop_2026/scanner">
            <Button variant="accent" size="sm" icon={<QrCode className="w-4 h-4" />}>
              Door Scanner
            </Button>
          </Link>
          <Link to="/organizer/events/create">
            <Button variant="primary" size="sm" icon={<PlusCircle className="w-4 h-4" />}>
              Create Event
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Events', value: totalEvents, icon: Calendar, color: 'text-[#63474D]' },
          { label: 'Active Registrations', value: activeEvents, icon: Users, color: 'text-[#AA767C]' },
          { label: 'Total Registrations', value: totalRegistrations, icon: Users, color: 'text-[#D6A184]' },
          { label: 'Verified Check-ins', value: totalCheckIns, icon: CheckCircle2, color: 'text-[#2A7B5F]' },
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

      {/* Events Roster Table & Quick Operations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-[#2D1F23]">Active & Hosted Events</h2>
          <Link to="/organizer/events" className="text-xs font-semibold text-[#63474D] hover:underline">
            View All ({events.length}) →
          </Link>
        </div>

        <div className="space-y-3">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="bg-white rounded-3xl p-6 border border-[#E8DDD7] shadow-xs hover:border-[#63474D] transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E8DDD7]">
                <div className="flex items-center gap-2">
                  <Badge variant="primary" className="uppercase font-mono text-[10px]">
                    {evt.type}
                  </Badge>
                  <Badge variant={evt.status === 'open' ? 'success' : 'gray'}>
                    {evt.status === 'open' ? 'Registration Open' : evt.status}
                  </Badge>
                  <span className="text-xs font-bold text-[#63474D]">
                    {evt.isPaid ? `${evt.ticketPrice} ETB` : 'FREE'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleCopyLink(evt.shareLinkToken, e)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF7F5] border border-[#E8DDD7] hover:bg-[#F4EFEB] rounded-xl text-xs font-semibold text-[#63474D] transition-colors"
                  >
                    {copiedId === evt.shareLinkToken ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#2A7B5F]" />
                        <span>Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Share Link</span>
                      </>
                    )}
                  </button>
                  <Link
                    to={`/e/${evt.shareLinkToken}`}
                    target="_blank"
                    className="p-1 text-[#756366] hover:text-[#63474D]"
                    title="Preview Public Registration Form"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-serif font-bold text-lg text-[#2D1F23]">{evt.title}</h3>
                  <p className="text-xs text-[#756366]">
                    {evt.date} • {evt.time} • {evt.location}
                  </p>
                  <p className="text-xs font-semibold text-[#63474D]">
                    Turnout: {evt.checkedInCount} checked in of {evt.registeredCount} registered (Capacity: {evt.capacity})
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
                  <Link to={`/organizer/events/${evt.id}/scanner`}>
                    <Button variant="accent" size="sm" icon={<QrCode className="w-3.5 h-3.5" />}>
                      Check-in Console
                    </Button>
                  </Link>
                  <Link to={`/organizer/events/${evt.id}/attendees`}>
                    <Button variant="outline" size="sm" icon={<Award className="w-3.5 h-3.5" />}>
                      Manage Badges
                    </Button>
                  </Link>
                  <Link to={`/organizer/events/${evt.id}/report`}>
                    <Button variant="outline" size="sm" icon={<BarChart3 className="w-3.5 h-3.5" />}>
                      Sponsor Report
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
