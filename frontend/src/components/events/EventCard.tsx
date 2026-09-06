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
  const availableSeats = event.capacity - event.registeredCount;
  const isFull = availableSeats <= 0 || event.status === 'closed';

  return (
    <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-md hover:border-[#153E2A]/50 hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group">
      {event.bannerUrl && (
        <div className="relative h-44 overflow-hidden bg-gray-100">
          <img
            src={event.bannerUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex items-end p-4 justify-between">
            <Badge variant="outline" className="uppercase font-mono text-[10px] bg-white/90 backdrop-blur-md text-[#153E2A] border-none shadow-sm">
              {event.type}
            </Badge>
            <span className="text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md bg-[#153E2A]/85 text-[#F9FF46] shadow-sm border border-[#8BA448]/30">
              {event.isPaid ? `${event.ticketPrice} ETB` : 'FREE'}
            </span>
          </div>
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="font-bold text-[#153E2A] truncate">{event.organizerName}</span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#8BA448] shrink-0" />
          </div>

          <Link to={`/e/${event.shareLinkToken}`}>
            <h3 className="font-serif font-bold text-lg text-[#153E2A] group-hover:text-[#8BA448] transition-colors line-clamp-1">
              {event.title}
            </h3>
          </Link>

          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed font-light">
            {event.description}
          </p>
        </div>

        <div className="pt-3 border-t border-gray-100 space-y-2 text-xs text-gray-700">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4 text-[#153E2A] shrink-0" />
            <span className="truncate">{event.date} • {event.time}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4 text-[#153E2A] shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        <div className="pt-2">
          {isRegistered ? (
            <Link to={`/app/ticket/${event.id}`} className="w-full block">
              <Button fullWidth size="sm" variant="accent" icon={<ShieldCheck className="w-4 h-4" />}>
                View Ticket Pass
              </Button>
            </Link>
          ) : (
            <Link to={`/e/${event.shareLinkToken}`} className="w-full block">
              <Button
                fullWidth
                size="sm"
                variant={isFull ? 'ghost' : 'primary'}
                icon={<ArrowRight className="w-4 h-4" />}
                disabled={isFull}
              >
                {isFull ? 'Registration Closed' : 'Register for Event'}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
