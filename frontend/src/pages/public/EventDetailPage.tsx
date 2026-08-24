import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import type { Event } from '../../types/event';
import type { Ticket } from '../../types/ticket';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Calendar,
  MapPin,
  Users,
  ShieldCheck,
  CheckCircle2,
  QrCode,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated, loginAsDemoUser } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    const loadEventData = async () => {
      if (!id) return;
      setLoading(true);
      const evtData = await api.getEventById(id);
      setEvent(evtData || null);

      if (evtData && user) {
        const tkt = await api.getTicketForEvent(evtData.id, user.id);
        setTicket(tkt || null);
      }
      setLoading(false);
    };
    loadEventData();
  }, [id, user]);

  const handleRegister = async () => {
    if (!event) return;

    setRegistering(true);
    try {
      let currentUser = user;
      if (!isAuthenticated || !currentUser) {
        loginAsDemoUser('ATTENDEE');
        currentUser = {
          id: 'demo-attendee-001',
          name: 'Abebe Kebede',
          telegramHandle: '@abebe_demo',
          role: 'ATTENDEE',
          memberSince: 'March 2025',
        };
      }

      const newTicket = await api.registerForEvent(
        event.id,
        currentUser.id,
        currentUser.name,
        currentUser.telegramHandle
      );
      setTicket(newTicket);
      const updatedEvent = await api.getEventById(event.id);
      if (updatedEvent) setEvent(updatedEvent);
    } catch (e) {
      console.error(e);
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6 animate-pulse">
        <div className="h-64 bg-gray-200 rounded-3xl"></div>
        <div className="h-8 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-[#17211E]">Event Not Found</h2>
        <p className="text-xs text-[#66736E]">The event you are looking for does not exist or has been removed.</p>
        <Link to="/events">
          <Button variant="primary">Return to Events</Button>
        </Link>
      </div>
    );
  }

  const availableSeats = event.capacity - event.registeredCount;
  const isRegistered = !!ticket;
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link
        to="/events"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B5D4B] hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Event Discovery
      </Link>

      {/* Main Banner */}
      <div className="relative rounded-3xl overflow-hidden h-64 sm:h-80 bg-gray-900 shadow-lg">
        <img
          src={event.bannerUrl}
          alt={event.title}
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-6 sm:p-8">
          <div className="space-y-2 text-white">
            <div className="flex items-center gap-2">
              <Badge variant="gold">{event.category}</Badge>
              <Badge variant="green">{event.status}</Badge>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
              {event.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Detail Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Organizer Info */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3">
              <img
                src={event.organizer.avatarUrl}
                alt={event.organizer.name}
                className="w-12 h-12 rounded-full object-cover border border-[#D6A84F]"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-[#17211E]">{event.organizer.name}</span>
                  {event.organizer.verified && (
                    <ShieldCheck className="w-4 h-4 text-[#0B5D4B]" />
                  )}
                </div>
                <span className="text-xs text-[#66736E]">Verified Community Host</span>
              </div>
            </div>
            <Badge variant="outline" className="hidden sm:inline-flex">
              Organized on Sheba
            </Badge>
          </div>

          {/* Description */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 space-y-4 shadow-2xs">
            <h3 className="font-bold text-lg text-[#17211E]">About this Event</h3>
            <p className="text-sm text-[#17211E] leading-relaxed whitespace-pre-line">
              {event.description}
            </p>

            {event.skillsFocus && event.skillsFocus.length > 0 && (
              <div className="pt-4 border-t border-gray-100 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#66736E]">
                  Self-Reported Tag Topics
                </span>
                <div className="flex flex-wrap gap-2">
                  {event.skillsFocus.map((skill: string) => (
                    <Badge key={skill} variant="gray">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* What Attendees Should Know */}
          {event.whatToKnow && (
            <div className="bg-white p-6 rounded-2xl border border-gray-200/80 space-y-4 shadow-2xs">
              <h3 className="font-bold text-lg text-[#17211E]">What Attendees Should Know</h3>
              <div className="space-y-3">
                {event.whatToKnow.map((item: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 text-xs text-[#17211E]">
                    <CheckCircle2 className="w-4 h-4 text-[#0B5D4B] mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Registration Sticky Card */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-md space-y-6 sticky top-24">
            <div className="space-y-4 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3 text-xs text-[#17211E]">
                <Calendar className="w-5 h-5 text-[#0B5D4B] flex-shrink-0" />
                <div>
                  <p className="font-semibold">{formattedDate}</p>
                  <p className="text-[#66736E]">{event.time}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-[#17211E]">
                <MapPin className="w-5 h-5 text-[#0B5D4B] flex-shrink-0" />
                <div>
                  <p className="font-semibold">{event.venueName}</p>
                  <p className="text-[#66736E]">{event.location}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-2">
                <span className="text-[#66736E] font-medium flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#0B5D4B]" />
                  Seats Capacity
                </span>
                <span className="font-bold text-[#17211E]">
                  {event.registeredCount} / {event.capacity} registered
                </span>
              </div>
            </div>

            {/* Registration Action */}
            {isRegistered ? (
              <div className="bg-[#238B6E]/10 border border-[#238B6E]/30 p-4 rounded-2xl text-center space-y-3">
                <div className="flex items-center justify-center gap-1.5 font-bold text-sm text-[#0B5D4B]">
                  <CheckCircle2 className="w-5 h-5 text-[#238B6E]" />
                  You&apos;re registered!
                </div>
                <p className="text-xs text-[#66736E]">
                  Your Sheba digital QR ticket is ready. Present it at entry.
                </p>
                <Link to={`/app/ticket/${event.id}`}>
                  <Button fullWidth variant="accent" icon={<QrCode className="w-4 h-4" />}>
                    View Digital Ticket Pass
                  </Button>
                </Link>
              </div>
            ) : event.status === 'Completed' ? (
              <div className="bg-gray-100 p-4 rounded-2xl text-center text-xs text-[#66736E]">
                This event has already concluded.
              </div>
            ) : availableSeats <= 0 ? (
              <div className="bg-red-50 p-4 rounded-2xl text-center text-xs text-red-600 font-bold">
                Capacity Reached — Registration Closed
              </div>
            ) : (
              <Button
                onClick={handleRegister}
                isLoading={registering}
                fullWidth
                size="lg"
                variant="primary"
              >
                Register for Event
              </Button>
            )}

            <div className="text-center pt-1">
              <span className="text-[11px] text-[#66736E]">
                Free Entrance • Instant Digital QR Ticket Pass
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
