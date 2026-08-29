import bcrypt from 'bcryptjs';
import { query } from '../config/db';
import { generateTicketToken, generateQrDataUrl } from '../utils/qr.util';

export const seedDatabase = async () => {
  console.log('🌱 Starting database seeding...');
  try {
    const passwordHash = await bcrypt.hash('password123', 10);

    // 1. Seed Users (Attendee, Organizer, Admin)
    const usersData = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        email: 'attendee@sheba.et',
        full_name: 'Abebe Kebede',
        role: 'attendee',
        phone: '+251911223344',
        bio: 'Fullstack developer & Open Source enthusiast in Addis Ababa.',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        visibility: 'public',
        member_since: 'August 2026',
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        email: 'organizer@sheba.et',
        full_name: 'Sara Mengistu',
        role: 'organizer',
        phone: '+251922334455',
        organization: 'GDG Addis',
        bio: 'Community Lead at Google Developer Group Addis Ababa.',
        avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
        visibility: 'public',
        member_since: 'January 2026',
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        email: 'admin@sheba.et',
        full_name: 'Hanan Admin',
        role: 'admin',
        phone: '+251933445566',
        organization: 'Sheba Platform Systems',
        bio: 'System Administrator & Trust & Safety Lead for Sheba.',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        visibility: 'public',
        member_since: 'August 2026',
      },
      {
        id: '44444444-4444-4444-4444-444444444444',
        email: 'almaz.winner@sheba.et',
        full_name: 'Almaz Tadesse',
        role: 'attendee',
        phone: '+251944556677',
        bio: 'Machine learning researcher and Hackathon finalist.',
        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
        visibility: 'public',
        member_since: 'June 2026',
      },
    ];

    for (const u of usersData) {
      await query(
        `INSERT INTO users (id, email, password_hash, full_name, role, phone, bio, organization, avatar_url, visibility, member_since)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (email) DO UPDATE SET
           full_name = EXCLUDED.full_name,
           password_hash = EXCLUDED.password_hash,
           role = EXCLUDED.role,
           avatar_url = EXCLUDED.avatar_url,
           visibility = EXCLUDED.visibility;`,
        [u.id, u.email, passwordHash, u.full_name, u.role, u.phone, u.bio, u.organization || null, u.avatar_url, u.visibility, u.member_since]
      );
    }
    console.log('✅ Users seeded successfully.');

    // 2. Seed Single-day Tech Events
    const eventsData = [
      {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        organizer_id: '22222222-2222-2222-2222-222222222222',
        title: 'React 19 & Next.js Architecture Workshop',
        description: 'Intensive full-day hands-on workshop exploring React 19 Server Actions, Server Components, and scalable full-stack web applications.',
        event_type: 'workshop',
        category: 'Workshop',
        event_date: new Date('2026-09-12T09:00:00Z'),
        end_date: new Date('2026-09-12T17:00:00Z'),
        start_time: '09:00 AM',
        end_time: '05:00 PM',
        time_str: '09:00 AM - 05:00 PM EAT',
        location: 'Bole Innovation Hub, 4th Floor, Addis Ababa',
        venue_name: 'Bole Innovation Hub',
        capacity: 100,
        status: 'open',
        is_paid: false,
        ticket_price: 0,
        currency: 'ETB',
        share_link_token: 'shb-react-2026',
        banner_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
        custom_questions: JSON.stringify([
          { id: 'q1', questionText: 'What is your background or experience level with React?', isRequired: true, order: 1 },
          { id: 'q2', questionText: 'GitHub Profile or Portfolio Link', isRequired: false, order: 2 },
        ]),
      },
      {
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        organizer_id: '22222222-2222-2222-2222-222222222222',
        title: 'Addis AI & LLM Builders Hackathon',
        description: 'Single-day hackathon building practical AI agents, Ethiopian NLP solutions, and fine-tuned models for local problems.',
        event_type: 'hackathon',
        category: 'Hackathon',
        event_date: new Date('2026-09-26T08:30:00Z'),
        end_date: new Date('2026-09-26T20:00:00Z'),
        start_time: '08:30 AM',
        end_time: '08:00 PM',
        time_str: '08:30 AM - 08:00 PM EAT',
        location: 'ALX Tech City Hub, 22 Mazoria, Addis Ababa',
        venue_name: 'ALX Tech City',
        capacity: 120,
        status: 'open',
        is_paid: true,
        ticket_price: 150,
        currency: 'ETB',
        share_link_token: 'shb-ai-hack-2026',
        banner_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
        custom_questions: JSON.stringify([
          { id: 'q1', questionText: 'Do you have a team, or are you registering solo?', isRequired: true, order: 1 },
          { id: 'q2', questionText: 'What tech stack do you plan to use?', isRequired: true, order: 2 },
        ]),
      },
      {
        id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        organizer_id: '22222222-2222-2222-2222-222222222222',
        title: 'Ethiopia DevOps & Cloud Native Meetup',
        description: 'Community evening gathering for systems engineers, Kubernetes practitioners, and infrastructure architects.',
        event_type: 'meetup',
        category: 'Meetup',
        event_date: new Date('2026-10-03T14:00:00Z'),
        end_date: new Date('2026-10-03T18:00:00Z'),
        start_time: '02:00 PM',
        end_time: '06:00 PM',
        time_str: '02:00 PM - 06:00 PM EAT',
        location: 'CapStone Village, Kazanchis, Addis Ababa',
        venue_name: 'CapStone Village',
        capacity: 80,
        status: 'open',
        is_paid: false,
        ticket_price: 0,
        currency: 'ETB',
        share_link_token: 'shb-devops-2026',
        banner_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
        custom_questions: JSON.stringify([]),
      },
    ];

    for (const e of eventsData) {
      await query(
        `INSERT INTO events (
          id, organizer_id, title, description, event_type, category,
          event_date, end_date, start_time, end_time, time_str,
          location, venue_name, capacity, status, is_paid, ticket_price,
          currency, share_link_token, banner_url, custom_questions
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          event_type = EXCLUDED.event_type,
          share_link_token = EXCLUDED.share_link_token,
          is_paid = EXCLUDED.is_paid,
          ticket_price = EXCLUDED.ticket_price,
          custom_questions = EXCLUDED.custom_questions;`,
        [
          e.id, e.organizer_id, e.title, e.description, e.event_type, e.category,
          e.event_date, e.end_date, e.start_time, e.end_time, e.time_str,
          e.location, e.venue_name, e.capacity, e.status, e.is_paid, e.ticket_price,
          e.currency, e.share_link_token, e.banner_url, e.custom_questions
        ]
      );
    }
    console.log('✅ Events seeded successfully.');

    // 3. Seed Registrations & Tickets
    const regId1 = '55555555-5555-5555-5555-555555555555';
    const ticketId1 = '66666666-6666-6666-6666-666666666666';
    const eventId1 = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    const userId1 = '11111111-1111-1111-1111-111111111111';

    await query(
      `INSERT INTO registrations (id, event_id, user_id, status, answers, payment_status)
       VALUES ($1, $2, $3, 'registered', $4, 'settled')
       ON CONFLICT (event_id, user_id) DO UPDATE SET status = 'registered';`,
      [regId1, eventId1, userId1, JSON.stringify({ q1: 'Intermediate React & TypeScript developer', q2: 'https://github.com/abebe' })]
    );

    const qrToken1 = generateTicketToken(ticketId1, eventId1, userId1);
    const qrDataUrl1 = await generateQrDataUrl(qrToken1);

    await query(
      `INSERT INTO tickets (
        id, ticket_code, registration_id, event_id, user_id, qr_token, qr_code_data_url, status,
        is_paid, ticket_price, currency, expires_at, checked_in_at, checked_in_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'CHECKED_IN', FALSE, 0, 'ETB', NOW() + INTERVAL '2 days', NOW(), $8)
      ON CONFLICT (registration_id) DO UPDATE SET qr_token = EXCLUDED.qr_token, status = 'CHECKED_IN';`,
      [ticketId1, 'SHB-8921-2026', regId1, eventId1, userId1, qrToken1, qrDataUrl1, '22222222-2222-2222-2222-222222222222']
    );

    // 4. Seed Badge Awards (Attended, Participant, Winner)
    await query(
      `INSERT INTO badge_awards (id, badge_code, badge_label, event_id, user_id, awarded_by, awarded_at)
       VALUES 
       ('77777777-7777-7777-7777-777777777777', 'attended', 'Attended', $1, $2, $3, NOW() - INTERVAL '2 hours'),
       ('88888888-8888-8888-8888-888888888888', 'participant', 'Participant', $1, $2, $3, NOW() - INTERVAL '1 hour')
       ON CONFLICT (event_id, user_id, badge_code) DO NOTHING;`,
      [eventId1, userId1, '22222222-2222-2222-2222-222222222222']
    );

    // Seed Winner Badge for Almaz
    const regId2 = '99999999-9999-9999-9999-999999999999';
    const ticketId2 = 'aaaaaaaa-1111-2222-3333-444444444444';
    const eventId2 = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    const userId2 = '44444444-4444-4444-4444-444444444444';

    await query(
      `INSERT INTO registrations (id, event_id, user_id, status, answers, payment_status)
       VALUES ($1, $2, $3, 'registered', $4, 'settled')
       ON CONFLICT (event_id, user_id) DO NOTHING;`,
      [regId2, eventId2, userId2, JSON.stringify({ q1: 'Team AddisVision', q2: 'PyTorch & FastAPI' })]
    );

    const qrToken2 = generateTicketToken(ticketId2, eventId2, userId2);
    const qrDataUrl2 = await generateQrDataUrl(qrToken2);

    await query(
      `INSERT INTO tickets (
        id, ticket_code, registration_id, event_id, user_id, qr_token, qr_code_data_url, status,
        is_paid, ticket_price, currency, expires_at, checked_in_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'CHECKED_IN', TRUE, 150, 'ETB', NOW() + INTERVAL '2 days', NOW())
      ON CONFLICT (registration_id) DO NOTHING;`,
      [ticketId2, 'SHB-9042-2026', regId2, eventId2, userId2, qrToken2, qrDataUrl2]
    );

    await query(
      `INSERT INTO badge_awards (id, badge_code, badge_label, event_id, user_id, awarded_by, awarded_at)
       VALUES 
       ('bbbbbbbb-1111-2222-3333-444444444444', 'attended', 'Attended', $1, $2, $3, NOW() - INTERVAL '3 hours'),
       ('cccccccc-1111-2222-3333-444444444444', 'winner', 'Winner', $1, $2, $3, NOW() - INTERVAL '30 minutes')
       ON CONFLICT (event_id, user_id, badge_code) DO NOTHING;`,
      [eventId2, userId2, '22222222-2222-2222-2222-222222222222']
    );

    // 5. Seed Payment Record
    await query(
      `INSERT INTO payments (id, transaction_id, event_id, user_id, amount, commission_amount, organizer_payout, currency, status)
       VALUES ('dddddddd-1111-2222-3333-444444444444', 'TX-CHAPA-892110', $1, $2, 150, 4.50, 145.50, 'ETB', 'SETTLED')
       ON CONFLICT (transaction_id) DO NOTHING;`,
      [eventId2, userId2]
    );

    console.log('✅ Registrations, Tickets, Badges, and Payments seeded successfully.');
    console.log('🎉 Database seeding complete!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
};

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
