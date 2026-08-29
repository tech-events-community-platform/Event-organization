export type EventType = 'hackathon' | 'workshop' | 'meetup';

export type EventStatus = 'open' | 'closed' | 'canceled' | 'postponed' | 'completed';

export interface RegistrationQuestion {
  id: string;
  eventId?: string;
  questionText: string;
  isRequired: boolean;
  order: number;
}

export interface Event {
  id: string;
  organizerId: string;
  organizerName: string;
  organizerAvatar?: string;
  title: string;
  description: string;
  type: EventType;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g. "09:00 AM"
  endTime?: string; // e.g. "05:00 PM"
  time: string; // display string e.g. "09:00 AM - 05:00 PM EAT"
  location: string;
  venueName?: string;
  capacity: number;
  registeredCount: number;
  checkedInCount: number;
  status: EventStatus;
  isPaid: boolean;
  ticketPrice: number; // In ETB
  currency: 'ETB';
  shareLinkToken: string;
  customQuestions: RegistrationQuestion[];
  bannerUrl?: string;
  createdAt?: string;
}
