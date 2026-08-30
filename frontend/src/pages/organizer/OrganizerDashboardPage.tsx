import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { Event } from '../../types/event';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EventDetailModal } from '../../components/organizer/EventDetailModal';
import {
  QrCode,
  PlusCircle,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';

export const OrganizerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedModalEvent, setSelectedModalEvent] = useState<Event | null>(null);

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
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* 1. Header (Just Name: GDG Addis) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div className="space-y-1">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-sheeba-dark">
            {user?.organization || 'GDG Addis'}
          </h1>
          <p className="text-xs text-gray-500 font-light">
            Manage single-day events, shareable registration links, door check-ins, and reports.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
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

      {/* 2. Small, Precise Centered Metric Table */}
      <div className="flex justify-center w-full pt-1">
        <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-2xs w-full max-w-2xl">
          <table className="w-full text-center text-xs">
            <thead className="bg-[#fcfafc] border-b border-gray-200 text-gray-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Total Events</th>
                <th className="py-3 px-4">Active Registrations</th>
                <th className="py-3 px-4">Total Registrations</th>
                <th className="py-3 px-4">Verified Check-ins</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-3.5 px-4 font-serif font-bold text-lg text-sheeba-dark">{totalEvents}</td>
                <td className="py-3.5 px-4 font-serif font-bold text-lg text-sheeba-purple">{activeEvents}</td>
                <td className="py-3.5 px-4 font-serif font-bold text-lg text-[#C84B18]">{totalRegistrations}</td>
                <td className="py-3.5 px-4 font-serif font-bold text-lg text-[#1b4332]">{totalCheckIns}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Events List Overview */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-sheeba-dark">Active & Hosted Events</h2>
          <Link to="/organizer/events" className="text-xs font-semibold text-[#C84B18] hover:underline">
            View All ({events.length}) →
          </Link>
        </div>

        <div className="space-y-3">
          {events.map((evt) => (
            <div
              key={evt.id}
              onClick={() => setSelectedModalEvent(evt)}
              className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs hover:border-[#C84B18] hover:shadow-xs transition-all space-y-3 cursor-pointer group"
            >
              {/* Top Row: Event Type, Status, Fee, and Copy Share Link */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Badge variant="primary" className="uppercase font-mono text-[10px]">
                    {evt.type}
                  </Badge>
                  <Badge variant={evt.status === 'open' ? 'success' : 'gray'}>
                    {evt.status === 'open' ? 'Registration Open' : evt.status}
                  </Badge>
                  <span className="text-xs font-bold text-sheeba-purple">
                    {evt.isPaid ? `${evt.ticketPrice} ETB` : 'FREE'}
                  </span>
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={(e) => handleCopyLink(evt.shareLinkToken, e)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF7F5] border border-gray-200 hover:bg-gray-100 rounded-xl text-xs font-semibold text-sheeba-dark transition-colors cursor-pointer"
                  >
                    {copiedId === evt.shareLinkToken ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#2A7B5F]" />
                        <span>Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#C84B18]" />
                        <span>Copy Share Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Event Name & 4 Operation Text Links in Deep Orange */}
              <div className="space-y-2">
                <h3 className="font-serif font-bold text-lg text-sheeba-dark group-hover:text-[#C84B18] transition-colors">
                  {evt.title}
                </h3>

                {/* 4 Clean Underlined Action Links in Deep Orange */}
                <div
                  className="flex flex-wrap items-center gap-4 text-xs font-semibold pt-0.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Link
                    to={`/organizer/events/${evt.id}/scanner`}
                    className="text-[#C84B18] hover:underline"
                  >
                    Check-in Console
                  </Link>
                  <span className="text-gray-300">•</span>
                  <Link
                    to={`/organizer/events/${evt.id}/attendees`}
                    className="text-[#C84B18] hover:underline"
                  >
                    Manage Badges
                  </Link>
                  <span className="text-gray-300">•</span>
                  <Link
                    to={`/organizer/reports/${evt.id}`}
                    className="text-[#C84B18] hover:underline"
                  >
                    Report
                  </Link>
                  <span className="text-gray-300">•</span>
                  <Link
                    to={`/e/${evt.shareLinkToken}`}
                    target="_blank"
                    className="text-[#C84B18] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Form</span>
                    <ExternalLink className="w-3 h-3 text-[#C84B18]" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comprehensive Event Details Modal */}
      <EventDetailModal
        event={selectedModalEvent}
        isOpen={!!selectedModalEvent}
        onClose={() => setSelectedModalEvent(null)}
      />
    </div>
  );
};
