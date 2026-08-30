import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts & Guard
import { PublicLayout } from '../layouts/PublicLayout';
import { AttendeeLayout } from '../layouts/AttendeeLayout';
import { OrganizerLayout } from '../layouts/OrganizerLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

// Public Pages
import { LandingPage } from '../pages/public/LandingPage';
import { LoginPage } from '../pages/public/LoginPage';
import { PublicRegisterPage } from '../pages/public/PublicRegisterPage';
import { PublicProfilePage } from '../pages/public/PublicProfilePage';
import { BadgeDetailPage } from '../pages/public/BadgeDetailPage';
import { PublicSearchPage } from '../pages/public/PublicSearchPage';

// Attendee Pages
import { AttendeeDashboardPage } from '../pages/attendee/DashboardPage';
import { MyEventsPage } from '../pages/attendee/MyEventsPage';
import { TicketPage } from '../pages/attendee/TicketPage';
import { ProfilePage } from '../pages/attendee/ProfilePage';
import { AttendanceHistoryPage } from '../pages/attendee/AttendanceHistoryPage';
import { AccountSettingsPage } from '../pages/attendee/AccountSettingsPage';

// Organizer Pages
import { OrganizerDashboardPage } from '../pages/organizer/OrganizerDashboardPage';
import { EventListPage } from '../pages/organizer/EventListPage';
import { CreateEventPage } from '../pages/organizer/CreateEventPage';
import { AttendeeListPage } from '../pages/organizer/AttendeeListPage';
import { ScannerPage } from '../pages/organizer/ScannerPage';
import { ReportPage } from '../pages/organizer/ReportPage';

// Admin Pages
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminEventsPage } from '../pages/admin/AdminEventsPage';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';

export const router = createBrowserRouter([
  // Public Routes (SRS Section 18)
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'contact', element: <LoginPage /> },
      { path: 'search', element: <PublicSearchPage /> },
      { path: 'e/:token', element: <PublicRegisterPage /> },
      { path: 'events/:id/register', element: <PublicRegisterPage /> },
      { path: 'profile/:id', element: <PublicProfilePage /> },
      { path: 'badge/:id', element: <BadgeDetailPage /> },
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
          { path: 'settings', element: <AccountSettingsPage /> },
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
          { path: 'events/:id/attendees', element: <AttendeeListPage /> },
          { path: 'events/:id/scanner', element: <ScannerPage /> },
          { path: 'events/:id/report', element: <ReportPage /> },
          { path: 'settings', element: <AccountSettingsPage /> },
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
          { path: 'users', element: <AdminUsersPage /> },
          { path: 'organizers', element: <AdminUsersPage /> },
          { path: 'reports', element: <AdminDashboardPage /> },
          { path: 'profile', element: <AccountSettingsPage /> },
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
