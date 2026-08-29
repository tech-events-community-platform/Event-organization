import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import type { Event } from '../../types/event';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Search, PlusCircle, Calendar, MapPin, QrCode, BarChart3, Award, Copy, Check } from 'lucide-react';

export const EventListPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const data = await api.events.getAll();
      setEvents(data);
      setLoading(false);
    };
    fetchEvents();
  }, []);

  const handleCopyLink = (token: string) => {
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
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#2D1F23]">Manage Events</h1>
          <p className="text-xs text-[#756366]">Overview of your single-day events, share links, and check-in rosters.</p>
        </div>
        <Link to="/organizer/events/create">
          <Button variant="primary" icon={<PlusCircle className="w-4 h-4" />}>
            Create New Event
          </Button>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-[#E8DDD7] shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756366]" />
          <input
            type="text"
            placeholder="Search events by title or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#FAF7F5] border border-[#E8DDD7] rounded-xl text-xs text-[#2D1F23] focus:outline-none focus:ring-2 focus:ring-[#63474D]"
          />
        </div>

        <div className="flex gap-2">
          {['All', 'open', 'completed', 'closed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                statusFilter === status
                  ? 'bg-[#63474D] text-white shadow-xs'
                  : 'bg-[#FAF7F5] text-[#756366] hover:bg-[#F4EFEB]'
              }`}
            >
              {status === 'open' ? 'Active' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Event Cards */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-[#E8DDD7]/50 rounded-3xl"></div>
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-[#E8DDD7] space-y-3">
          <Calendar className="w-10 h-10 text-[#AA767C] mx-auto" />
          <h3 className="font-serif text-base font-bold text-[#2D1F23]">No events found</h3>
          <p className="text-xs text-[#756366]">Set up registration, door QR scanner, and sponsor reports.</p>
          <Link to="/organizer/events/create">
            <Button variant="primary" icon={<PlusCircle className="w-4 h-4" />}>
              Create Event Now
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className="bg-white rounded-3xl p-6 border border-[#E8DDD7] shadow-xs hover:border-[#63474D] transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="primary" className="uppercase font-mono text-[10px]">
                    {evt.type}
                  </Badge>
                  <Badge variant={evt.status === 'open' ? 'success' : 'gray'}>
                    {evt.status === 'open' ? 'Open' : evt.status}
                  </Badge>
                  <span className="text-xs font-bold text-[#63474D]">
                    {evt.isPaid ? `${evt.ticketPrice} ETB` : 'FREE'}
                  </span>
                </div>
                <h3 className="font-serif font-bold text-lg text-[#2D1F23] truncate">{evt.title}</h3>
                <div className="flex flex-wrap items-center gap-4 text-xs text-[#756366]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#63474D]" />
                    {evt.date} • {evt.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#63474D]" />
                    {evt.location}
                  </span>
                </div>
              </div>

              {/* Counts & Actions */}
              <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 border-t lg:border-t-0 pt-3 lg:pt-0 border-[#E8DDD7]">
                <div className="flex items-center gap-4 text-xs pr-2">
                  <div>
                    <span className="text-[10px] uppercase text-[#756366] font-bold block">Turnout</span>
                    <span className="font-bold text-[#63474D] text-sm">
                      {evt.checkedInCount} / {evt.registeredCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-[#756366] font-bold block">Capacity</span>
                    <span className="font-bold text-[#2D1F23] text-sm">{evt.capacity}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyLink(evt.shareLinkToken)}
                    className="p-2 bg-[#FAF7F5] border border-[#E8DDD7] hover:bg-[#F4EFEB] rounded-xl text-xs font-semibold text-[#63474D]"
                    title="Copy Share Link"
                  >
                    {copiedId === evt.shareLinkToken ? <Check className="w-4 h-4 text-[#2A7B5F]" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <Link to={`/organizer/events/${evt.id}/scanner`}>
                    <Button variant="accent" size="sm" icon={<QrCode className="w-3.5 h-3.5" />}>
                      Scanner
                    </Button>
                  </Link>
                  <Link to={`/organizer/events/${evt.id}/attendees`}>
                    <Button variant="outline" size="sm" icon={<Award className="w-3.5 h-3.5" />}>
                      Badges
                    </Button>
                  </Link>
                  <Link to={`/organizer/events/${evt.id}/report`}>
                    <Button variant="secondary" size="sm" icon={<BarChart3 className="w-3.5 h-3.5" />}>
                      Report
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
