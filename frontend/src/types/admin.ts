export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  role: 'ATTENDEE' | 'ORGANIZER' | 'ADMIN';
  eventsRegistered: number;
  eventsAttended: number;
  status: 'Active' | 'Inactive';
  approvalStatus?: 'pending' | 'approved' | 'rejected';
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
  approvalStatus?: 'pending' | 'approved' | 'rejected';
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
