import type { User } from '../types/user';

export const mockAttendeeUser: User = {
  id: 'demo-attendee-001',
  name: 'Abebe Kebede',
  telegramHandle: '@abebe_demo',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  role: 'ATTENDEE',
  memberSince: 'March 2025',
  bio: 'Software Developer & Active Tech Community Member in Addis Ababa',
  selfReportedSkills: ['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
};

export const mockOrganizerUser: User = {
  id: 'demo-organizer-001',
  name: 'Sara Tesfaye',
  telegramHandle: '@sara_demo',
  avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
  role: 'ORGANIZER',
  memberSince: 'January 2024',
  bio: 'Lead Event Organizer at DevCommunity Ethiopia',
};

export const mockAdminUser: User = {
  id: 'demo-admin-001',
  name: 'Hanan Admin',
  telegramHandle: '@admin_demo',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
  role: 'ADMIN',
  memberSince: 'December 2023',
  bio: 'Sheba Platform System Administrator',
};

export const mockCurrentUser: User = mockAttendeeUser;
