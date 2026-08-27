# Sheba Backend — MVP API Documentation & Developer Guide

Backend API for **Sheba**: Event management and verified participation platform connecting event organizers with attendees.

---

## 🛠 Tech Stack
- **Runtime**: Node.js + Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon Serverless Postgres with `pg` pool)
- **Security**: JWT session tokens, `bcryptjs` password hashing, Signed HMAC/JWT QR verification
- **QR Generation**: `qrcode` (Base64 Data URLs)

---

## 🚀 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory (refer to `.env.example`):
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-sample-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
TICKET_SIGNING_SECRET=your_ticket_signing_secret_key
CORS_ORIGIN=*
```

### 3. Run in Development Mode
```bash
npm run dev
```

### 4. Build & Production Run
```bash
npm run build
npm start
```

---

## 📌 Database Schema Summary

The database migrations run automatically on server start when `DATABASE_URL` is configured.
- `users`: id (UUID), email, password_hash, full_name, role (`attendee` | `organizer` | `admin`), phone, bio, organization, timestamps.
- `events`: id (UUID), organizer_id, title, description, category, event_date, end_date, location, capacity, status (`published` | `draft` | `cancelled` | `completed`), banner_url, timestamps.
- `registrations`: id (UUID), event_id, user_id, status (`registered` | `cancelled`), registered_at, timestamps. Unique per `(event_id, user_id)`.
- `tickets`: id (UUID), registration_id, event_id, user_id, qr_token, qr_code_data_url, status (`ISSUED` | `CHECKED_IN` | `CANCELLED` | `EXPIRED`), checked_in_at, checked_in_by, timestamps.

---

## 📡 API Endpoints Reference

### 1. Authentication (`/api/auth`)

#### `POST /api/auth/register`
Create a new user account (Attendee or Organizer).
- **Body**:
```json
{
  "email": "organizer@sheba.et",
  "password": "Password123!",
  "full_name": "Almaz Tesfaye",
  "role": "organizer", // "attendee" | "organizer"
  "organization": "Addis Tech Hub",
  "phone": "+251911234567"
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "User registered successfully.",
  "data": {
    "user": {
      "id": "c1f72a39-...",
      "email": "organizer@sheba.et",
      "full_name": "Almaz Tesfaye",
      "role": "organizer",
      "organization": "Addis Tech Hub"
    },
    "token": "eyJhbGciOi..."
  }
}
```

#### `POST /api/auth/login`
Authenticate with email & password.
- **Body**:
```json
{
  "email": "organizer@sheba.et",
  "password": "Password123!"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOi..."
  }
}
```

#### `GET /api/auth/me`
Header: `Authorization: Bearer <token>`
Returns the current logged-in user profile.

#### `POST /api/auth/logout`
Header: `Authorization: Bearer <token>`
Instructs client to clear stored session token.

---

### 2. User & Participation Profile (`/api/users`)

#### `GET /api/users/me`
Header: `Authorization: Bearer <token>`
Get current user details.

#### `PATCH /api/users/me`
Header: `Authorization: Bearer <token>`
Update profile (full_name, phone, bio, organization).

#### `GET /api/users/me/attendance`
Header: `Authorization: Bearer <token>`
Get attendee's verified participation history (all events where ticket status is `CHECKED_IN`).
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Attendance and verified participation history retrieved.",
  "data": [
    {
      "ticket_id": "9b1deb4d-...",
      "ticket_status": "CHECKED_IN",
      "checked_in_at": "2026-08-25T14:32:00.000Z",
      "event_id": "3fa85f64-...",
      "event_title": "Addis AI Summit 2026",
      "event_date": "2026-08-25T09:00:00.000Z",
      "event_location": "Millennium Hall, Addis Ababa",
      "organizer_name": "Addis Tech Hub"
    }
  ]
}
```

---

### 3. Events (`/api/events`)

#### `GET /api/events`
List published events.
- **Query Params**: `search`, `category`, `status`, `upcomingOnly=true`, `limit`, `offset`.

#### `GET /api/events/:id`
Get single event with live registration & check-in counts.

