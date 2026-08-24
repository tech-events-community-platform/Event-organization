export interface VerifiedAttendance {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  organizerName: string;
  attendeeId: string;
  attendeeName: string;
  telegramHandle: string;
  verifiedAt: string;
  status: 'Registered' | 'Checked in' | 'Not Checked In';
  checkInTime?: string;
  selfReportedTags?: string[];
}

export interface SponsorReportData {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  organizerName: string;
  totalRegistered: number;
  totalAttended: number;
  attendanceRate: number;
  hourlyCheckIns: { time: string; count: number }[];
  selfReportedSkills: { skill: string; count: number; percentage: number }[];
}
