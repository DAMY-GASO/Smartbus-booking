# SmartBus

A full-stack Next.js (App Router) dashboard for managing bus trips, bookings,
parcels and fleet operations — with real authentication, a Postgres database
via Prisma, and working CRUD across every module.

## Stack

- **Next.js 14** (App Router, route groups for `(auth)` and `(dashboard)`)
- **TypeScript**
- **Tailwind CSS**
- **Prisma** + PostgreSQL
- **Zod** for validation
- **JWT sessions** in an httpOnly cookie (via `jose`), passwords hashed with `bcryptjs`
- **middleware.ts** guarding every dashboard route and redirecting signed-in users away from `/login` and `/register`

## Getting started

```bash
npm install
cp .env.local .env          # adjust DATABASE_URL and NEXTAUTH_SECRET
npx prisma migrate dev      # create the database schema
npm run prisma:seed         # optional: creates a default admin account
npm run dev
```

The app will be available at http://localhost:3000.

**First account:** the very first user who registers via `/register` is
automatically made an `ADMIN`; everyone after that is an `AGENT`. Or, if you
ran `npm run prisma:seed`, sign in with:

- Email: `admin@smartbus.local`
- Password: `ChangeMe123!` (change this immediately after first login)

## Project structure

```
app/
  (auth)/        # /login, /register — public pages, wired to /api/auth/*
  (dashboard)/   # /dashboard, /trips, /bookings, /parcels, /buses, /reports, /settings
                 # protected by middleware.ts + a server-side session check in layout.tsx
  api/
    auth/        # register, login, logout, me
    buses/       # list, create, get/update/delete one
    trips/       # list, create (auto-creates the Route if new), get/update/delete one
    bookings/    # list, create (validates seat availability + uniqueness), get/update/delete one
    parcels/     # list, create, get/update/delete one
    routes/      # list known origin/destination routes
    reports/     # summary (dashboard stats), revenue (last 6 months)
components/
  ui/            # Button, Card, Input, Badge, Table, Modal
  dashboard/     # Sidebar, Header, StatsCard, DashboardShell
  forms/         # TripForm, BookingForm, BusForm, ParcelForm
lib/
  db.ts          # Prisma client singleton
  auth.ts        # password hashing + JWT session helpers
  utils.ts       # cn(), currency/date formatting, initials
  validation.ts  # Zod schemas shared by forms and API routes
types/           # Shared TypeScript types
prisma/
  schema.prisma  # User, Bus, Route, Trip, Booking, Parcel
  seed.ts        # creates a default admin account
middleware.ts    # route protection
```

## How data flows

Every dashboard page (`Trips`, `Bookings`, `Parcels`, `Buses`) is a client
component that fetches its list from the matching API route on mount, and
opens a `Modal` with the matching form to create new records — the list
refreshes automatically after a successful save. All API routes require a
valid session and return `401` otherwise.

- **Trips** don't require you to manage "Routes" separately — just type an
  origin and destination; the API finds or creates the matching `Route` row.
- **Bookings** are blocked if the trip is cancelled/completed, if the seat
  number exceeds the bus capacity, or if that seat is already taken on that
  trip (enforced at the database level with a unique constraint).
- **Reports** are computed live from the database (this month's totals, and
  the last 6 months of combined booking + parcel revenue).

## Suggested next steps

- Add row actions (edit/cancel) using the existing `PATCH`/`DELETE` endpoints
  — they're implemented, just not yet wired to buttons in the tables
- Add role-based access (e.g. only `ADMIN`/`MANAGER` can delete records)
- Add pagination/search to the list endpoints as data grows
- Replace the `bookings`/`parcels` phone fields with a proper input mask for Tanzanian numbers
