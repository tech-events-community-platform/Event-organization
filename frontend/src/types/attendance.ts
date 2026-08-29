import type { EventType } from './event';

export type BadgeCode = 'attended' | 'participant' | 'winner' | 'speaker';

export interface BadgeDefinition {
  code: BadgeCode;
  label: string;
  description: string;
  iconName: string;
}

export interface BadgeAward {
  id: string;
  badgeCode: BadgeCode;
  badgeLabel: string;
  eventId: string;
  eventTitle: string;
  eventType: EventType;
  eventDate: string;
  eventLocation: string;
  attendeeId: string;
  attendeeName: string;
  attendeeEmail: string;
  issuerName: string; // e.g. "GDG Addis"
  awardedBy: string;
  awardedAt: string;
  revokedAt?: string | null;
}

export interface AttendeeRosterItem {
  id: string;
  registrationId: string;
  attendeeId: string;
  name: string;
  email: string;
  registrationDate: string;
  status: 'Registered' | 'Checked in';
  checkInTime?: string;
  badges: BadgeCode[];
  answers?: Record<string, string>;
}

export interface SponsorReportData {
  eventId: string;
  eventTitle: string;
  eventType: EventType;
  eventDate: string;
  eventLocation: string;
  organizerName: string;
  totalRegistered: number;
  totalAttended: number;
  attendanceRate: number;
  badgeDistribution: {
    attended: number;
    participant: number;
    winner: number;
    speaker: number;
  };
  registrationsOverTime: { date: string; count: number }[];
  hourlyCheckIns: { time: string; count: number }[];
  attendees?: AttendeeRosterItem[];
}