#### `POST /api/events` (Organizer only)
Header: `Authorization: Bearer <organizer_token>`
- **Body**:
```json
{
  "title": "Addis Tech Expo 2026",
  "description": "The largest tech exhibition in East Africa.",
  "category": "Technology",
  "event_date": "2026-09-15T09:00:00Z",
  "end_date": "2026-09-15T18:00:00Z",
  "location": "Skylight Hotel, Addis Ababa",
  "capacity": 500,
  "banner_url": "https://example.com/banner.jpg"
}
```

#### `PATCH /api/events/:id` (Organizer only)
Update event details.

#### `DELETE /api/events/:id` (Organizer only)
Delete/cancel event.

#### `POST /api/events/:id/register` (Attendee)
Header: `Authorization: Bearer <attendee_token>`
Registers attendee for event, checks capacity limit, prevents duplicate registration, and issues QR ticket automatically.
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "Successfully registered for event. QR Ticket issued.",
  "data": {
    "registration_id": "4e71a39b-...",
    "ticket": {
      "id": "e817a123-...",
      "qr_token": "eyJhbGciOi...",
      "qr_code_data_url": "data:image/png;base64,...",
      "status": "ISSUED"
    }
  }
}
```

#### `GET /api/events/:id/registration`
Check current user registration and ticket status.

#### `DELETE /api/events/:id/register`
Cancel registration & invalidate ticket.

---

### 4. Tickets (`/api/tickets`)

#### `GET /api/tickets/:eventId`
Header: `Authorization: Bearer <token>`
Returns attendee's ticket and Base64 QR Code image for display in mobile or web.

---

### 5. Check-In & QR Verification (`/api/checkin`)

#### `POST /api/checkin/verify` (Organizer only)
Header: `Authorization: Bearer <organizer_token>`
- **Body**:
```json
{
  "qr_token": "eyJhbGciOi...", // Extracted by html5-qrcode from attendee QR
  "event_id": "3fa85f64-..." // Optional: enforce check-in only matches this event
}
```
- **Responses**:
  - **Success (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Check-in verified successfully. Attendance recorded.",
    "data": {
      "check_in_status": "SUCCESS",
      "attendee": {
        "id": "...",
        "full_name": "Abebe Bikila",
        "email": "abebe@example.com",
        "phone": "+251912345678",
        "organization": "Freelancer"
      },
      "event": {
        "id": "...",
        "title": "Addis Tech Expo 2026",
        "event_date": "2026-09-15T09:00:00.000Z",
        "location": "Skylight Hotel"
      },
      "ticket": {
        "id": "...",
        "status": "CHECKED_IN",
        "checked_in_at": "2026-09-15T09:14:22.123Z"
      }
    }
  }
  ```
  - **Duplicate Scan (409 Conflict)**:
  ```json
  {
    "success": false,
    "message": "Already Checked In! This ticket was already verified on 9/15/2026 at 9:14:22 AM.",
    "error": "ALREADY_CHECKED_IN",
    "data": {
      "checked_in_at": "2026-09-15T09:14:22.123Z",
      "attendee": {
        "full_name": "Abebe Bikila",
        "email": "abebe@example.com"
      }
    }
  }
  ```
  - **Invalid/Tampered QR (400 Bad Request)**:
  ```json
  {
    "success": false,
    "message": "Invalid or corrupted QR ticket token."
  }
  ```

---

### 6. Organizer Reports & CSV Export (`/api/reports`)

#### `GET /api/reports/events/:id` (Organizer only)
Header: `Authorization: Bearer <organizer_token>`
Retrieves comprehensive attendance metrics, hourly check-in breakdown, and full attendee list.

#### `GET /api/reports/events/:id/export` (Organizer only)
Header: `Authorization: Bearer <organizer_token>`
Directly streams downloadable CSV file:
- Content-Type: `text/csv`
- Content-Disposition: `attachment; filename="sheba_attendance_report_<event_name>_<date>.csv"`
- Columns: `Attendee Name`, `Email`, `Phone`, `Organization`, `Registration Status`, `Registered At`, `Attendance Status`, `Checked-In At`.

