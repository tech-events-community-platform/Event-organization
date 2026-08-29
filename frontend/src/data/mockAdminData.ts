export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  role: 'ATTENDEE' | 'ORGANIZER' | 'ADMIN';
  eventsRegistered: number;
  eventsAttended: number;
  status: 'Active' | 'Inactive';
  registeredAt: string;
}

export interface AdminOrganizerRecord {
  id: string;
  name: string;
  email: string;
  organization: string;
  eventsCount: number;
  totalRegistrations: number;
  totalCheckIns: number;
  status: 'Active' | 'Inactive';
  joinedDate: string;
}

export interface PaymentIssueRecord {
  id: string;
  transactionId: string;
  attendeeEmail: string;
  eventTitle: string;
  amount: number;
  currency: 'ETB';
  commissionAmount: number;
  gatewayFee: number;
  organizerPayout: number;
  status: 'SETTLED' | 'PENDING' | 'DISPUTED' | 'REFUNDED';
  createdAt: string;
}

export const mockAdminUsers: AdminUserRecord[] = [
  {
    id: 'usr_101',
    name: 'Abebe Kebede',
    email: 'abebe.kebede@example.com',
    role: 'ATTENDEE',
    eventsRegistered: 4,
    eventsAttended: 3,
    status: 'Active',
    registeredAt: '2025-03-10',
  },
  {
    id: 'usr_102',
    name: 'Kirubel Abebe',
    email: 'kirubel@example.com',
    role: 'ATTENDEE',
    eventsRegistered: 3,
    eventsAttended: 2,
    status: 'Active',
    registeredAt: '2025-04-12',
  },
  {
    id: 'usr_103',
    name: 'Sara Tesfaye',
    email: 'sara@devcommunity.et',
    role: 'ORGANIZER',
    eventsRegistered: 5,
    eventsAttended: 5,
    status: 'Active',
    registeredAt: '2024-01-15',
  },
  {
    id: 'usr_104',
    name: 'Tigist Worku',
    email: 'tigist@example.com',
    role: 'ATTENDEE',
    eventsRegistered: 2,
    eventsAttended: 2,
    status: 'Active',
    registeredAt: '2025-06-01',
  },
];

export const mockAdminOrganizers: AdminOrganizerRecord[] = [
  {
    id: 'org_devcomm',
    name: 'Sara Tesfaye',
    email: 'sara@devcommunity.et',
    organization: 'GDG Addis & DevCommunity',
    eventsCount: 8,
    totalRegistrations: 420,
    totalCheckIns: 358,
    status: 'Active',
    joinedDate: '2024-01-15',
  },
  {
    id: 'org_ethio_ai',
    name: 'Dawit AI Lead',
    email: 'dawit@ethioai.et',
    organization: 'Ethiopian AI Lab',
    eventsCount: 4,
    totalRegistrations: 310,
    totalCheckIns: 275,
    status: 'Active',
    joinedDate: '2024-05-10',
  },
];

export const mockPaymentIssues: PaymentIssueRecord[] = [
  {
    id: 'pay_001',
    transactionId: 'CHP-TX-982104',
    attendeeEmail: 'abebe.kebede@example.com',
    eventTitle: 'AI Agents & LLM Orchestration Meetup',
    amount: 250,
    currency: 'ETB',
    commissionAmount: 7.5, // 3%
    gatewayFee: 5.0, // Chapa fee
    organizerPayout: 237.5,
    status: 'SETTLED',
    createdAt: '2026-08-20 11:30 AM',
  },
  {
    id: 'pay_002',
    transactionId: 'CHP-TX-771239',
    attendeeEmail: 'tadesse@example.com',
    eventTitle: 'AI Agents & LLM Orchestration Meetup',
    amount: 250,
    currency: 'ETB',
    commissionAmount: 7.5,
    gatewayFee: 5.0,
    organizerPayout: 237.5,
    status: 'DISPUTED',
    createdAt: '2026-08-21 03:15 PM',
  },
];
