import { Request } from 'express';

export type UserRole = 'attendee' | 'organizer' | 'admin';
export type ProfileVisibility = 'public' | 'private';

export interface IUser {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: UserRole;
  phone?: string | null;
  bio?: string | null;
  organization?: string | null;
  avatar_url?: string | null;
  visibility: ProfileVisibility;
  member_since: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  // Computed stats
  stats?: {
    meetupsCount: number;
    workshopsCount: number;
    hackathonsCount: number;
    totalEventsAttended: number;
  };
}

export type IUserSafe = Omit<IUser, 'password_hash'>;

export type EventType = 'hackathon' | 'workshop' | 'meetup';
export type EventStatus = 'open' | 'closed' | 'completed' | 'canceled' | 'postponed' | 'draft' | 'published';

export interface RegistrationQuestion {
  id: string;
  questionText: string;
  isRequired: boolean;
  order: number;
}

export interface IEvent {
  id: string;
  organizer_id: string;
  title: string;
  description: string;
  event_type: EventType;
  category?: string;
  event_date: Date;
  end_date?: Date | null;
  start_time: string;
  end_time: string;
  time_str: string;
  location: string;
  venue_name?: string | null;
  capacity: number;
  status: EventStatus;
  is_paid: boolean;
  ticket_price: number;
  currency: string;
  share_link_token: string;
  custom_questions: RegistrationQuestion[];
  banner_url?: string | null;
  created_at: Date;
  updated_at: Date;
  // Computed / Joined fields
  registered_count?: number;
  checked_in_count?: number;
  organizer_name?: string;
  organizer_email?: string;
}

export type RegistrationStatus = 'registered' | 'cancelled';

export interface IRegistration {
  id: string;
  event_id: string;
  user_id: string;
  status: RegistrationStatus;
  answers: Record<string, string>;
  payment_reference?: string | null;
  payment_status?: string | null;
  registered_at: Date;
  created_at: Date;
  updated_at: Date;
  // Joined fields
  event?: IEvent;
  user?: IUserSafe;
}

export type TicketStatus = 'ISSUED' | 'CHECKED_IN' | 'CANCELLED' | 'EXPIRED' | 'Valid' | 'Used' | 'Cancelled' | 'Expired';

export interface ITicket {
  id: string;
  ticket_code: string;
  registration_id: string;
  event_id: string;
  user_id: string;
  qr_token: string;
  qr_code_data_url?: string | null;
  status: TicketStatus;
  is_paid: boolean;
  ticket_price: number;
  currency: string;
  expires_at?: Date | null;
  checked_in_at?: Date | null;
  checked_in_by?: string | null;
  created_at: Date;
  updated_at: Date;
  // Joined fields
  event?: IEvent;
  user?: IUserSafe;
}

export type BadgeCode = 'attended' | 'participant' | 'winner' | 'speaker';

export interface IBadgeAward {
  id: string;
  badge_code: BadgeCode;
  badge_label: string;
  event_id: string;
  user_id: string;
  awarded_by: string;
  awarded_at: Date;
  revoked_at?: Date | null;
  revoked_by?: string | null;
  revocation_reason?: string | null;
  created_at: Date;
  updated_at: Date;
  // Joined fields
  event_title?: string;
  event_type?: EventType;
  event_date?: string;
  event_location?: string;
  attendee_name?: string;
  attendee_email?: string;
  issuer_name?: string;
}

export interface IPayment {
  id: string;
  transaction_id: string;
  event_id: string;
  user_id: string;
  amount: number;
  commission_amount: number;
  organizer_payout: number;
  currency: string;
  status: 'SETTLED' | 'FAILED' | 'PENDING' | 'REFUNDED';
  created_at: Date;
  updated_at: Date;
  // Joined fields
  event_title?: string;
  attendee_email?: string;
}

export interface AttendeeRosterItem {
  id: string;
  registrationId: string;
  attendeeId: string;
  name: string;
  email: string;
  registrationDate: string;
  status: 'Registered' | 'Checked in';
  checkInTime?: string;
  badges: BadgeCode[];
  answers?: Record<string, string>;
}

export interface SponsorReportData {
  eventId: string;
  eventTitle: string;
  eventType: EventType;
  eventDate: string;
  eventLocation: string;
  organizerName: string;
  totalRegistered: number;
  totalAttended: number;
  attendanceRate: number;
  badgeDistribution: {
    attended: number;
    participant: number;
    winner: number;
    speaker: number;
  };
  registrationsOverTime: Array<{ date: string; count: number }>;
  hourlyCheckIns?: Array<{ hour: string; count: number }>;
  attendees: AttendeeRosterItem[];
}

export interface IJwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  fullName: string;
}

export interface IQrTicketPayload {
  ticketId: string;
  eventId: string;
  userId: string;
  issuedAt: number;
}

export interface AuthRequest extends Request {
  user?: IJwtPayload;
}
