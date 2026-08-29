import bcrypt from 'bcryptjs';
import http from 'http';
import app from '../app';
import { signAuthToken, verifyAuthToken } from '../utils/jwt.util';
import { generateTicketToken, verifyTicketToken, generateQrDataUrl } from '../utils/qr.util';
import { query } from '../config/db';

const runTests = async () => {
  console.log('====================================================');
  console.log('🧪 SHEBA BACKEND - COMPREHENSIVE AUTOMATED TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, testName: string, detail?: any) => {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`, detail ? detail : '');
      failed++;
    }
  };

  // TEST SUITE 1: Security & Cryptography
  console.log('📦 1. Testing Password Security (Bcrypt) & Token Cryptography...');
  try {
    const rawPassword = 'StrongPassword2026!';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(rawPassword, salt);

    assert(hash !== rawPassword, 'Password securely hashed');
    assert(await bcrypt.compare(rawPassword, hash), 'Bcrypt validates correct password');
    assert(!(await bcrypt.compare('WrongPassword', hash)), 'Bcrypt rejects incorrect passwords');

    // QR Token Cryptography
    const qrToken = generateTicketToken('ticket-123', 'event-456', 'user-789');
    const decodedQr = verifyTicketToken(qrToken);
    assert(decodedQr.ticketId === 'ticket-123' && decodedQr.eventId === 'event-456', 'Dynamic QR pass token signed & verified');

    const qrDataUrl = await generateQrDataUrl(qrToken);
    assert(qrDataUrl.startsWith('data:image/png;base64,'), 'QR Code PNG Base64 generation works');
  } catch (err: any) {
    console.error('Crypto test error:', err);
    failed++;
  }

  // TEST SUITE 2: Live HTTP Server & API Integration Tests
  console.log('\n📦 2. Testing Live Express HTTP Server & API Endpoints...');
  const testPort = 5099;
  const server = app.listen(testPort);

  try {
    const fetchHttp = (path: string, options: { method?: string; headers?: Record<string, string>; body?: any } = {}): Promise<{ status: number; body: any }> => {
      return new Promise((resolve, reject) => {
        const payloadStr = options.body ? JSON.stringify(options.body) : undefined;
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        };
        if (payloadStr) {
          headers['Content-Length'] = Buffer.byteLength(payloadStr).toString();
        }

        const req = http.request(
          {
            hostname: 'localhost',
            port: testPort,
            path,
            method: options.method || 'GET',
            headers,
          },
          (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
              try {
                const parsed = data ? JSON.parse(data) : {};
                resolve({ status: res.statusCode || 500, body: parsed });
              } catch {
                resolve({ status: res.statusCode || 500, body: data });
              }
            });
          }
        );
        req.on('error', reject);
        if (payloadStr) req.write(payloadStr);
        req.end();
      });
    };

    // 1. Health Endpoint
    const healthRes = await fetchHttp('/api/health');
    assert(healthRes.status === 200 && healthRes.body.status === 'OK', 'GET /api/health returns 200 OK');

    // 2. Auth: Login with Seed Accounts
    console.log('\n📦 3. Testing Authentication & Session Management...');
    const attendeeLogin = await fetchHttp('/api/auth/login', {
      method: 'POST',
      body: { email: 'attendee@sheba.et', password: 'password123' },
    });
    assert(attendeeLogin.status === 200 && attendeeLogin.body.data.token, 'POST /api/auth/login (Attendee) authenticates successfully');
    const attendeeToken = attendeeLogin.body.data?.token;

    const organizerLogin = await fetchHttp('/api/auth/login', {
      method: 'POST',
      body: { email: 'organizer@sheba.et', password: 'password123' },
    });
    assert(organizerLogin.status === 200 && organizerLogin.body.data.user.role === 'ORGANIZER', 'POST /api/auth/login (Organizer) authenticates with ORGANIZER role');
    const organizerToken = organizerLogin.body.data?.token;

    const adminLogin = await fetchHttp('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@sheba.et', password: 'password123' },
    });
    assert(adminLogin.status === 200 && adminLogin.body.data.user.role === 'ADMIN', 'POST /api/auth/login (Admin) authenticates with ADMIN role');
    const adminToken = adminLogin.body.data?.token;

    // 3. User Profile & Public Profile
    console.log('\n📦 4. Testing User Profile & Public Verifiable Credentials...');
    const profileRes = await fetchHttp('/api/users/profile', {
      headers: { Authorization: `Bearer ${attendeeToken}` },
    });
    assert(profileRes.status === 200 && profileRes.body.data.email === 'attendee@sheba.et', 'GET /api/users/profile returns authenticated user profile');

    const publicProfileRes = await fetchHttp('/api/users/11111111-1111-1111-1111-111111111111/public');
    assert(publicProfileRes.status === 200 && publicProfileRes.body.data.user.name === 'Abebe Kebede', 'GET /api/users/:id/public returns verifiable profile');
    assert(Array.isArray(publicProfileRes.body.data.badges), 'Public profile returns verified badge timeline');

    // 4. Events & Share Links
    console.log('\n📦 5. Testing Single-Day Events, Custom Questions, & Share Tokens...');
    const eventsRes = await fetchHttp('/api/events');
    assert(eventsRes.status === 200 && eventsRes.body.data.length > 0, 'GET /api/events returns list of events');

    const shareEventRes = await fetchHttp('/api/events/share/shb-react-2026');
    assert(shareEventRes.status === 200 && shareEventRes.body.data.shareLinkToken === 'shb-react-2026', 'GET /api/events/share/:token retrieves event via direct link');
    assert(Array.isArray(shareEventRes.body.data.customQuestions), 'Event includes custom registration questions');

    // 5. Create New Event as Organizer
    const newEventRes = await fetchHttp('/api/events', {
      method: 'POST',
      headers: { Authorization: `Bearer ${organizerToken}` },
      body: {
        title: 'Addis Rust & Distributed Systems Workshop',
        description: 'Hands-on Rust programming for concurrent and networked systems.',
        type: 'workshop',
        date: '2026-10-15',
        startTime: '09:00 AM',
        endTime: '05:00 PM',
        location: 'CapStone Hub, Addis Ababa',
        venueName: 'CapStone Hub',
        capacity: 60,
        isPaid: true,
        ticketPrice: 200,
        customQuestions: [{ id: 'q1', questionText: 'Do you have Rust installed?', isRequired: true, order: 1 }],
      },
    });
    assert(newEventRes.status === 201 && newEventRes.body.data.shareLinkToken, 'POST /api/events creates single-day event and generates shareLinkToken');
    const createdEvent = newEventRes.body.data;

    // 6. Register Attendee for Event
    console.log('\n📦 6. Testing Event Registration & Dynamic Ticket Issuance...');
    const registerRes = await fetchHttp(`/api/events/${createdEvent.id}/register`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${attendeeToken}` },
      body: {
        answers: { q1: 'Yes, Rust 1.82 is installed.' },
        paymentReference: 'TX-CHAPA-TEST-001',
      },
    });
    assert(registerRes.status === 201 && registerRes.body.data.ticket?.qrToken, 'POST /api/events/:id/register registers attendee and issues dynamic QR ticket');

    // 7. Check-in Console (Lookup & Approve Action)
    console.log('\n📦 7. Testing Door Check-in Console & Automatic Badge Granting...');
    const lookupRes = await fetchHttp('/api/checkin/lookup', {
      method: 'POST',
      headers: { Authorization: `Bearer ${organizerToken}` },
      body: {
        eventId: createdEvent.id,
        query: 'Abebe Kebede',
      },
    });
    assert(lookupRes.status === 200 && lookupRes.body.data?.name === 'Abebe Kebede', 'POST /api/checkin/lookup surfaces attendee record with Approve action');

    const approveRes = await fetchHttp('/api/checkin/approve', {
      method: 'POST',
      headers: { Authorization: `Bearer ${organizerToken}` },
      body: {
        eventId: createdEvent.id,
        attendeeId: '11111111-1111-1111-1111-111111111111',
      },
    });
    assert(approveRes.status === 200 && approveRes.body.data.badgeAwarded?.badgeCode === 'attended', 'POST /api/checkin/approve marks attendee checked in and automatically grants Attended badge');

    // 8. 4-Badge Hierarchy & Bulk Awarding
    console.log('\n📦 8. Testing 4-Badge Credential Hierarchy & Bulk Awarding...');
    const bulkAwardRes = await fetchHttp('/api/badges/bulk-award', {
      method: 'POST',
      headers: { Authorization: `Bearer ${organizerToken}` },
      body: {
        eventId: createdEvent.id,
        attendeeUserIds: ['11111111-1111-1111-1111-111111111111'],
        badgeCode: 'speaker',
      },
    });
    assert(bulkAwardRes.status === 200 && bulkAwardRes.body.data.awardedCount === 1, 'POST /api/badges/bulk-award bulk assigns Speaker badge');

    // 9. Sponsor Evidence Report
    console.log('\n📦 9. Testing Sponsor Evidence Reports & Charts Data...');
    const reportRes = await fetchHttp(`/api/reports/events/${createdEvent.id}`, {
      headers: { Authorization: `Bearer ${organizerToken}` },
    });
    assert(reportRes.status === 200 && reportRes.body.data.totalAttended >= 1, 'GET /api/reports/events/:id returns sponsor metric cards');
    assert(reportRes.body.data.badgeDistribution?.attended >= 1, 'Sponsor report calculates badge breakdown');
    assert(Array.isArray(reportRes.body.data.registrationsOverTime), 'Sponsor report returns registration velocity timeline');

    // 10. Admin Oversight & Badge Revocation
    console.log('\n📦 10. Testing Admin Panel Oversight & Badge Revocation...');
    const adminDashRes = await fetchHttp('/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminDashRes.status === 200 && adminDashRes.body.data.totalEvents >= 1, 'GET /api/admin/dashboard returns global platform metrics');

    const adminUsersRes = await fetchHttp('/api/admin/users', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminUsersRes.status === 200 && adminUsersRes.body.data.attendees.length > 0, 'GET /api/admin/users returns platform users list');

    const adminPaymentsRes = await fetchHttp('/api/admin/payments', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminPaymentsRes.status === 200 && Array.isArray(adminPaymentsRes.body.data), 'GET /api/admin/payments returns Chapa settlement logs');

    // 11. Public Search
    console.log('\n📦 11. Testing Public Search API...');
    const searchRes = await fetchHttp('/api/search?q=Abebe');
    assert(searchRes.status === 200 && searchRes.body.data.attendees.length > 0, 'GET /api/search finds public attendee profiles');

    // 12. Security & Failure Cases
    console.log('\n📦 12. Testing Security, Permission Denials, & Failure Cases...');
    const unauthRes = await fetchHttp('/api/users/profile');
    assert(unauthRes.status === 401, '401 Unauthorized returned when token is missing');

    const wrongRoleRes = await fetchHttp('/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${attendeeToken}` },
    });
    assert(wrongRoleRes.status === 403, '403 Forbidden returned when attendee attempts admin action');

    const duplicateCheckinRes = await fetchHttp('/api/checkin/approve', {
      method: 'POST',
      headers: { Authorization: `Bearer ${organizerToken}` },
      body: {
        eventId: createdEvent.id,
        attendeeId: '11111111-1111-1111-1111-111111111111',
      },
    });
    assert(duplicateCheckinRes.status === 409, '409 Conflict returned on duplicate check-in approval attempt');
  } catch (err: any) {
    console.error('HTTP test error:', err);
    failed++;
  } finally {
    server.close();
  }

  // Summary
  console.log('\n====================================================');
  console.log(`📊 FINAL TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
};

runTests().catch((err) => {
  console.error('Test execution fatal error:', err);
  process.exit(1);
});
