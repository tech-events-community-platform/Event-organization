export interface AdminUserRecord {
  id: string;
  name: string;
  telegramHandle: string;
  role: 'ATTENDEE' | 'ORGANIZER' | 'ADMIN';
  eventsRegistered: number;
  eventsAttended: number;
  status: 'Active' | 'Inactive';
  registeredAt: string;
}

export interface AdminOrganizerRecord {
  id: string;
  name: string;
  telegramHandle: string;
  eventsCount: number;
  totalRegistrations: number;
  totalCheckIns: number;
  status: 'Active' | 'Inactive';
  verified: boolean;
  joinedDate: string;
}

export interface AdminActivityRecord {
  id: string;
  type: 'ORGANIZER_JOINED' | 'EVENT_CREATED' | 'ATTENDEE_REGISTERED' | 'ATTENDEE_CHECKED_IN';
  message: string;
  timestamp: string;
}

export const mockAdminUsers: AdminUserRecord[] = [
  {
    id: 'usr_101',
    name: 'Abebe Kebede',
    telegramHandle: '@abebe_demo',
    role: 'ATTENDEE',
    eventsRegistered: 4,
    eventsAttended: 3,
    status: 'Active',
    registeredAt: '2025-03-10',
  },
  {
    id: 'usr_102',
    name: 'Kirubel Abebe',
    telegramHandle: '@kirubel_tech',
    role: 'ATTENDEE',
    eventsRegistered: 3,
    eventsAttended: 2,
    status: 'Active',
    registeredAt: '2025-04-12',
  },
  {
    id: 'usr_103',
    name: 'Sara Tesfaye',
    telegramHandle: '@sara_demo',
    role: 'ORGANIZER',
    eventsRegistered: 5,
    eventsAttended: 5,
    status: 'Active',
    registeredAt: '2024-01-15',
  },
  {
    id: 'usr_104',
    name: 'Tigist Worku',
    telegramHandle: '@tigist_dev',
    role: 'ATTENDEE',
    eventsRegistered: 2,
    eventsAttended: 2,
    status: 'Active',
    registeredAt: '2025-06-01',
  },
  {
    id: 'usr_105',
    name: 'Yared Solomon',
    telegramHandle: '@yared_ai',
    role: 'ATTENDEE',
    eventsRegistered: 1,
    eventsAttended: 0,
    status: 'Active',
    registeredAt: '2025-07-20',
  },
  {
    id: 'usr_106',
    name: 'Biniyam Haile',
    telegramHandle: '@biniyam_h',
    role: 'ATTENDEE',
    eventsRegistered: 2,
    eventsAttended: 1,
    status: 'Inactive',
    registeredAt: '2025-02-14',
  },
];

export const mockAdminOrganizers: AdminOrganizerRecord[] = [
  {
    id: 'org_devcomm',
    name: 'DevCommunity Ethiopia',
    telegramHandle: '@devcomm_et',
    eventsCount: 8,
    totalRegistrations: 420,
    totalCheckIns: 358,
    status: 'Active',
    verified: true,
    joinedDate: '2024-01-15',
  },
  {
    id: 'org_addis_js',
    name: 'Addis Software Engineers Network',
    telegramHandle: '@addis_js',
    eventsCount: 5,
    totalRegistrations: 280,
    totalCheckIns: 242,
    status: 'Active',
    verified: true,
    joinedDate: '2024-03-22',
  },
  {
    id: 'org_ethio_ai',
    name: 'Ethiopian Artificial Intelligence Lab',
    telegramHandle: '@ethio_ai',
    eventsCount: 4,
    totalRegistrations: 310,
    totalCheckIns: 275,
    status: 'Active',
    verified: true,
    joinedDate: '2024-05-10',
  },
  {
    id: 'org_wit_ethiopia',
    name: 'Women In Tech Ethiopia',
    telegramHandle: '@wit_ethiopia',
    eventsCount: 3,
    totalRegistrations: 195,
    totalCheckIns: 168,
    status: 'Active',
    verified: true,
    joinedDate: '2024-08-04',
  },
  {
    id: 'org_cloud_addis',
    name: 'Cloud Native Addis Ababa',
    telegramHandle: '@cloud_addis',
    eventsCount: 2,
    totalRegistrations: 90,
    totalCheckIns: 70,
    status: 'Inactive',
    verified: false,
    joinedDate: '2025-01-11',
  },
];

export const mockAdminActivities: AdminActivityRecord[] = [
  {
    id: 'act_01',
    type: 'ATTENDEE_CHECKED_IN',
    message: 'Abebe Kebede checked into React & Modern Frontend Workshop',
    timestamp: '10 minutes ago',
  },
  {
    id: 'act_02',
    type: 'EVENT_CREATED',
    message: 'Sara Tesfaye published new event "AI Agents Meetup Addis Ababa"',
    timestamp: '1 hour ago',
  },
  {
    id: 'act_03',
    type: 'ATTENDEE_REGISTERED',
    message: 'Tigist Worku registered for Women in Tech Community Session',
    timestamp: '3 hours ago',
  },
  {
    id: 'act_04',
    type: 'ORGANIZER_JOINED',
    message: 'New organizer "Cloud Native Addis Ababa" verified on Sheba',
    timestamp: 'Yesterday',
  },
];
