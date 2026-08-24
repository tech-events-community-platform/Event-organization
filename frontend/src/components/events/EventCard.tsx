import React from 'react';
import { Link } from 'react-router-dom';
import type { Event } from '../../types/event';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Calendar, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';

interface EventCardProps {
  event: Event;
  isRegistered?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ event, isRegistered }) => {
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const availableSeats = event.capacity - event.registeredCount;
  const isFull = availableSeats <= 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group">
      {/* Event Header Banner */}
      <div className="relative h-44 overflow-hidden bg-gray-100">
        <img
          src={event.bannerUrl}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4 justify-between">
          <Badge variant="gold" className="shadow-xs">
            {event.category}
          </Badge>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-md ${
              event.status === 'Completed'
                ? 'bg-gray-800/80 text-gray-300'
                : isFull
                ? 'bg-red-900/80 text-red-200'
                : 'bg-[#0B5D4B]/90 text-white'
            }`}
          >
            {event.status === 'Completed'
              ? 'Past Event'
              : isFull
              ? 'Sold Out'
              : `${availableSeats} seats left`}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Organizer tag */}
          <div className="flex items-center gap-1.5 text-xs text-[#66736E]">
            <span className="font-medium text-[#17211E] truncate">{event.organizer.name}</span>
            {event.organizer.verified && (
              <ShieldCheck className="w-3.5 h-3.5 text-[#0B5D4B] flex-shrink-0" />
            )}
          </div>

          <Link to={`/events/${event.id}`}>
            <h3 className="font-bold text-lg text-[#17211E] group-hover:text-[#0B5D4B] transition-colors line-clamp-1">
              {event.title}
            </h3>
          </Link>

          <p className="text-xs text-[#66736E] line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* Event Details snippet */}
        <div className="pt-3 border-t border-gray-100 space-y-2 text-xs text-[#17211E]">
          <div className="flex items-center gap-2 text-[#66736E]">
            <Calendar className="w-4 h-4 text-[#0B5D4B] flex-shrink-0" />
            <span className="truncate">{formattedDate} • {event.time}</span>
          </div>
          <div className="flex items-center gap-2 text-[#66736E]">
            <MapPin className="w-4 h-4 text-[#0B5D4B] flex-shrink-0" />
            <span className="truncate">{event.venueName}</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex items-center justify-between gap-3">
          {isRegistered ? (
            <Link to={`/app/ticket/${event.id}`} className="w-full">
              <Button fullWidth size="sm" variant="accent" icon={<ShieldCheck className="w-4 h-4" />}>
                View Ticket Pass
              </Button>
            </Link>
          ) : (
            <Link to={`/events/${event.id}`} className="w-full">
              <Button
                fullWidth
                size="sm"
                variant={event.status === 'Completed' ? 'ghost' : 'primary'}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                {event.status === 'Completed' ? 'View Details' : 'Register for Event'}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
