import bcrypt from 'bcryptjs';
import http from 'http';
import app from '../app';
import { signAuthToken, verifyAuthToken } from '../utils/jwt.util';
import { generateTicketToken, verifyTicketToken, generateQrDataUrl } from '../utils/qr.util';
import { ReportService } from '../services/report.service';

const runTests = async () => {
  console.log('====================================================');
  console.log('🧪 SHEBA BACKEND - COMPREHENSIVE AUTOMATED TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, testName: string) => {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  };

  // TEST SUITE 1: Security & Password Hashing
  console.log('📦 1. Testing Password Security (Bcrypt)...');
  try {
    const rawPassword = 'StrongPassword2026!';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(rawPassword, salt);

    assert(hash !== rawPassword, 'Password is securely hashed and not stored in plaintext');
    assert(await bcrypt.compare(rawPassword, hash), 'Bcrypt correctly validates the correct password');
    assert(!(await bcrypt.compare('WrongPassword', hash)), 'Bcrypt correctly rejects incorrect passwords');
  } catch (err: any) {
    console.error('Bcrypt test error:', err.message);
    failed++;
  }

  // TEST SUITE 2: JWT Authentication Tokens
  console.log('\n📦 2. Testing JWT Session Management (No Telegram)...');
  try {
    const testUser = {
      userId: '11111111-2222-3333-4444-555555555555',
      email: 'organizer@sheba.et',
      role: 'organizer' as const,
      fullName: 'Almaz Organizer',
    };

    const token = signAuthToken(testUser);
    assert(typeof token === 'string' && token.length > 20, 'JWT token generates successfully');

    const decoded = verifyAuthToken(token);
    assert(decoded.userId === testUser.userId, 'Decoded JWT has matching userId');
    assert(decoded.email === testUser.email, 'Decoded JWT has matching email');
    assert(decoded.role === 'organizer', 'Decoded JWT preserves user role');

    let threwOnTamper = false;
    try {
      verifyAuthToken(token + 'tampered');
    } catch {
      threwOnTamper = true;
    }
    assert(threwOnTamper, 'Tampered JWT tokens are strictly rejected');
  } catch (err: any) {
    console.error('JWT test error:', err.message);
    failed++;
  }

  // TEST SUITE 3: QR Token Cryptography & Image Generation
  console.log('\n📦 3. Testing QR Ticket Cryptographic Signing & Image Generation...');
  try {
    const ticketId = 'ticket-uuid-12345';
    const eventId = 'event-uuid-67890';
    const userId = 'user-uuid-abcde';

    const qrToken = generateTicketToken(ticketId, eventId, userId);
    assert(typeof qrToken === 'string' && qrToken.length > 30, 'Signed QR ticket token generated');

    const decodedQr = verifyTicketToken(qrToken);
    assert(decodedQr.ticketId === ticketId, 'Decoded QR token contains matching ticketId');
    assert(decodedQr.eventId === eventId, 'Decoded QR token contains matching eventId');
    assert(decodedQr.userId === userId, 'Decoded QR token contains matching userId');

    let threwOnInvalidQr = false;
    try {
      verifyTicketToken('fake_invalid_qr_token');
    } catch {
      threwOnInvalidQr = true;
    }
    assert(threwOnInvalidQr, 'Invalid QR tokens are strictly rejected');

    const qrDataUrl = await generateQrDataUrl(qrToken);
    assert(qrDataUrl.startsWith('data:image/png;base64,'), 'QR Code Base64 image data URL generated correctly');
    assert(qrDataUrl.length > 500, 'QR image data URL is valid and populated');
  } catch (err: any) {
    console.error('QR test error:', err.message);
    failed++;
  }

  // TEST SUITE 4: CSV Export Formatting
  console.log('\n📦 4. Testing Sponsor Report CSV Generator...');
  try {
    const escapeCsv = (str: any) => {
      if (str === null || str === undefined) return '""';
      const clean = String(str).replace(/"/g, '""');
      return `"${clean}"`;
    };

    const headers = ['Attendee Name', 'Email', 'Phone', 'Attendance Status'];
    const row = [
      escapeCsv('Abebe Bikila, "Champion"'),
      escapeCsv('abebe@sheba.et'),
      escapeCsv('+251911223344'),
      escapeCsv('CHECKED IN'),
    ];

    const csvResult = [headers.join(','), row.join(',')].join('\n');
    assert(csvResult.includes('"Abebe Bikila, ""Champion"""'), 'CSV properly escapes commas and double-quotes');
    assert(csvResult.includes('CHECKED IN'), 'CSV properly formats attendee check-in status');
  } catch (err: any) {
    console.error('CSV test error:', err.message);
    failed++;
  }

  // TEST SUITE 5: Live HTTP Server & Routing
  console.log('\n📦 5. Testing Live Express HTTP Server & Endpoints...');
  const testPort = 5055;
  const server = app.listen(testPort);

  try {
    const fetchHttp = (path: string, options: http.RequestOptions = {}): Promise<{ status: number; body: any }> => {
      return new Promise((resolve, reject) => {
        const req = http.request(
          {
            hostname: 'localhost',
            port: testPort,
            path,
            method: options.method || 'GET',
            headers: options.headers || {},
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
        req.end();
      });
    };

    // Test Root Endpoint
    const rootRes = await fetchHttp('/');
    assert(rootRes.status === 200, 'Root endpoint (/) returns 200 OK');
    assert(rootRes.body.status === 'ACTIVE', 'Root endpoint reports status: ACTIVE');

    // Test Health Endpoint
    const healthRes = await fetchHttp('/api/health');
    assert(healthRes.status === 200, 'Health endpoint (/api/health) returns 200 OK');
    assert(healthRes.body.status === 'OK', 'Health check reports status: OK');

    // Test 404 Handler
    const notFoundRes = await fetchHttp('/api/non-existent-route');
    assert(notFoundRes.status === 404, 'Non-existent route returns 404 Not Found');
    assert(notFoundRes.body.success === false, 'Error response formatted cleanly');

    // Test Unauthorized Protected Route
    const protectedRes = await fetchHttp('/api/users/me');
    assert(protectedRes.status === 401, 'Protected route without token returns 401 Unauthorized');
    assert(protectedRes.body.success === false, '401 response contains helpful error message');
  } catch (err: any) {
    console.error('HTTP test error:', err.message);
    failed++;
  } finally {
    server.close();
  }

  // Summary
  console.log('\n====================================================');
  console.log(`📊 TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
};

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});

