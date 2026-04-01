# Golf Platform

A full-stack golf subscription platform where players:

- subscribe with Razorpay,
- submit their latest Stableford scores,
- enter monthly score-based draws,
- and support charities through configured contribution preferences.

The project is built with Next.js App Router, React, TypeScript, and MongoDB (Mongoose).

## Core Capabilities

- Authentication and session cookies (JWT-based)
- Role-aware routing (`subscriber`, `admin`)
- Razorpay subscription creation + signature verification + webhook handling
- Cloudinary-based file upload pipeline
- Email forwarding using Resend + React Email templates
- Score management (rolling last 5 scores per user)
- Monthly draw simulation and publishing workflow
- Winner tracking and admin review lifecycle
- Charity discovery, selection, and admin management

## Tech Stack

- Next.js `16.2.1` (App Router)
- React `19.2.4`
- TypeScript
- MongoDB + Mongoose
- Tailwind CSS `v4`
- Razorpay SDK
- Cloudinary SDK (for uploads)
- Resend + React Email (for transactional/forwarded emails)
- `jsonwebtoken`, `bcryptjs`, `react-hook-form`, `react-hot-toast`

## High-Level Architecture

### Application Layers

- `src/app`: routes and UI entry points (home, auth, dashboard, admin, webhook API route)
- `src/actions`: server actions for auth, subscriptions, scores, draws, charity, and admin workflows
- `src/models`: Mongoose schemas (`User`, `Score`, `Draw`, `Winner`, `Charity`)
- `src/lib`: shared infrastructure utilities (DB, JWT/session, draw engine, Razorpay client)
- `src/components`: reusable UI for home, dashboard, admin, and base UI elements
- `src/types`: shared TypeScript contracts between server and client
- `src/proxy.ts`: route protection and role/subscription-based access control

### Key Domain Flows

1. User Auth
	 - Register/login creates a JWT and stores it in an HTTP-only cookie.
	 - Session payload drives access to `/dashboard` and `/admin` sections.

2. Subscription
	 - Authenticated users trigger Razorpay subscription creation.
	 - Payment signature is validated server-side.
	 - Webhook events update user subscription status and end dates.

3. Score Entry
	 - Users can maintain up to 5 scores.
	 - Adding a 6th score removes the oldest score.

4. Draw Lifecycle
	 - Admin simulates draw for current month.
	 - Simulated result can be published.
	 - Publishing persists winners and exposes results to users.

5. Charity
	 - Users can select charity + contribution percentage.
	 - Admin can create/update/feature/deactivate charities.

## Draw Engine Overview

The draw engine lives in `src/lib/drawEngine.ts` and runs the monthly winner pipeline in five stages:

1. Number generation
	 - `drawRandom()` selects 5 unique numbers from `1-45` with uniform probability.
	 - `drawWeighted()` increases probability for numbers that appear more often in subscriber scores.

2. Match detection
	 - `checkUserMatch()` compares one subscriber's score list with drawn numbers.
	 - It returns the best eligible tier only: `five` > `four` > `three`.
	 - `checkAllMatches()` applies the same logic across all active subscribers.

3. Prize pool calculation
	 - `calculatePrizePool()` splits total pool by tier:
	 - `five: 40%`, `four: 35%`, `three: 25%`.
	 - Prior jackpot carryover is added to the five-match bucket.

4. Payout distribution
	 - `calculatePayouts()` groups winners by tier and splits each tier equally.
	 - If there is no five-match winner, the five-tier bucket rolls over to the next month.

5. End-to-end orchestration
	 - `runDraw()` coordinates all steps and returns:
	 - drawn numbers, prize breakdown, winner payouts, and rollover status.
	 - Admin actions then persist simulation/published results in the database.

## Route Overview

- Public
	- `/`
	- `/login`
	- `/register`
	- `/charities`
	- `/charities/[slug]`

- Subscriber Dashboard
	- `/dashboard`
	- `/dashboard/subscribe`
	- `/dashboard/scores`
	- `/dashboard/draws`
	- `/dashboard/charity`

- Admin
	- `/admin`
	- `/admin/users`
	- `/admin/charities`
	- `/admin/draws`
	- `/admin/winners`

- API
	- `POST /api/razorpay/webhook`

## Data Model Summary

- `User`
	- identity, role, subscription metadata, selected charity, contribution percentage
- `Score`
	- `userId`, score value (`1-45`), played date
- `Draw`
	- month/year, draw mode, drawn numbers, prize pool, publication status
- `Winner`
	- user/draw linkage, match tier, payout, review/payment status
- `Charity`
	- profile metadata, featured/active flags, events, total raised

## Local Development

### Prerequisites

- Node.js `20+` recommended
- `pnpm` installed
- MongoDB instance (local or hosted)
- Razorpay account and plan IDs (for subscription flow)

### Install

```bash
pnpm install
```

### Configure Environment

Rename `.env.example` to `.env.local` and fill the required values values

### Run

```bash
pnpm dev
```

Open `http://localhost:3000`.

## Scripts

- `pnpm dev`: start development server
- `pnpm build`: production build
- `pnpm start`: run production server
- `pnpm lint`: run ESLint

## Security and Access Control

- Authentication uses signed JWT stored in HTTP-only cookie `golf_token`.
- `src/proxy.ts` handles route guarding for:
	- unauthenticated access,
	- admin-only route access,
	- subscription-gated dashboard pages.

## Operational Notes

- Draw publishing upserts winners sequentially to avoid unique index race conditions.
- Jackpot rollover is persisted across monthly draw records.
- Score values are validated between `1` and `45`.
- Cloudinary is the target service for file uploads.
- Email forwarding/templates are moving to Resend + React Email; the current stream/email flow remains active until migration is completed.

## Project Status Notes

This repository already contains end-to-end workflows for auth, subscriptions, scores, charities, and admin operations. If you are extending functionality, start with:

- server actions in `src/actions`,
- schemas in `src/models`,
- then corresponding route/components under `src/app` and `src/components`.


## Core Engine Overview
```
1) Number generation:
    - drawRandom picks 5 unique numbers from 1-45 uniformly.
    - drawWeighted biases picks toward historically frequent score values while keeping uniqueness.
2) Match detection:
    - checkUserMatch compares a user's scores with drawn numbers and returns best tier (five/four/three).
    - checkAllMatches runs this for every subscriber.
3) Prize pool split:
    - calculatePrizePool splits total pool into 40% (five), 35% (four), 25% (three),
      and adds jackpot carryover into the five tier.
4) Payout distribution:
    - calculatePayouts groups winners by tier and splits each tier equally.
    - if no five-tier winner exists, the five-tier pool is rolled over.
5) Orchestration:
    - runDraw ties the full flow together and returns drawn numbers, prize breakdown,
      winners, and rollover flag for persistence/use by actions.
```