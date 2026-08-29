import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import type { User } from '../../types/user';
import type { Event } from '../../types/event';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Search as SearchIcon,
  User as UserIcon,
  Calendar,
  ArrowRight,
} from 'lucide-react';

export const PublicSearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [attendees, setAttendees] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    // Initial fetch of sample results
    api.search.searchPublic('a').then((res) => {
      setAttendees(res.attendees);
      setEvents(res.events);
    });
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const res = await api.search.searchPublic(query);
    setAttendees(res.attendees);
    setEvents(res.events);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8 pb-20">
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <Badge variant="tertiary">Public Sheeba Registry</Badge>
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#2D1F23]">
          Search Profiles & Events
        </h1>
        <p className="text-xs text-[#756366]">
          Look up verified community member profiles, event badges, and registration links.
        </p>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756366]" />
          <input
            type="text"
            placeholder="Search by attendee name or event title..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-[#E8DDD7] rounded-2xl text-xs sm:text-sm text-[#2D1F23] focus:outline-none focus:ring-2 focus:ring-[#63474D] shadow-xs"
          />
        </div>
        <Button type="submit" variant="primary" size="md">
          Search
        </Button>
      </form>

      {/* Results Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        {/* Attendees Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E8DDD7]">
            <h2 className="font-serif text-lg font-bold text-[#2D1F23] flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-[#63474D]" />
              Attendees ({attendees.length})
            </h2>
            <span className="text-[11px] text-[#756366]">Public Profiles</span>
          </div>

          {attendees.length === 0 ? (
            <p className="text-xs text-[#756366] py-6 text-center">No attendee profiles matched.</p>
          ) : (
            <div className="space-y-3">
              {attendees.map((att) => (
                <Link
                  key={att.id}
                  to={`/profile/${att.id}`}
                  className="bg-white p-4 rounded-2xl border border-[#E8DDD7] hover:border-[#63474D] transition-all shadow-xs flex items-center justify-between group block"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={att.avatarUrl}
                      alt={att.name}
                      className="w-10 h-10 rounded-full object-cover border border-[#D6A184]"
                    />
                    <div>
                      <h3 className="font-serif font-bold text-sm text-[#2D1F23] group-hover:text-[#63474D]">
                        {att.name}
                      </h3>
                      <p className="text-[11px] text-[#756366]">
                        {att.stats?.totalEventsAttended || 14} Verified Events Attended
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#756366] group-hover:text-[#63474D] transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Events Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E8DDD7]">
            <h2 className="font-serif text-lg font-bold text-[#2D1F23] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#63474D]" />
              Event Registration Links ({events.length})
            </h2>
            <span className="text-[11px] text-[#756366]">Single-Day Events</span>
          </div>

          {events.length === 0 ? (
            <p className="text-xs text-[#756366] py-6 text-center">No event registration links found.</p>
          ) : (
            <div className="space-y-3">
              {events.map((ev) => (
                <Link
                  key={ev.id}
                  to={`/e/${ev.shareLinkToken}`}
                  className="bg-white p-4 rounded-2xl border border-[#E8DDD7] hover:border-[#63474D] transition-all shadow-xs space-y-2 group block"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="primary" className="uppercase font-mono text-[10px]">
                      {ev.type}
                    </Badge>
                    <span className="text-[11px] font-bold text-[#63474D]">
                      {ev.isPaid ? `${ev.ticketPrice} ETB` : 'FREE'}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-sm text-[#2D1F23] group-hover:text-[#63474D]">
                    {ev.title}
                  </h3>

                  <p className="text-[11px] text-[#756366]">
                    Hosted by {ev.organizerName} • {ev.date}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
