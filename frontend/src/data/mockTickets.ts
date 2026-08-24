import type { Ticket } from '../types/ticket';

export const mockInitialTickets: Ticket[] = [
  {
    id: 'SHB-8921-2026',
    eventId: 'evt_react_workshop_2026',
    userId: 'usr_kirubel_01',
    attendeeName: 'Kirubel Abebe',
    telegramHandle: '@kirubel_tech',
    eventTitle: 'React & Modern Frontend Workshop',
    eventDate: '2026-09-12',
    eventTime: '02:00 PM - 05:30 PM EAT',
    eventLocation: 'Bole Innovation Hub, 4th Floor',
    status: 'Valid',
    issuedAt: '2026-08-15T10:30:00Z',
    qrPayload: 'SHEBA_TICKET_VERIFY::SHB-8921-2026::evt_react_workshop_2026::usr_kirubel_01',
  },
  {
    id: 'SHB-4412-2026',
    eventId: 'evt_open_source_addis',
    userId: 'usr_kirubel_01',
    attendeeName: 'Kirubel Abebe',
    telegramHandle: '@kirubel_tech',
    eventTitle: 'Open Source Addis Meetup',
    eventDate: '2026-08-10',
    eventTime: '02:00 PM - 05:00 PM EAT',
    eventLocation: 'National Library Conference Hall',
    status: 'Checked in',
    issuedAt: '2026-08-01T09:00:00Z',
    checkedInAt: '2026-08-10T14:12:00Z',
    qrPayload: 'SHEBA_TICKET_VERIFY::SHB-4412-2026::evt_open_source_addis::usr_kirubel_01',
  },
];
