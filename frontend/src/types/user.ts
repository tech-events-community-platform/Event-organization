export type UserRole = 'ATTENDEE' | 'ORGANIZER' | 'ADMIN';
export type ProfileVisibility = 'public' | 'private';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface AttendeeStats {
  meetupsCount: number;
  workshopsCount: number;
  hackathonsCount: number;
  totalEventsAttended: number;
}

export interface OrganizerSocials {
  telegram?: string;
  x?: string;
  tiktok?: string;
  youtube?: string;
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
  socials?: OrganizerSocials;
  approvalStatus?: ApprovalStatus;
  isActive?: boolean;
  stats?: AttendeeStats;
}

export interface OrganizerProfile {
  userId: string;
  organizationName: string;
  contactEmail: string;
  contactPhone?: string;
  bio?: string;
  socials?: OrganizerSocials;
}

