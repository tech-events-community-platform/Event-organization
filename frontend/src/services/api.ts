import type { Event } from '../types/event';
import type { Ticket } from '../types/ticket';
import type { VerifiedAttendance, SponsorReportData } from '../types/attendance';
import { mockEvents } from '../data/mockEvents';
import { mockInitialTickets } from '../data/mockTickets';
import { mockVerifiedAttendanceHistory, mockSponsorReport } from '../data/mockAttendance';

const EVENTS_KEY = 'sheba_events_v1';
const TICKETS_KEY = 'sheba_tickets_v1';
const ATTENDANCE_KEY = 'sheba_attendance_v1';

// Helpers to load / save LocalStorage
const getStoredData = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key} from LocalStorage`, e);
    return defaultValue;
  }
};

const setStoredData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key} to LocalStorage`, e);
  }
};

// API Service Layer
export const api = {
  // Events
  getEvents: async (): Promise<Event[]> => {
    return getStoredData<Event[]>(EVENTS_KEY, mockEvents);
  },

  getEventById: async (id: string): Promise<Event | undefined> => {
    const events = await api.getEvents();
    return events.find((e) => e.id === id);
  },

  createEvent: async (eventData: Omit<Event, 'id' | 'registeredCount' | 'checkedInCount' | 'organizer'>): Promise<Event> => {
    const events = await api.getEvents();
    const newEvent: Event = {
      ...eventData,
      id: `evt_${Date.now()}`,
      registeredCount: 0,
      checkedInCount: 0,
      organizer: {
        id: 'org_devcomm',
        name: 'DevCommunity Ethiopia',
        verified: true,
        avatarUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=150&q=80',
      },
    };
    const updated = [newEvent, ...events];
    setStoredData(EVENTS_KEY, updated);
    return newEvent;
  },

  // Tickets
  getTickets: async (): Promise<Ticket[]> => {
    return getStoredData<Ticket[]>(TICKETS_KEY, mockInitialTickets);
  },

  getTicketForEvent: async (eventId: string, userId: string): Promise<Ticket | undefined> => {
    const tickets = await api.getTickets();
    return tickets.find((t) => t.eventId === eventId && t.userId === userId);
  },

  registerForEvent: async (eventId: string, userId: string, userName: string, telegramHandle: string): Promise<Ticket> => {
    const event = await api.getEventById(eventId);
    if (!event) throw new Error('Event not found');

    const existingTicket = await api.getTicketForEvent(eventId, userId);
    if (existingTicket) return existingTicket;

    const ticketId = `SHB-${Math.floor(1000 + Math.random() * 9000)}-2026`;
    const newTicket: Ticket = {
      id: ticketId,
      eventId: event.id,
      userId,
      attendeeName: userName,
      telegramHandle,
      eventTitle: event.title,
      eventDate: event.date,
      eventTime: event.time,
      eventLocation: event.location,
      status: 'Valid',
      issuedAt: new Date().toISOString(),
      qrPayload: `SHEBA_TICKET_VERIFY::${ticketId}::${event.id}::${userId}`,
    };

    const tickets = await api.getTickets();
    setStoredData(TICKETS_KEY, [newTicket, ...tickets]);

    // Update event registration count
    const events = await api.getEvents();
    const updatedEvents = events.map((e) =>
      e.id === eventId ? { ...e, registeredCount: e.registeredCount + 1 } : e
    );
    setStoredData(EVENTS_KEY, updatedEvents);

    return newTicket;
  },

  // Scanner & Check-in
  verifyTicketQR: async (qrPayload: string): Promise<{
    result: 'SUCCESS' | 'DUPLICATE' | 'INVALID';
    message: string;
    ticket?: Ticket;
  }> => {
    const tickets = await api.getTickets();
    const ticket = tickets.find((t) => t.qrPayload === qrPayload || t.id === qrPayload);

    if (!ticket) {
      return {
        result: 'INVALID',
        message: 'Invalid or expired ticket QR code.',
      };
    }

    if (ticket.status === 'Checked in') {
      return {
        result: 'DUPLICATE',
        message: `Attendee ${ticket.attendeeName} is ALREADY checked in.`,
        ticket,
      };
    }

    // Mark ticket as checked in
    const checkInTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const updatedTickets = tickets.map((t) =>
      t.id === ticket.id ? { ...t, status: 'Checked in' as const, checkedInAt: new Date().toISOString() } : t
    );
    setStoredData(TICKETS_KEY, updatedTickets);

    // Update Event checkedInCount
    const events = await api.getEvents();
    const updatedEvents = events.map((e) =>
      e.id === ticket.eventId ? { ...e, checkedInCount: e.checkedInCount + 1 } : e
    );
    setStoredData(EVENTS_KEY, updatedEvents);

    // Add to Verified Attendance
    const history = await api.getAttendanceHistory(ticket.userId);
    const newRecord: VerifiedAttendance = {
      id: `att_${Date.now()}`,
      eventId: ticket.eventId,
      eventTitle: ticket.eventTitle,
      eventDate: ticket.eventDate,
      organizerName: 'Organizer Verified',
      attendeeId: ticket.userId,
      attendeeName: ticket.attendeeName,
      telegramHandle: ticket.telegramHandle,
      verifiedAt: new Date().toISOString(),
      status: 'Checked in',
      checkInTime,
    };
    setStoredData(ATTENDANCE_KEY, [newRecord, ...history]);

    return {
      result: 'SUCCESS',
      message: `Check-in successful! Welcome, ${ticket.attendeeName}.`,
      ticket: { ...ticket, status: 'Checked in' },
    };
  },

  // Attendance History
  getAttendanceHistory: async (_userId: string): Promise<VerifiedAttendance[]> => {
    return getStoredData<VerifiedAttendance[]>(ATTENDANCE_KEY, mockVerifiedAttendanceHistory);
  },

  // Sponsor Report
  getSponsorReport: async (eventId: string): Promise<SponsorReportData> => {
    const event = await api.getEventById(eventId);
    if (!event) return mockSponsorReport;

    return {
      ...mockSponsorReport,
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.date,
      totalRegistered: event.registeredCount,
      totalAttended: event.checkedInCount > 0 ? event.checkedInCount : Math.floor(event.registeredCount * 0.85),
    };
  },

  // Admin Platform Services
  getAdminUsers: async () => {
    const { mockAdminUsers } = await import('../data/mockAdminData');
    return getStoredData('sheba_admin_users_v1', mockAdminUsers);
  },

  toggleUserStatus: async (userId: string) => {
    const users = await api.getAdminUsers();
    const updated = users.map((u) =>
      u.id === userId ? { ...u, status: u.status === 'Active' ? ('Inactive' as const) : ('Active' as const) } : u
    );
    setStoredData('sheba_admin_users_v1', updated);
    return updated;
  },

  getAdminOrganizers: async () => {
    const { mockAdminOrganizers } = await import('../data/mockAdminData');
    return getStoredData('sheba_admin_organizers_v1', mockAdminOrganizers);
  },

  toggleOrganizerStatus: async (orgId: string) => {
    const orgs = await api.getAdminOrganizers();
    const updated = orgs.map((o) =>
      o.id === orgId ? { ...o, status: o.status === 'Active' ? ('Inactive' as const) : ('Active' as const) } : o
    );
    setStoredData('sheba_admin_organizers_v1', updated);
    return updated;
  },

  getAdminActivity: async () => {
    const { mockAdminActivities } = await import('../data/mockAdminData');
    return mockAdminActivities;
  },

  updateEventStatus: async (eventId: string, newStatus: 'Upcoming' | 'Live' | 'Completed' | 'Draft') => {
    const events = await api.getEvents();
    const updated = events.map((e) => (e.id === eventId ? { ...e, status: newStatus } : e));
    setStoredData(EVENTS_KEY, updated);
    return updated;
  },
};
