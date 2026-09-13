import bcrypt from 'bcryptjs';
import http from 'http';
import app from '../app';
import { signAuthToken, verifyAuthToken } from '../utils/jwt.util';
import { generateTicketToken, verifyTicketToken, generateQrDataUrl } from '../utils/qr.util';

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

    // 2. Admin Login
    console.log('\n📦 3. Testing Single Admin Account Login...');
    const adminLoginRes = await fetchHttp('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@sheba.et', password: 'password123' },
    });
    assert(adminLoginRes.status === 200 && adminLoginRes.body.data?.token, 'Admin logs in successfully with seeded credentials');
    const adminToken = adminLoginRes.body.data?.token;

    // 3. Attendee Registration Flow
    console.log('\n📦 4. Testing Attendee Direct Registration & Login...');
    const testAttendeeEmail = `attendee_${Date.now()}@example.et`;
    const attendeeRegRes = await fetchHttp('/api/auth/register', {
      method: 'POST',
      body: {
        email: testAttendeeEmail,
        password: 'password123',
        full_name: 'Test Attendee',
        role: 'attendee',
        phone: '+251911001122',
      },
    });
    assert(
      attendeeRegRes.status === 201 &&
      attendeeRegRes.body.data?.token &&
      attendeeRegRes.body.data?.user?.approvalStatus === 'approved',
      'Attendee registers and receives instant login token without approval block'
    );

    // 4. Organizer Registration & Approval Flow
    console.log('\n📦 5. Testing Organizer Registration, 1-Hour Wait Notice & Admin Approval Workflow...');
    const testOrganizerEmail = `organizer_${Date.now()}@gdgaddis.et`;
    const organizerRegRes = await fetchHttp('/api/auth/register', {
      method: 'POST',
      body: {
        email: testOrganizerEmail,
        password: 'password123',
        full_name: 'Sara Mengistu',
        role: 'organizer',
        organization: 'GDG Addis Ababa',
        phone: '+251922334455',
        bio: 'Tech community leader',
      },
    });

    assert(
      organizerRegRes.status === 201 &&
      organizerRegRes.body.data?.isPendingApproval === true &&
      organizerRegRes.body.data?.message?.includes('1 hour'),
      'Organizer registers in PENDING state with message: "you will be using this sytem in 1 hour"'
    );

    const pendingOrganizerId = organizerRegRes.body.data?.user?.id;

    // Organizer Login Before Approval (Must be rejected with 403 / 1-hour wait notice)
    const organizerPreLoginRes = await fetchHttp('/api/auth/login', {
      method: 'POST',
      body: {
        email: testOrganizerEmail,
        password: 'password123',
      },
    });
    assert(
      organizerPreLoginRes.status === 403 &&
      (organizerPreLoginRes.body.message?.includes('1 hour') || organizerPreLoginRes.body.data?.isPendingApproval),
      'Organizer login is blocked prior to approval with 1-hour wait notice'
    );

    // Admin Views Users & Pending Organizers
    const adminUsersRes = await fetchHttp('/api/admin/users', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      adminUsersRes.status === 200 &&
      Array.isArray(adminUsersRes.body.data?.organizers) &&
      adminUsersRes.body.data.organizers.some((o: any) => o.id === pendingOrganizerId && o.approvalStatus === 'pending'),
      'Admin sees newly registered organizer in Pending status'
    );

    // Admin Approves the Organizer
    const approveRes = await fetchHttp(`/api/admin/users/${pendingOrganizerId}/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      approveRes.status === 200 && approveRes.body.data?.approval_status === 'approved',
      'Admin successfully approves the organizer'
    );

    // Organizer Login After Approval (Must succeed)
    const organizerPostLoginRes = await fetchHttp('/api/auth/login', {
      method: 'POST',
      body: {
        email: testOrganizerEmail,
        password: 'password123',
      },
    });
    assert(
      organizerPostLoginRes.status === 200 &&
      organizerPostLoginRes.body.data?.token &&
      organizerPostLoginRes.body.data?.user?.role === 'ORGANIZER',
      'Approved organizer can now log in and access Organizer workspace'
    );

    // TEST SUITE 6: Single Account Upgrade, Admin Approval & Credential-Gated Switching
    console.log('\n📦 6. Testing Single Account Upgrade, Admin Approval & Formal Credential-Gated Role Switching...');
    const upgradeEmail = `upgrade_${Date.now()}@example.et`;
    
    // Step 1: Register as Attendee
    const regAttendeeRes = await fetchHttp('/api/auth/register', {
      method: 'POST',
      body: {
        email: upgradeEmail,
        password: 'Password123!',
        full_name: 'Dagmawi Kebede',
        role: 'attendee',
      },
    });
    assert(regAttendeeRes.status === 201 && regAttendeeRes.body.data?.token, 'Attendee registered successfully');
    const attendeeToken = regAttendeeRes.body.data?.token;
    const attendeeId = regAttendeeRes.body.data?.user?.id;

    // Step 2: Attempt duplicate registration (should return 409 conflict, NOT overwrite account)
    const duplicateRegRes = await fetchHttp('/api/auth/register', {
      method: 'POST',
      body: {
        email: upgradeEmail,
        password: 'Password123!',
        full_name: 'Dagmawi Kebede',
        role: 'organizer',
      },
    });
    assert(duplicateRegRes.status === 409, 'Duplicate registration returns 409 conflict instead of destructive role overwrite');

    // Step 3: Apply for Organizer privileges from settings
    const applyRes = await fetchHttp('/api/auth/apply-organizer', {
      method: 'POST',
      headers: { Authorization: `Bearer ${attendeeToken}` },
      body: {
        organization: 'Sheba Developers Community',
        bio: 'Tech community for builders in Ethiopia',
        phone: '+251933445566',
        password: 'Password123!',
      },
    });
    assert(
      applyRes.status === 200 &&
      applyRes.body.data?.user?.organizerApprovalStatus === 'pending',
      'Attendee submits organizer application with password verification and status becomes pending'
    );

    // Step 4: Verify unapproved switch attempt is rejected
    const unapprovedSwitchRes = await fetchHttp('/api/auth/switch-role', {
      method: 'POST',
      headers: { Authorization: `Bearer ${attendeeToken}` },
      body: { targetRole: 'ORGANIZER', password: 'Password123!' },
    });
    assert(unapprovedSwitchRes.status === 403, 'Switch to Organizer is blocked before admin approval');

    // Step 5: Admin reviews pending applications and approves
    const adminListPending = await fetchHttp('/api/admin/users', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const foundPending = adminListPending.body.data?.organizers?.some(
      (o: any) => o.id === attendeeId && (o.approvalStatus === 'pending' || o.organizerApprovalStatus === 'pending')
    );
    assert(foundPending, 'Admin sees upgraded attendee in organizer review queue');

    const approveUpgradeRes = await fetchHttp(`/api/admin/users/${attendeeId}/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(approveUpgradeRes.status === 200, 'Admin approves attendee organizer application');

    // Step 6: Attendee switches to Organizer with password verification
    const switchWithWrongPw = await fetchHttp('/api/auth/switch-role', {
      method: 'POST',
      headers: { Authorization: `Bearer ${attendeeToken}` },
      body: { targetRole: 'ORGANIZER', password: 'WrongPassword' },
    });
    assert(switchWithWrongPw.status === 401, 'Switch role rejects invalid password');

    const switchWithCorrectPw = await fetchHttp('/api/auth/switch-role', {
      method: 'POST',
      headers: { Authorization: `Bearer ${attendeeToken}` },
      body: { targetRole: 'ORGANIZER', password: 'Password123!' },
    });
    assert(
      switchWithCorrectPw.status === 200 &&
      switchWithCorrectPw.body.data?.user?.role === 'ORGANIZER' &&
      switchWithCorrectPw.body.data?.token,
      'Approved user enters password and successfully switches to Organizer workspace'
    );
    const organizerSessionToken = switchWithCorrectPw.body.data?.token;

    // Step 7: Organizer switches back to Attendee workspace
    const switchBackRes = await fetchHttp('/api/auth/switch-role', {
      method: 'POST',
      headers: { Authorization: `Bearer ${organizerSessionToken}` },
      body: { targetRole: 'ATTENDEE', password: 'Password123!' },
    });
    assert(
      switchBackRes.status === 200 &&
      switchBackRes.body.data?.user?.role === 'ATTENDEE' &&
      switchBackRes.body.data?.user?.isOrganizer === true,
      'Organizer enters password and successfully switches back to personal Attendee workspace'
    );

    // Step 8: Portal Login Verification
    const attendeePortalLogin = await fetchHttp('/api/auth/login', {
      method: 'POST',
      body: { email: upgradeEmail, password: 'Password123!', role: 'ATTENDEE' },
    });
    assert(
      attendeePortalLogin.status === 200 && attendeePortalLogin.body.data?.user?.role === 'ATTENDEE',
      'User can sign in directly to Attendee portal'
    );

    const organizerPortalLogin = await fetchHttp('/api/auth/login', {
      method: 'POST',
      body: { email: upgradeEmail, password: 'Password123!', role: 'ORGANIZER' },
    });
    assert(
      organizerPortalLogin.status === 200 && organizerPortalLogin.body.data?.user?.role === 'ORGANIZER',
      'User can sign in directly to Organizer portal'
    );

  } catch (err: any) {
    console.error('Integration test error:', err);
    failed++;
  } finally {
    server.close();
  }

  console.log('\n====================================================');
  console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
};

runTests();
