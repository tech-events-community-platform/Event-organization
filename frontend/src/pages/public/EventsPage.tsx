import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { Event, EventCategory } from '../../types/event';
import { EventCard } from '../../components/events/EventCard';
import { Badge } from '../../components/ui/Badge';
import { Search, Filter, Calendar, Sparkles } from 'lucide-react';

const CATEGORIES: ('All' | EventCategory)[] = [
  'All',
  'Frontend',
  'AI & ML',
  'Women in Tech',
  'Hackathon',
  'Open Source',
];

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | EventCategory>('All');

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
    const matchesCategory = selectedCategory === 'All' || evt.category === selectedCategory;
    const matchesSearch =
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.organizer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title Header */}
      <div className="space-y-3">
        <Badge variant="gold" icon={<Sparkles className="w-3.5 h-3.5" />}>
          Discover Tech Gatherings
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#17211E] tracking-tight">
          Ethiopia Tech Events & Workshops
        </h1>
        <p className="text-sm text-[#66736E] max-w-2xl">
          Discover verified engineering meetups, AI labs, workshops, and community hackathons across Addis Ababa and beyond.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by event title, organizer, or venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F7F8F5] border border-gray-200 rounded-xl text-sm text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B5D4B]"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-1">
          <Filter className="w-4 h-4 text-[#0B5D4B] flex-shrink-0 mr-1" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#0B5D4B] text-white shadow-xs'
                  : 'bg-[#F7F8F5] text-[#66736E] hover:text-[#17211E] hover:bg-gray-200/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid / Loading / Empty State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-gray-200 space-y-4 animate-pulse">
              <div className="h-44 bg-gray-200 rounded-xl"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 space-y-4">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#17211E]">No events match your criteria</h3>
          <p className="text-xs text-[#66736E]">
            Try adjusting your search terms or selecting a different category filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="text-xs font-bold text-[#0B5D4B] hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => (
            <EventCard key={evt.id} event={evt} />
          ))}
        </div>
      )}
    </div>
  );
};
