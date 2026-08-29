export type UserRole = 'ATTENDEE' | 'ORGANIZER' | 'ADMIN';
export type ProfileVisibility = 'public' | 'private';

export interface AttendeeStats {
  meetupsCount: number;
  workshopsCount: number;
  hackathonsCount: number;
  totalEventsAttended: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  memberSince: string;
  bio?: string;
  visibility?: ProfileVisibility;
  phone?: string;
  organization?: string;
  stats?: AttendeeStats;
}

export interface OrganizerProfile {
  userId: string;
  organizationName: string;
  contactEmail: string;
  contactPhone?: string;
  bio?: string;
}
