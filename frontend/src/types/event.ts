export type EventCategory = 
  | 'Frontend' 
  | 'AI & ML' 
  | 'Women in Tech' 
  | 'Hackathon' 
  | 'Open Source' 
  | 'Cloud & DevOps'
  | 'Cybersecurity'
  | 'Mobile';

export type EventStatus = 'Upcoming' | 'Live' | 'Completed' | 'Draft';

export interface Event {
  id: string;
  title: string;
  organizer: {
    id: string;
    name: string;
    avatarUrl?: string;
    verified: boolean;
  };
  date: string; // ISO date format e.g. "2026-09-15"
  time: string; // e.g. "02:00 PM - 05:30 PM EAT"
  location: string;
  venueName: string;
  category: EventCategory;
  description: string;
  capacity: number;
  registeredCount: number;
  checkedInCount: number;
  status: EventStatus;
  bannerUrl?: string;
  whatToKnow?: string[];
  skillsFocus?: string[];
  isFeatured?: boolean;
}
