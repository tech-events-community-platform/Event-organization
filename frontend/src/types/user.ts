export type UserRole = 'ATTENDEE' | 'ORGANIZER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  telegramHandle: string;
  avatarUrl?: string;
  role: UserRole;
  memberSince: string;
  bio?: string;
  selfReportedSkills?: string[];
  email?: string;
  phone?: string;
  organization?: string;
}
