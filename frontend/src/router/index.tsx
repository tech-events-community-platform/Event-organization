import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts & Guard
import { PublicLayout } from '../layouts/PublicLayout';
import { AttendeeLayout } from '../layouts/AttendeeLayout';
import { OrganizerLayout } from '../layouts/OrganizerLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

// Public Pages
import { LandingPage } from '../pages/public/LandingPage';
import { EventsPage } from '../pages/public/EventsPage';
import { EventDetailPage } from '../pages/public/EventDetailPage';
import { LoginPage } from '../pages/public/LoginPage';

// Attendee Pages
import { AttendeeDashboardPage } from '../pages/attendee/DashboardPage';
import { MyEventsPage } from '../pages/attendee/MyEventsPage';
import { TicketPage } from '../pages/attendee/TicketPage';
import { ProfilePage } from '../pages/attendee/ProfilePage';
import { AttendanceHistoryPage } from '../pages/attendee/AttendanceHistoryPage';

// Organizer Pages
import { OrganizerDashboardPage } from '../pages/organizer/OrganizerDashboardPage';
import { EventListPage } from '../pages/organizer/EventListPage';
import { CreateEventPage } from '../pages/organizer/CreateEventPage';
import { EventDashboardPage } from '../pages/organizer/EventDashboardPage';
import { AttendeeListPage } from '../pages/organizer/AttendeeListPage';
import { ScannerPage } from '../pages/organizer/ScannerPage';
import { ReportPage } from '../pages/organizer/ReportPage';

// Admin Pages
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminEventsPage } from '../pages/admin/AdminEventsPage';
import { AdminEventDetailPage } from '../pages/admin/AdminEventDetailPage';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';
import { AdminOrganizersPage } from '../pages/admin/AdminOrganizersPage';
import { AdminReportsPage } from '../pages/admin/AdminReportsPage';
import { AdminProfilePage } from '../pages/admin/AdminProfilePage';

export const router = createBrowserRouter([
  // Public Routes
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'events', element: <EventsPage /> },
      { path: 'events/:id', element: <EventDetailPage /> },
    ],
  },
  // Protected Attendee Routes (/app)
  {
    path: '/app',
    element: <ProtectedRoute allowedRoles={['ATTENDEE']} />,
    children: [
      {
        element: <AttendeeLayout />,
        children: [
          { index: true, element: <AttendeeDashboardPage /> },
          { path: 'events', element: <MyEventsPage /> },
          { path: 'ticket/:eventId', element: <TicketPage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'profile/attendance', element: <AttendanceHistoryPage /> },
        ],
      },
    ],
  },
  // Protected Organizer Routes (/organizer)
  {
    path: '/organizer',
    element: <ProtectedRoute allowedRoles={['ORGANIZER']} />,
    children: [
      {
        element: <OrganizerLayout />,
        children: [
          { index: true, element: <OrganizerDashboardPage /> },
          { path: 'events', element: <EventListPage /> },
          { path: 'events/create', element: <CreateEventPage /> },
          { path: 'events/:id', element: <EventDashboardPage /> },
          { path: 'events/:id/attendees', element: <AttendeeListPage /> },
          { path: 'events/:id/scanner', element: <ScannerPage /> },
          { path: 'events/:id/report', element: <ReportPage /> },
        ],
      },
    ],
  },
  // Protected Admin Routes (/admin)
  {
    path: '/admin',
    element: <ProtectedRoute allowedRoles={['ADMIN']} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: 'events', element: <AdminEventsPage /> },
          { path: 'events/:id', element: <AdminEventDetailPage /> },
          { path: 'users', element: <AdminUsersPage /> },
          { path: 'organizers', element: <AdminOrganizersPage /> },
          { path: 'reports', element: <AdminReportsPage /> },
          { path: 'profile', element: <AdminProfilePage /> },
        ],
      },
    ],
  },
  // Fallback redirect
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
