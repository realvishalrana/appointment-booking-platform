# Appointment Booking System

A full-stack appointment booking application where patients can hold and book slots with a therapist, including recurring appointments. Built with React + TypeScript (frontend), Node.js + Express + TypeScript (backend), and MySQL.

## Live Demo

> **Deploy:** See [Deployment](#deployment) below. After deploying, add your live URLs here:
> - Frontend: `https://your-frontend-url`
> - Backend API: `https://your-backend-url`

## Demo Credentials

| Role      | Email               | Password     |
|-----------|---------------------|--------------|
| Patient   | patient@demo.com    | password123  |
| Patient 2 | patient2@demo.com   | password123  |
| Patient 3 | patient3@demo.com   | password123  |
| Patient 4 | patient4@demo.com   | password123  |
| Therapist | therapist@demo.com  | password123  |
| Therapist 2 | therapist2@demo.com | password123 |

## Features

- **Patient:** View derived slots, 1-minute holds, one-time/recurring bookings, cancel instance or series
- **Therapist:** View appointments, update status during appointment window, edit schedule without affecting bookings
- **Recurring:** Daily, weekly, bi-weekly, monthly (6-month horizon)
- **Concurrency:** DB transactions, unique constraints, idempotency keys for multi-cluster safety

## Tech Stack

- Frontend: React 19, Vite, TypeScript, React Router
- Backend: Express, TypeScript, Prisma, JWT, Zod, Helmet, express-rate-limit
- Database: MySQL 8

## Local Setup

### Prerequisites

- Node.js 18+
- Docker (for MySQL) or local MySQL on port 3307

### 1. Start MySQL

```bash
docker compose up -d
```

MySQL runs on **port 3307** (to avoid conflict with local MySQL on 3306).

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma db push
npm run db:seed
npm run dev
```

API: http://localhost:3001

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173

## API Overview

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | Auth | Current user |
| GET | `/api/therapists` | Patient | List therapists |
| GET | `/api/therapists/:id/slots` | Patient | Available slots |
| POST | `/api/holds` | Patient | Hold slot (1 min) |
| GET | `/api/holds/me` | Patient | Active hold |
| DELETE | `/api/holds/me` | Patient | Release hold |
| POST | `/api/bookings` | Patient | Confirm booking (Idempotency-Key) |
| GET | `/api/bookings/me` | Patient | My appointments |
| DELETE | `/api/bookings/:id` | Patient | Cancel appointment |
| GET | `/api/series/me` | Patient | My recurring series |
| DELETE | `/api/series/:id` | Patient | Cancel series |
| GET | `/api/therapist/appointments` | Therapist | My appointments |
| PATCH | `/api/therapist/appointments/:id/status` | Therapist | Update status |
| GET | `/api/therapist/schedule` | Therapist | Get schedule |
| PUT | `/api/therapist/schedule` | Therapist | Update schedule |

## Architectural Challenges & Approach

### 1. Concurrency (multiple patients, 3 server clusters)

**Challenge:** Two patients holding or booking the same slot simultaneously.

**Approach:** MySQL transactions + unique constraint on `(therapist_id, start_at)` for holds. Idempotency keys on confirm prevent duplicate bookings across clusters. No in-memory locks.

### 2. Derived slots (not pre-seeded)

**Challenge:** Schedule is weekly template; slots must be computed per date range.

**Approach:** Generate candidate slots from `therapist_schedules`, filter out booked, held, and projected recurring conflicts.

### 3. Temporary holds (1 minute, refresh-safe)

**Challenge:** Hold must survive page refresh and block other patients.

**Approach:** Server-side `slot_holds` with `expires_at`. Frontend polls `GET /holds/me` and shows countdown from server time.

### 4. Recurring appointments

**Challenge:** Multiple frequencies, conflict detection, cancel instance vs series.

**Approach:** `recurring_series` master + materialised `appointments` for 6 months. Monthly uses last-day-of-month rule for short months.

### 5. Distributed idempotency

**Challenge:** Retries from any of 3 API clusters must not create duplicate bookings.

**Approach:** Client sends `Idempotency-Key` header; server stores key → response in `idempotency_keys` table.

## Deployment

### Backend (e.g. Render / Railway)

1. Provision MySQL (Railway, PlanetScale, or Render MySQL)
2. Set env: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `PORT`
3. Build: `npm run build && npx prisma db push && npm run db:seed`
4. Start: `npm start`

### Frontend (e.g. Vercel / Netlify)

1. Set `VITE_API_URL` to backend URL
2. Build: `npm run build`
3. Deploy `dist/`

## Project Structure

```
├── backend/          # Express + Prisma API
├── frontend/         # React + Vite UI
├── docs/             # Design documentation
├── docker-compose.yml
├── README.md
└── AI_USAGE.md
```

docker compose up -d
cd backend && npm install && npx prisma db push && npm run db:seed && npm run dev
cd frontend && npm install && npm run dev