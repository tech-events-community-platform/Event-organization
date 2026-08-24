import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import type { Event, EventStatus } from '../../types/event';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Search, PlusCircle, Calendar, MapPin, QrCode, BarChart3, Eye } from 'lucide-react';

export const EventListPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | EventStatus>('All');

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const data = await api.getEvents();
      setEvents(data);
      setLoading(false);
    };
    fetchEvents();
  }, []);

  const filteredEvents = events.filter((evt) => {
    const matchesStatus = statusFilter === 'All' || evt.status === statusFilter;
    const matchesSearch =
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#17211E]">Manage Events</h1>
          <p className="text-xs text-[#66736E]">Overview of your hosted events, check-ins, and sponsor reports.</p>
        </div>
        <Link to="/organizer/events/create">
          <Button variant="primary" icon={<PlusCircle className="w-4 h-4" />}>
            Create New Event
          </Button>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search events by title or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F7F8F5] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B5D4B]"
          />
        </div>

        <div className="flex gap-2">
          {(['All', 'Upcoming', 'Live', 'Completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === status
                  ? 'bg-[#0B5D4B] text-white shadow-xs'
                  : 'bg-[#F7F8F5] text-[#66736E] hover:bg-gray-200/60'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Event Cards / Table */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-2xl"></div>
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-gray-200 space-y-3">
          <Calendar className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-[#17211E]">Create your first event.</h3>
          <p className="text-xs text-[#66736E]">Set up registration, door QR scanner, and sponsor reports.</p>
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
              className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant={evt.status === 'Completed' ? 'gray' : 'green'}>
                    {evt.status}
                  </Badge>
                  <Badge variant="gold">{evt.category}</Badge>
                </div>
                <h3 className="font-bold text-lg text-[#17211E] truncate">{evt.title}</h3>
                <div className="flex flex-wrap items-center gap-4 text-xs text-[#66736E]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#0B5D4B]" />
                    {evt.date} • {evt.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#0B5D4B]" />
                    {evt.venueName}
                  </span>
                </div>
              </div>

              {/* Counts & Actions */}
              <div className="flex flex-wrap items-center justify-between lg:justify-end gap-4 border-t lg:border-t-0 pt-3 lg:pt-0 border-gray-100">
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-[10px] uppercase text-[#66736E] font-bold block">Regs</span>
                    <span className="font-bold text-[#17211E] text-sm">
                      {evt.registeredCount}/{evt.capacity}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-[#66736E] font-bold block">Checked in</span>
                    <span className="font-bold text-[#238B6E] text-sm">{evt.checkedInCount}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link to={`/events/${evt.id}`}>
                    <Button variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />}>
                      View
                    </Button>
                  </Link>
                  <Link to={`/organizer/events/${evt.id}`}>
                    <Button variant="outline" size="sm">
                      Manage
                    </Button>
                  </Link>
                  <Link to={`/organizer/events/${evt.id}/scanner`}>
                    <Button variant="accent" size="sm" icon={<QrCode className="w-4 h-4" />}>
                      Scan
                    </Button>
                  </Link>
                  <Link to={`/organizer/events/${evt.id}/report`}>
                    <Button variant="secondary" size="sm" icon={<BarChart3 className="w-4 h-4" />}>
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
