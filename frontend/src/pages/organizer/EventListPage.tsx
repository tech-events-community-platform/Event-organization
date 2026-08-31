import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { Event } from '../../types/event';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EventDetailModal } from '../../components/organizer/EventDetailModal';
import {
  Search,
  PlusCircle,
  Calendar,
  MapPin,
  QrCode,
  BarChart3,
  Award,
  Copy,
  Check,
} from 'lucide-react';

export const EventListPage: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedModalEvent, setSelectedModalEvent] = useState<Event | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const data = await api.events.getAll(user?.id);
      setEvents(data);
      setLoading(false);
    };
    fetchEvents();
  }, [user?.id]);

  const handleCopyLink = (token: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/e/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedId(token);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredEvents = events.filter((evt) => {
    const matchesStatus = statusFilter === 'All' || evt.status === statusFilter;
    const matchesSearch =
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-sheeba-dark">My Events</h1>
          <p className="text-xs text-gray-500 font-light">
            Overview of your single-day events, share links, and check-in rosters. Click any card to inspect full details.
          </p>
        </div>
        <Link to="/organizer/events/create">
          <Button variant="primary" icon={<PlusCircle className="w-4 h-4" />}>
            Create New Event
          </Button>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search events by title or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-sheeba-dark focus:outline-none focus:ring-2 focus:ring-sheeba-purple"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto">
          {['All', 'open', 'completed', 'closed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                statusFilter === status
                  ? 'bg-sheeba-purple text-white shadow-2xs'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {status === 'open' ? 'Active' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Event Cards */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-2xl"></div>
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-gray-200 space-y-3 shadow-2xs">
          <Calendar className="w-10 h-10 text-sheeba-rose mx-auto" />
          <h3 className="font-serif text-base font-bold text-sheeba-dark">No events found</h3>
          <p className="text-xs text-gray-500 font-light">Set up registration, door QR scanner, and sponsor reports.</p>
          <Link to="/organizer/events/create">
            <Button variant="primary" icon={<PlusCircle className="w-4 h-4" />}>
              Create Event Now
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEvents.map((evt) => (
            <div
              key={evt.id}
              onClick={() => setSelectedModalEvent(evt)}
              className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs hover:border-[#C84B18] hover:shadow-xs transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer group"
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="primary" className="uppercase font-mono text-[10px]">
                    {evt.type}
                  </Badge>
                  <Badge variant={evt.status === 'open' ? 'success' : 'gray'}>
                    {evt.status === 'open' ? 'Active Registration' : evt.status}
                  </Badge>
                  <span className="text-xs font-bold text-sheeba-purple">
                    {evt.isPaid ? `${evt.ticketPrice} ETB` : 'FREE'}
                  </span>
                </div>
                <h3 className="font-serif font-bold text-lg text-sheeba-dark group-hover:text-[#C84B18] transition-colors truncate">
                  {evt.title}
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 font-light">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-sheeba-purple" />
                    {evt.date} • {evt.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-sheeba-purple" />
                    {evt.location}
                  </span>
                </div>
              </div>

              {/* Counts & Actions */}
              <div
                className="flex flex-wrap items-center justify-between lg:justify-end gap-3 border-t lg:border-t-0 pt-3 lg:pt-0 border-gray-100"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-4 text-xs pr-2">
                  <div>
                    <span className="text-[10px] uppercase text-gray-400 font-bold block">Turnout</span>
                    <span className="font-bold text-[#2A7B5F] text-sm">
                      {evt.checkedInCount} / {evt.registeredCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-gray-400 font-bold block">Capacity</span>
                    <span className="font-bold text-sheeba-dark text-sm">{evt.capacity}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleCopyLink(evt.shareLinkToken, e)}
                    className="p-2 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-xl text-xs font-semibold text-sheeba-dark cursor-pointer transition-colors"
                    title="Copy Share Link"
                  >
                    {copiedId === evt.shareLinkToken ? (
                      <Check className="w-4 h-4 text-[#2A7B5F]" />
                    ) : (
                      <Copy className="w-4 h-4 text-[#C84B18]" />
                    )}
                  </button>
                  <Link to={`/organizer/events/${evt.id}/scanner`}>
                    <Button variant="accent" size="sm" icon={<QrCode className="w-3.5 h-3.5" />}>
                      Scanner
                    </Button>
                  </Link>
                  <Link to={`/organizer/events/${evt.id}/attendees`}>
                    <Button variant="outline" size="sm" icon={<Award className="w-3.5 h-3.5 text-[#C84B18]" />}>
                      Badges
                    </Button>
                  </Link>
                  <Link to={`/organizer/reports/${evt.id}`}>
                    <Button variant="outline" size="sm" icon={<BarChart3 className="w-3.5 h-3.5 text-[#C84B18]" />}>
                      Report
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comprehensive Event Details Modal */}
      <EventDetailModal
        event={selectedModalEvent}
        isOpen={!!selectedModalEvent}
        onClose={() => setSelectedModalEvent(null)}
      />
    </div>
  );
};
