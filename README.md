# Neon Nexus Gaming Cafe OS

Production-ready Gaming Cafe Management Web App for PS5, PS4, and racing wheel lounges.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS + shadcn/ui-style components
- Prisma ORM + Neon PostgreSQL
- Auth.js / NextAuth credentials authentication
- Zustand + Pusher realtime sync
- Razorpay payments and webhook confirmation
- Recharts analytics
- Vercel-ready deployment
- Installable PWA manifest + service worker route

## Folder Structure

```txt
prisma/
  schema.prisma
  seed.ts
src/
  actions/                 Server actions for admin CRUD
  app/
    api/                   Secure API routes
    admin/                 Protected admin panel
    booking/               Customer booking page
    availability/          Live setup board
    memberships/           Membership purchase page
    tournaments/           Event registration page
    account/               Customer QR confirmations
    sw/route.ts            PWA service worker
  auth.ts                  Auth.js configuration
  components/
    admin/                 Dashboard and operations components
    auth/                  Login and register forms
    booking/               Booking console and availability board
    marketing/             Public website sections
    ui/                    shadcn-style primitives
  lib/
    booking-service.ts     Double-booking prevention and booking lifecycle
    session-service.ts     Timers, pause, extend, end, switch, force stop
    payment-service.ts     Razorpay, invoices, ledger payments
    analytics-service.ts   Revenue, occupancy, usage reports
    setup-service.ts       Live availability and status labels
    realtime.ts            Pusher server events
  store/                   Zustand realtime store
```

## Environment

Copy `.env.example` to `.env` and fill these values:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST.neon.tech/gaming_cafe?sslmode=require"
AUTH_SECRET="strong-random-secret"
AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

PUSHER_APP_ID="..."
PUSHER_SECRET="..."
NEXT_PUBLIC_PUSHER_KEY="..."
NEXT_PUBLIC_PUSHER_CLUSTER="ap2"

RAZORPAY_KEY_ID="..."
RAZORPAY_KEY_SECRET="..."
RAZORPAY_WEBHOOK_SECRET="..."
NEXT_PUBLIC_RAZORPAY_KEY_ID="..."
```

## Local Setup

```bash
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Seed credentials:

```txt
admin@neonnexus.local / Admin@12345
staff@neonnexus.local / Admin@12345
player@neonnexus.local / Player@12345
```

## Database

The Prisma schema includes:

- `users`, `accounts`, `sessions`, `verification_tokens`
- `setups`, `setup_sessions`
- `bookings`
- `payments`, `invoices`
- `membership_plans`, `memberships`
- `notifications`
- `analytics`
- `expenses`
- `tournaments`, `tournament_registrations`

Create the initial migration:

```bash
npm run db:migrate -- --name init
```

Deploy migrations on Vercel:

```bash
npm run db:deploy
```

## Business Logic

Booking rules live in `src/lib/booking-service.ts`:

- Prevents overlapping bookings and sessions.
- Applies setup-specific buffer minutes.
- Supports preferred setup or auto-assignment by setup type.
- Holds pending bookings for 15 minutes.
- Applies active membership discounts.
- Confirms booking after token/full payment.

Session rules live in `src/lib/session-service.ts`:

- Start walk-in or booking sessions.
- Pause/resume with pause-time compensation.
- Extend only if the next booking does not conflict.
- End and settle sessions with cash/UPI/card tracking.
- Force stop expired/problem sessions.
- Switch setup after availability validation.
- Emits 10-minute and expired notifications.

Realtime sync is published on every booking/session/payment/setup change and consumed by:

- Public availability page
- Customer booking page
- Admin dashboard
- Session controls

## Razorpay

Create orders via:

```txt
POST /api/payments/razorpay/order
```

Confirm checkout payments via:

```txt
POST /api/payments/razorpay/verify
```

Configure Razorpay webhook:

```txt
POST https://your-domain.com/api/payments/razorpay/webhook
```

Events handled:

- `payment.captured`
- `payment.failed`

## Admin Features

- Dashboard metrics: total setups, active/free setups, occupancy, daily/weekly/monthly earnings, peak hour.
- Live setup cards with timers and one-click extensions.
- Walk-in session start with cash/UPI/card tracking.
- Setup CRUD and pricing management.
- Booking management.
- Analytics charts and CSV revenue export.
- Expense tracking.
- Tournament management.
- Membership plan management.
- User role management.

## Vercel Deployment

1. Create Neon PostgreSQL database.
2. Add all env vars in Vercel project settings.
3. Set build command:

```bash
npm run build
```

4. Set install command:

```bash
npm install
```

5. Run migrations from a trusted environment:

```bash
npm run db:deploy
```

6. Seed only for staging/local unless you want the sample cafe data:

```bash
npm run db:seed
```

## Production Notes

- Use strong `AUTH_SECRET`.
- Configure Pusher private channel auth at `/api/realtime/auth`.
- Keep Razorpay webhook secret enabled.
- Use Neon pooled connection string for serverless runtime.
- Review seed credentials before any public deployment.
- Commit the generated lockfile after `npm install` for reproducible builds.
