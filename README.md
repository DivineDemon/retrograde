<div align="center">

![Retrograde wordmark — bold 3D white and magenta retro-style typography spelling RETROGRADE](public/landing/logo-retrograde.png)

# Retrograde Coffee

[![Live site — Vercel](https://img.shields.io/badge/Live_site-retrograde--weld.vercel.app-000000?style=flat-square&logo=vercel&logoColor=white)](https://retrograde-weld.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Elysia](https://img.shields.io/badge/Elysia-1.4-8B5CF6?style=flat-square)](https://elysiajs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Biome](https://img.shields.io/badge/Biome-60A5FA?style=flat-square&logo=biome&logoColor=white)](https://biomejs.dev/)
[![License](https://img.shields.io/badge/License-GPL%20v3-blue?style=flat-square)](https://www.gnu.org/licenses/gpl-3.0)

**Neo-brutalist coffee bar** — browse a seasonal menu, build a cart, check out with delivery details and pay-on-delivery, and track orders tied to a browser guest session. A full **admin dashboard** manages menu, limited-time offers, site copy, live stats, and order workflows.

[Features](#features) · [Stack](#tech-stack) · [Setup](#getting-started) · [API](#api-overview) · [Scripts](#npm-scripts)

</div>

---

## Overview

Retrograde is a full-stack web app for an independent coffee bar: a **Next.js** storefront with a **Paper / neo-brutalist** visual language (magenta, cyan, yellow accents; Bangers, Press Start 2P, Noto Sans JP), backed by **PostgreSQL** via **Prisma** and a type-safe **Elysia** HTTP API mounted at `/api/*`. The same Elysia app can also run as a **standalone Node server** for debugging or split deployment.

The public deployment is hosted on **Vercel** at **[https://retrograde-weld.vercel.app](https://retrograde-weld.vercel.app)**.

---

## Features

### Customer storefront

| Area | Details |
|------|---------|
| **Landing (`/`)** | Hero with featured menu item, manga-style **limited offer** strip (when an offer is active), preview of menu cards, **stats marquee** (daily cups, vinyl spins, arcade count, combo rate %), and **location / hours** block with map link — all driven by CMS-style data from the API. |
| **Full menu (`/menu`)** | Grid of menu cards: title, description, category, price in **yen** (minor units stored server-side), custom card/title colors per item. |
| **Menu data** | Items belong to categories such as Signature, Cold Brew, Espresso, Filter, Non-coffee, Bakery, Savory, Breakfast, Dessert, etc. Items can be marked **featured** (single hero slot) and **most popular** (up to three for highlights). |
| **Shopping cart** | Client-side cart with **localStorage** persistence, line quantities, subtotals, and optional **limited offer** application (percentage or fixed-amount discount aligned with server pricing rules). |
| **Checkout** | Collects **customer name, phone, street, city, optional notes**; payment mode **cash or card on delivery** (no in-app payment processor). |
| **Guest identity** | HttpOnly **guest cookie** (`GET /api/guest-id` and server helpers) identifies returning visitors for **saved delivery address** and **order history** without accounts. |
| **Orders (`/orders`)** | Lists recent orders for the current guest with status, totals, line items, and offer usage. |

### Limited offers

- Admin-defined bundles with **name, description, optional image**, **discount type** (percentage or fixed minor-unit amount), and **linked menu lines** (menu item + quantity).
- **Duration modes**: **TIME** (availability window) or **CAPACITY** (max redemptions vs. `redemptionsUsed` — tracked for admin; activation validates the offer is currently valid).
- Only **one offer** is **active** at a time in the database; activating one deactivates others.
- The storefront shows the active offer on the home page; the cart can attach `limitedOfferId` so checkout applies the matching **discount** on the server.

### Admin dashboard (`/admin`)

Protected UI (session after login). Operations mirror the **admin API** (see below):

- **Authentication** — Login/logout via cookie-based session; API also accepts **`x-admin-secret`** for scripts and integrations.
- **Menu CRUD** — Create/update/delete items; toggle **active**; set **featured** (exclusive); set **most popular** (batch up to three IDs); **sync from constants** (`POST /api/admin/menu/sync-from-constants`) to upsert seed definitions.
- **Stats** — Replace or **increment** the singleton counters (daily cups, vinyl spins, arcade, combo rate) shown on the landing marquee.
- **Site content** — Edit manga strip labels, headline, description, location label/address, hours lines, and **directions URL**.
- **Offers** — List/create/update/delete limited offers; toggle **active** with validation.
- **Orders** — List with optional **status filter**; **patch status** along an allowed state machine (`PENDING` → `CONFIRMED` → `PREPARING` → `OUT_FOR_DELIVERY` → `COMPLETED`, with **cancel** allowed from non-terminal states); **cancel** shortcut; **delete** order records.

### API layer

- **Elysia** routes grouped under `/api`, exported type **`App`** for **Eden Treaty** end-to-end typing from `@/lib/api/client`.
- **CORS** on the app uses `FRONTEND_ORIGIN` (default `http://localhost:3000`) when the API is hit cross-origin (e.g. standalone server).
- **Prisma** with a **PostgreSQL** driver (e.g. Neon-compatible `DATABASE_URL`).

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | **Next.js** 16 (App Router, React 19) |
| API | **Elysia** + **Eden Treaty** |
| Database | **PostgreSQL** + **Prisma** 7 (generated client in `src/generated/prisma`) |
| UI | **Tailwind CSS** 4, **shadcn/ui**-style primitives (`@base-ui/react`), **Sonner** toasts |
| Forms / validation | **react-hook-form** + **TypeBox** resolvers shared with Elysia schemas |
| Quality | **Biome** (format + lint), **TypeScript** strict project references |

This repo follows the local Next.js conventions — see `AGENTS.md` and `node_modules/next/dist/docs/` when upgrading.

---

## Project layout (high level)

- `src/app/` — App Router pages: store routes under `(store)/`, `admin/`, `api/[[...slugs]]` (Elysia catch-all), `api/guest-id`.
- `src/server/` — Elysia `app`, route modules (`menu`, `stats`, `site-content`, `offers`, `guest`, `orders`, `admin`), plugins (`prisma`, `admin-auth`), `env`, standalone `index.ts`.
- `src/lib/` — Cart store, API client/server helpers, guest cookies, form schemas.
- `src/components/` — Landing, menu, cart/checkout, orders, admin sections, global header/footer.
- `prisma/` — `schema.prisma`, migrations, `seed.ts`.

---

## Getting started

### Prerequisites

- **Node.js** (or **Bun**) and **PostgreSQL** (local or hosted, e.g. Neon).
- Copy environment variables into `.env` at the repo root.

### Environment variables

```bash
# Required for API + Prisma
DATABASE_URL="postgresql://<user>:<password>@<host>/<db>?sslmode=require"

# Admin: API secret (header auth) + dashboard login + signed session cookie
ADMIN_API_SECRET="<strong-random-secret>"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="<strong-password>"
ADMIN_SESSION_SECRET="<strong-random-session-secret>"

# Optional session overrides
# ADMIN_SESSION_COOKIE_NAME="retrograde_admin_session"
# ADMIN_SESSION_TTL_SECONDS="28800"

# Client / server fetch origin — must be the site origin only (no /api path).
# Eden appends /api/... from the route tree.
NEXT_PUBLIC_API_URL="http://localhost:3000"
INTERNAL_API_URL="http://localhost:3000"

# Standalone Elysia process only
API_PORT="3001"
FRONTEND_ORIGIN="http://localhost:3000"
```

**Notes**

- `DATABASE_URL`, `ADMIN_API_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` are required for order and admin routes.
- If `NEXT_PUBLIC_API_URL` or `INTERNAL_API_URL` ends with `/api`, it is **normalized** to the origin.
- In the browser, when `NEXT_PUBLIC_API_URL` is unset, the client uses `window.location.origin`.

### Install

```bash
npm install
# or: bun install
```

### Database

```bash
npm run prisma:generate
npm run prisma:migrate:dev
npm run prisma:seed
```

One-shot migrate + seed:

```bash
npm run prisma:migrate:dev:seed
```

### Run the full app (recommended)

```bash
npm run dev
# or: bun dev
```

Opens the Next.js dev server (frontend + `/api` in one process).

### Build & production

```bash
npm run build
npm run start
```

`build` runs `prisma generate` then `next build`. For hosted Postgres, run `prisma migrate deploy` in your release pipeline.

### Optional: standalone Elysia server

The same API is exported from `src/server/index.ts`. You can run it directly (after loading `.env`), for example:

```bash
npx tsx src/server/index.ts
# or: bunx tsx src/server/index.ts
```

Listens on **`API_PORT`** (default **3001**). Set **`FRONTEND_ORIGIN`** for CORS when calling from the Next app or another origin.

---

## API overview

Base path: **`/api`**.

### Public / guest

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/health` | Liveness: `{ status, service }` |
| GET | `/api/menu` | Active menu (optional `?includeInactive=true`) |
| GET | `/api/menu/featured` | Single featured item |
| GET | `/api/menu/most-popular` | Up to three popular items |
| GET | `/api/menu/:slug` | One item by slug |
| GET | `/api/stats` | Singleton stats (upserted if missing) |
| GET | `/api/site-content` | Singleton site copy (upserted with defaults if missing) |
| GET | `/api/offers/active` | Active limited offer with items, or 404 |
| POST | `/api/orders` | Create order (validated lines, optional `limitedOfferId`, `guestId`) |
| GET | `/api/orders/:id` | Order detail |
| GET | `/api/guest/:guestId/orders` | Guest order list |
| GET | `/api/guest/:guestId/address` | Saved address |
| PUT | `/api/guest/:guestId/address` | Upsert address |

### Admin (`/api/admin/*`)

All routes below require **`x-admin-secret: $ADMIN_API_SECRET`** **or** a valid **admin session cookie** (from `POST /api/admin/auth/login`).

| Area | Endpoints (summary) |
|------|---------------------|
| Auth | `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` |
| Menu | `GET/POST /menu`, `PUT/DELETE /menu/:id`, `PATCH /menu/:id/featured`, `PATCH /menu/most-popular`, `PATCH /menu/:id/active`, `POST /menu/sync-from-constants` |
| Stats | `PUT /stats`, `PATCH /stats/adjust` |
| Site | `GET/PUT /site-content` |
| Offers | `GET/POST /offers`, `PUT/PATCH/DELETE /offers/:id`, `PATCH /offers/:id/active` |
| Orders | `GET /orders`, `PATCH /orders/:id/status`, `POST /orders/:id/cancel`, `DELETE /orders/:id` |

---

## Integrated smoke checks

With the dev server on `http://localhost:3000`:

**1) Health**

```bash
curl -i http://localhost:3000/api/health
```

**2) Public reads**

```bash
curl -i http://localhost:3000/api/menu
curl -i http://localhost:3000/api/stats
curl -i http://localhost:3000/api/offers/active
```

**3) Admin auth**

```bash
# missing secret -> 401
curl -i -X PUT http://localhost:3000/api/admin/stats \
  -H 'content-type: application/json' \
  --data '{"dailyCups":1,"vinylSpins":2,"arcade":3,"comboRate":4}'

# wrong secret -> 403
curl -i -X PUT http://localhost:3000/api/admin/stats \
  -H 'x-admin-secret: wrong-secret' \
  -H 'content-type: application/json' \
  --data '{"dailyCups":1,"vinylSpins":2,"arcade":3,"comboRate":4}'

# correct secret -> 200
curl -i -X PUT http://localhost:3000/api/admin/stats \
  -H "x-admin-secret: ${ADMIN_API_SECRET}" \
  -H 'content-type: application/json' \
  --data '{"dailyCups":1,"vinylSpins":2,"arcade":3,"comboRate":4}'

# session login (captures cookie)
curl -i -X POST http://localhost:3000/api/admin/auth/login \
  -H 'content-type: application/json' \
  --data "{\"username\":\"${ADMIN_USERNAME}\",\"password\":\"${ADMIN_PASSWORD}\"}"
```

**Expected**

- `GET /api/health` → 200, `status: "ok"`.
- `GET /api/menu` → 200, array (may be empty before seed).
- `GET /api/stats` → 200; creates default singleton row if needed.
- `GET /api/offers/active` → 200 if an active offer exists, else 404.
- Admin mutating routes accept **`x-admin-secret`** or a valid admin session cookie.

---

## npm scripts

| Script | Command |
|--------|---------|
| `dev` | `next dev` |
| `build` | `prisma generate && next build` |
| `start` | `next start` |
| `lint` | `biome check --write` |
| `format` | `biome format --write` |
| `typecheck` | `tsc -b --noEmit` |
| `prisma:studio` | Prisma Studio |
| `prisma:seed` | Run seed |
| `prisma:generate` / `prisma:migrate:dev` / `prisma:migrate:deploy` / `prisma:migrate:dev:seed` | Database workflows |

---

## License

This project is licensed under the **GNU General Public License v3.0** — see [`LICENSE`](LICENSE).
