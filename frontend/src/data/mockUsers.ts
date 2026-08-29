import type { User } from '../types/user';

export const mockAttendeeUser: User = {
  id: 'demo-attendee-001',
  name: 'Abebe Kebede',
  email: 'abebe.kebede@example.com',
  role: 'ATTENDEE',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  memberSince: 'March 2025',
  bio: 'Software Developer & Active Tech Community Member in Addis Ababa',
  visibility: 'public',
  phone: '+251911223344',
  stats: {
    meetupsCount: 8,
    workshopsCount: 4,
    hackathonsCount: 2,
    totalEventsAttended: 14,
  },
};

export const mockOrganizerUser: User = {
  id: 'demo-organizer-001',
  name: 'Sara Tesfaye',
  email: 'sara@devcommunity.et',
  role: 'ORGANIZER',
  avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
  memberSince: 'January 2024',
  bio: 'Lead Event Director at GDG Addis & DevCommunity Ethiopia',
  organization: 'GDG Addis',
  visibility: 'public',
  phone: '+251922334455',
};

export const mockAdminUser: User = {
  id: 'demo-admin-001',
  name: 'Hanan Admin',
  email: 'admin@sheeba.et',
  role: 'ADMIN',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
  memberSince: 'December 2023',
  bio: 'Sheba Platform Internal Team & Verification Administrator',
  visibility: 'private',
};

export const mockCurrentUser: User = mockAttendeeUser;
