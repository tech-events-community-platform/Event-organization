import type { VerifiedAttendance, SponsorReportData } from '../types/attendance';

export const mockVerifiedAttendanceHistory: VerifiedAttendance[] = [
  {
    id: 'att_01',
    eventId: 'evt_open_source_addis',
    eventTitle: 'Open Source Addis Meetup',
    eventDate: '2026-08-10',
    organizerName: 'Open Source Addis Initiative',
    attendeeId: 'usr_kirubel_01',
    attendeeName: 'Kirubel Abebe',
    telegramHandle: '@kirubel_tech',
    verifiedAt: '2026-08-10T14:12:00Z',
    status: 'Checked in',
    checkInTime: '02:12 PM EAT',
    selfReportedTags: ['Git', 'TypeScript', 'React'],
  },
  {
    id: 'att_02',
    eventId: 'evt_dev_conf_2025',
    eventTitle: 'Addis Developer Conference 2025',
    eventDate: '2025-11-22',
    organizerName: 'DevCommunity Ethiopia',
    attendeeId: 'usr_kirubel_01',
    attendeeName: 'Kirubel Abebe',
    telegramHandle: '@kirubel_tech',
    verifiedAt: '2025-11-22T09:45:00Z',
    status: 'Checked in',
    checkInTime: '09:45 AM EAT',
    selfReportedTags: ['Frontend', 'Vite', 'CSS Architecture'],
  },
];

export const mockSponsorReport: SponsorReportData = {
  eventId: 'evt_react_workshop_2026',
  eventTitle: 'React & Modern Frontend Workshop',
  eventDate: 'September 12, 2026',
  organizerName: 'Addis Software Engineers Network',
  totalRegistered: 68,
  totalAttended: 58,
  attendanceRate: 85.3,
  hourlyCheckIns: [
    { time: '01:30 PM', count: 12 },
    { time: '02:00 PM', count: 28 },
    { time: '02:30 PM', count: 14 },
    { time: '03:00 PM', count: 4 },
  ],
  selfReportedSkills: [
    { skill: 'React / Next.js', count: 52, percentage: 89.6 },
    { skill: 'TypeScript', count: 45, percentage: 77.5 },
    { skill: 'Tailwind CSS', count: 41, percentage: 70.6 },
    { skill: 'Node.js', count: 32, percentage: 55.1 },
    { skill: 'UI / UX Design', count: 18, percentage: 31.0 },
  ],
};
