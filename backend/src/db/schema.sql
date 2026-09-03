-- Sheba Database Schema
-- Compatible with PostgreSQL / Neon

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'attendee' CHECK (role IN ('attendee', 'organizer', 'admin', 'ATTENDEE', 'ORGANIZER', 'ADMIN')),
    phone VARCHAR(50),
    bio TEXT,
    organization VARCHAR(255),
    avatar_url TEXT,
    visibility VARCHAR(20) NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
    member_since VARCHAR(50) DEFAULT 'August 2026',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    approval_status VARCHAR(50) NOT NULL DEFAULT 'approved' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Alter table commands to safely update existing users table without data loss
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) NOT NULL DEFAULT 'public';
ALTER TABLE users ADD COLUMN IF NOT EXISTS member_since VARCHAR(50) DEFAULT 'August 2026';
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) NOT NULL DEFAULT 'approved';

-- Events Table (Single-day tech events only: hackathon, workshop, meetup)
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    event_type VARCHAR(50) NOT NULL DEFAULT 'workshop' CHECK (event_type IN ('hackathon', 'workshop', 'meetup')),
    category VARCHAR(100) DEFAULT 'Tech',
    event_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    start_time VARCHAR(50) DEFAULT '09:00 AM',
    end_time VARCHAR(50) DEFAULT '05:00 PM',
    time_str VARCHAR(100) DEFAULT '09:00 AM - 05:00 PM EAT',
    location VARCHAR(255) NOT NULL,
    venue_name VARCHAR(255),
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    status VARCHAR(50) NOT NULL DEFAULT 'open',
    is_paid BOOLEAN NOT NULL DEFAULT FALSE,
    ticket_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(10) NOT NULL DEFAULT 'ETB',
    share_link_token VARCHAR(100) UNIQUE,
    custom_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    banner_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Alter table commands for events
ALTER TABLE events ADD COLUMN IF NOT EXISTS poster_image_url TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_type VARCHAR(50) NOT NULL DEFAULT 'workshop';
ALTER TABLE events ADD COLUMN IF NOT EXISTS start_time VARCHAR(50) DEFAULT '09:00 AM';
ALTER TABLE events ADD COLUMN IF NOT EXISTS end_time VARCHAR(50) DEFAULT '05:00 PM';
ALTER TABLE events ADD COLUMN IF NOT EXISTS time_str VARCHAR(100) DEFAULT '09:00 AM - 05:00 PM EAT';
ALTER TABLE events ADD COLUMN IF NOT EXISTS venue_name VARCHAR(255);
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_paid BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS ticket_price NUMERIC(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS currency VARCHAR(10) NOT NULL DEFAULT 'ETB';
ALTER TABLE events ADD COLUMN IF NOT EXISTS share_link_token VARCHAR(100);
ALTER TABLE events ADD COLUMN IF NOT EXISTS custom_questions JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE events ADD COLUMN IF NOT EXISTS poster_image_url TEXT;
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_status_check;
ALTER TABLE events ADD CONSTRAINT events_status_check CHECK (status IN ('open', 'closed', 'completed', 'canceled', 'cancelled', 'postponed', 'draft', 'published'));

-- Registrations Table
CREATE TABLE IF NOT EXISTS registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'cancelled')),
    answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    payment_reference VARCHAR(255),
    payment_status VARCHAR(50) NOT NULL DEFAULT 'settled',
    registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_event_user_registration UNIQUE (event_id, user_id)
);

-- Alter table commands for registrations
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS answers JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(255);
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) NOT NULL DEFAULT 'settled';
ALTER TABLE registrations DROP CONSTRAINT IF EXISTS unique_event_user_registration;
ALTER TABLE registrations ADD CONSTRAINT unique_event_user_registration UNIQUE (event_id, user_id);

-- Password Reset Tokens Table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);

-- Check-Ins Table (Section 4: Door Duty check-ins with soft-void Undo support)
CREATE TABLE IF NOT EXISTS check_ins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    approved_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    approved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    voided_at TIMESTAMPTZ,
    voided_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tickets Table
CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_code VARCHAR(50),
    registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE UNIQUE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    qr_token TEXT UNIQUE NOT NULL,
    qr_code_data_url TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'ISSUED' CHECK (status IN ('ISSUED', 'CHECKED_IN', 'CANCELLED', 'EXPIRED', 'Valid', 'Used', 'Cancelled', 'Expired')),
    is_paid BOOLEAN NOT NULL DEFAULT FALSE,
    ticket_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(10) NOT NULL DEFAULT 'ETB',
    expires_at TIMESTAMPTZ,
    checked_in_at TIMESTAMPTZ,
    checked_in_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Alter table commands for tickets
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS ticket_code VARCHAR(50);
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS is_paid BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS ticket_price NUMERIC(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS currency VARCHAR(10) NOT NULL DEFAULT 'ETB';
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_status_check;
ALTER TABLE tickets ADD CONSTRAINT tickets_status_check CHECK (status IN ('ISSUED', 'CHECKED_IN', 'CANCELLED', 'EXPIRED', 'Valid', 'Used', 'Cancelled', 'Expired'));

-- Badge Awards Table (SRS Section 7: Attended, Participant, Winner, Speaker)
CREATE TABLE IF NOT EXISTS badge_awards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    badge_code VARCHAR(50) NOT NULL CHECK (badge_code IN ('attended', 'participant', 'winner', 'speaker')),
    badge_label VARCHAR(100) NOT NULL,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    awarded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at TIMESTAMPTZ,
    revoked_by UUID REFERENCES users(id),
    revocation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_event_user_badge UNIQUE (event_id, user_id, badge_code)
);

-- Payments / Chapa Settlement Table (SRS Section 5 & 11.1)
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    commission_amount NUMERIC(10, 2) NOT NULL,
    organizer_payout NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'ETB',
    status VARCHAR(50) NOT NULL DEFAULT 'SETTLED' CHECK (status IN ('SETTLED', 'FAILED', 'PENDING', 'REFUNDED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_share_link_token ON events(share_link_token);
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_qr_token ON tickets(qr_token);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_badge_awards_user_id ON badge_awards(user_id);
CREATE INDEX IF NOT EXISTS idx_badge_awards_event_id ON badge_awards(event_id);
CREATE INDEX IF NOT EXISTS idx_badge_awards_badge_code ON badge_awards(badge_code);
CREATE INDEX IF NOT EXISTS idx_check_ins_event_id ON check_ins(event_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_user_id ON check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_registration_id ON check_ins(registration_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_voided_at ON check_ins(voided_at);
CREATE INDEX IF NOT EXISTS idx_payments_event_id ON payments(event_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
