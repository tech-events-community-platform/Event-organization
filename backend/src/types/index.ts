import { Request } from 'express';

export type UserRole = 'attendee' | 'organizer' | 'admin';

export interface IUser {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: UserRole;
  phone?: string | null;
  bio?: string | null;
  organization?: string | null;
  created_at: Date;
  updated_at: Date;
}

export type IUserSafe = Omit<IUser, 'password_hash'>;

export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';

export interface IEvent {
  id: string;
  organizer_id: string;
  title: string;
  description: string;
  category?: string;
  event_date: Date;
  end_date?: Date | null;
  location: string;
  capacity: number;
  status: EventStatus;
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
  registered_at: Date;
  created_at: Date;
  updated_at: Date;
  // Joined fields
  event?: IEvent;
  user?: IUserSafe;
}

export type TicketStatus = 'ISSUED' | 'CHECKED_IN' | 'CANCELLED' | 'EXPIRED';

export interface ITicket {
  id: string;
  registration_id: string;
  event_id: string;
  user_id: string;
  qr_token: string;
  qr_code_data_url?: string | null;
  status: TicketStatus;
  checked_in_at?: Date | null;
  checked_in_by?: string | null;
  created_at: Date;
  updated_at: Date;
  // Joined fields
  event?: IEvent;
  user?: IUserSafe;
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

