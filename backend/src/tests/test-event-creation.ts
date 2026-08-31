import { query } from '../config/db';
import { AuthService } from '../services/auth.service';
import { AdminService } from '../services/admin.service';
import { EventService } from '../services/event.service';

async function testEventFlow() {
  console.log('--- TESTING EVENT CREATION & FETCH FLOW ---');

  // 1. Register an organizer
  const email = `org_${Date.now()}@test.et`;
  console.log(`1. Registering organizer: ${email}`);
  const regResult = await AuthService.registerUser({
    email,
    password: 'password123',
    full_name: 'Organizer Test',
    role: 'organizer',
    organization: 'Addis Devs',
  });
  console.log('Registration result:', regResult);

  // 2. Admin approves organizer
  const orgId = regResult.user.id;
  console.log(`2. Admin approving organizer ID: ${orgId}`);
  await AdminService.approveOrganizer(orgId);

  // 3. Organizer logs in to get active token/user
  console.log('3. Organizer logging in...');
  const loginResult = await AuthService.loginUser({ email, password: 'password123' });
  console.log('Login result user:', loginResult.user);

  // 4. Create event
  console.log('4. Creating event as organizer...');
  const createdEvent = await EventService.createEvent(orgId, {
    title: 'Ethiopia Tech Summit 2026',
    description: 'Premier gathering of software engineers and tech builders.',
    type: 'workshop',
    date: '2026-09-20',
    startTime: '09:00 AM',
    endTime: '05:00 PM',
    location: 'Bole Innovation Hub, Addis Ababa',
    capacity: 100,
    isPaid: false,
    ticketPrice: 0,
    customQuestions: [
      { id: 'q1', questionText: 'Your GitHub URL', isRequired: false, order: 1 }
    ],
  });
  console.log('Created Event:', createdEvent);

  // 5. Fetch all events (public / attendee view)
  console.log('5. Fetching all events...');
  const allEvents = await EventService.getEvents({});
  console.log(`Fetched ${allEvents.length} events:`, allEvents);

  // 6. Fetch organizer events
  console.log(`6. Fetching events for organizer ${orgId}...`);
  const orgEvents = await EventService.getEvents({ organizerId: orgId });
  console.log(`Fetched ${orgEvents.length} organizer events:`, orgEvents);

  console.log('--- ALL EVENT CREATION AND FETCH CHECKS PASSED ---');
}

testEventFlow()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('FAILED:', e);
    process.exit(1);
  });
