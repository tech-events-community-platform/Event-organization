export type TicketStatus = 'Valid' | 'Checked in' | 'Expired' | 'Cancelled';

export interface Ticket {
  id: string; // unique ticket ID e.g. "SHB-8921-2026"
  eventId: string;
  userId: string;
  attendeeName: string;
  telegramHandle: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  status: TicketStatus;
  issuedAt: string;
  checkedInAt?: string;
  qrPayload: string;
  qrCodeDataUrl?: string;
}
