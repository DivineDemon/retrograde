# Retrograde

Retrograde is a Next.js app with an integrated Elysia + Prisma API mounted under `/api`.

## Environment Variables

Create a `.env` file in the project root.

```bash
DATABASE_URL="postgresql://<user>:<password>@<host>/<db>?sslmode=require"
ADMIN_API_SECRET="<strong-random-secret>"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="<strong-password>"
ADMIN_SESSION_SECRET="<strong-random-session-secret>"
# Optional overrides:
# ADMIN_SESSION_COOKIE_NAME="retrograde_admin_session"
# ADMIN_SESSION_TTL_SECONDS="28800"
# Origin only (no /api). Eden Treaty appends /api/... from the route tree.
NEXT_PUBLIC_API_URL="http://localhost:3000"
# Optional: RSC/server-side fetch base (defaults to http://localhost:3000)
INTERNAL_API_URL="http://localhost:3000"
```

Notes:
- `DATABASE_URL`, `ADMIN_API_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` are required for order/admin API routes.
- `NEXT_PUBLIC_API_URL` / `INTERNAL_API_URL` are optional and must be the **origin** (e.g. `http://localhost:3000`), not `.../api`. If you still use `.../api`, it is normalized automatically.
- In the browser, when unset, the client uses `window.location.origin`.
- `FRONTEND_ORIGIN` and `API_PORT` are only used by the optional standalone Elysia process (see below).

## Install

```bash
npm install
```

## Database Setup

```bash
npm run prisma:generate
npm run prisma:migrate:dev
npm run prisma:seed
```

For first-time local setup with seed in one command:

```bash
npm run prisma:migrate:dev:seed
```

## Run

Start the full app (frontend + API) in one process:

```bash
npm run dev
```

Optional **standalone** Elysia process (same routes as `/api`, useful for debugging without Next):

```bash
npm run api:standalone
```

Watch mode:

```bash
npm run api:standalone:watch
```

Requires `API_PORT` (defaults to `3001`) and `FRONTEND_ORIGIN` for CORS when hitting the API directly.

## Integrated Smoke Checks

Assuming Next dev is running on `http://localhost:3000`.

1) Health:

```bash
curl -i http://localhost:3000/api/health
```

2) Public reads:

```bash
curl -i http://localhost:3000/api/menu
curl -i http://localhost:3000/api/stats
curl -i http://localhost:3000/api/offers/active
```

3) Admin auth guard:

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

# session login -> captures cookie
curl -i -X POST http://localhost:3000/api/admin/auth/login \
  -H 'content-type: application/json' \
  --data "{\"username\":\"${ADMIN_USERNAME}\",\"password\":\"${ADMIN_PASSWORD}\"}"
```

Expected behavior:
- `GET /api/health` returns 200 with `status: "ok"`.
- `GET /api/menu` returns 200 with an array (possibly empty before seed/sync).
- `GET /api/stats` returns 200 and creates default singleton row if missing.
- `GET /api/offers/active` returns 200 when an active offer exists, otherwise 404.
- Admin endpoints accept either `x-admin-secret` or a valid admin session cookie.
