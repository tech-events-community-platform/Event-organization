import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { Ticket } from '../../types/ticket';
import type { Event } from '../../types/event';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Calendar,
  MapPin,
  QrCode,
  ShieldCheck,
  ArrowRight,
  Ticket as TicketIcon,
  Compass,
} from 'lucide-react';

export const MyEventsPage: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Tickets' | 'Explore'>('Tickets');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (user) {
          const userTickets = await api.registration.getAttendeeTickets(user.id);
          setTickets(userTickets);
        }
        const events = await api.events.getAll();
        setAllEvents(events);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <div className="space-y-1">
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-sheeba-dark">
          Tickets & Registered Passes
        </h1>
        <p className="text-xs text-gray-500 font-light">
          Manage your event tickets, dynamic QR passes, and registration statuses.
        </p>
      </div>

      {/* 2 Clean Tabs (Tickets & Explore) */}
      <div className="flex border-b border-gray-200 gap-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('Tickets')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'Tickets'
              ? 'border-sheeba-purple text-sheeba-purple'
              : 'border-transparent text-gray-500 hover:text-sheeba-dark'
          }`}
        >
          <TicketIcon className="w-4 h-4" />
          <span>My Tickets ({tickets.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('Explore')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'Explore'
              ? 'border-sheeba-purple text-sheeba-purple'
              : 'border-transparent text-gray-500 hover:text-sheeba-dark'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Explore Events ({allEvents.length})</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-2xl"></div>
          ))}
        </div>
      ) : activeTab === 'Explore' ? (
        /* Explore All Added Events */
        <div className="space-y-4">
          {allEvents.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-gray-200 space-y-3 shadow-xs">
              <Compass className="w-10 h-10 text-sheeba-rose mx-auto" />
              <h3 className="font-serif text-base font-bold text-sheeba-dark">No Events Available</h3>
              <p className="text-xs text-gray-500 font-light">Check back soon for new workshops, meetups, and hackathons.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-sheeba-purple transition-all shadow-xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="primary" className="uppercase font-mono text-[10px]">
                        {ev.type}
                      </Badge>
                      <span className="text-xs font-bold text-sheeba-purple">
                        {ev.isPaid ? `${ev.ticketPrice} ETB` : 'FREE'}
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-base text-sheeba-dark">{ev.title}</h3>
                    <p className="text-xs font-semibold text-sheeba-rose">Hosted by {ev.organizerName}</p>

                    <div className="space-y-1 text-xs text-gray-600 font-light pt-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-sheeba-purple" />
                        <span>{ev.date} • {ev.time || `${ev.startTime} - ${ev.endTime}`}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-sheeba-purple" />
                        <span className="truncate">{ev.venueName || ev.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] text-gray-400 font-light">
                      {ev.registeredCount} / {ev.capacity} spots
                    </span>
                    <Link to={`/e/${ev.shareLinkToken}`}>
                      <Button variant="accent" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                        Register / View
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-gray-200 space-y-3 shadow-xs">
          <TicketIcon className="w-10 h-10 text-sheeba-rose mx-auto" />
          <h3 className="font-serif text-base font-bold text-sheeba-dark">
            You don't have any registered event passes.
          </h3>
          <p className="text-xs text-gray-500 font-light">
            Browse all upcoming hackathons, workshops, or meetups to register.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setActiveTab('Explore')}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Explore Added Events
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs hover:border-sheeba-purple transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={ticket.status === 'Valid' ? 'success' : 'gray'}
                    icon={<ShieldCheck className="w-3 h-3" />}
                  >
                    {ticket.status}
                  </Badge>
                  <span className="font-mono text-[10px] text-gray-400">PASS: {ticket.id}</span>
                </div>

                <h3 className="font-serif font-bold text-base text-sheeba-dark truncate">
                  {ticket.eventTitle}
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 font-light">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-sheeba-purple" />
                    {ticket.eventDate} • {ticket.eventTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-sheeba-purple" />
                    {ticket.eventLocation}
                  </span>
                </div>
              </div>

              <div className="w-full sm:w-auto pt-2 sm:pt-0 shrink-0">
                <Link to={`/app/ticket/${ticket.eventId}`}>
                  <Button variant="accent" size="sm" fullWidth icon={<QrCode className="w-4 h-4" />}>
                    Open Pass View
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
