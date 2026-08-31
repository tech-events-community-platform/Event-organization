import bcrypt from 'bcryptjs';
import { query } from '../config/db';

export const seedDatabase = async () => {
  console.log('🌱 Starting clean database initialization...');
  try {
    const passwordHash = await bcrypt.hash('password123', 10);

    // Clean out all previous mock/dummy data in correct dependency order
    console.log('🧹 Purging any mock tickets, badges, registrations, payments, and events...');
    await query('DELETE FROM tickets;');
    await query('DELETE FROM badge_awards;');
    await query('DELETE FROM registrations;');
    await query('DELETE FROM payments;');
    await query('DELETE FROM events;');
    // Delete non-admin users if resetting
    await query("DELETE FROM users WHERE role != 'admin';");

    // Seed ONLY the Super Admin Account
    console.log('👑 Seeding primary Admin account (admin@sheba.et)...');
    const adminId = '33333333-3333-3333-3333-333333333333';
    await query(
      `INSERT INTO users (id, email, password_hash, full_name, role, phone, bio, organization, avatar_url, visibility, member_since, is_active, approval_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, TRUE, 'approved')
       ON CONFLICT (email) DO UPDATE SET
         full_name = EXCLUDED.full_name,
         password_hash = EXCLUDED.password_hash,
         role = 'admin',
         is_active = TRUE,
         approval_status = 'approved';`,
      [
        adminId,
        'admin@sheba.et',
        passwordHash,
        'Sheba Super Admin',
        'admin',
        '+251933445566',
        'System Administrator & Trust Lead for Sheba Platform.',
        'Sheba Platform Systems',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        'public',
        'August 2026',
      ]
    );

    console.log('✅ Clean Admin account seeded successfully: admin@sheba.et (password: password123)');
    console.log('🎉 Database initialization complete! No dummy events or mock users exist.');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
