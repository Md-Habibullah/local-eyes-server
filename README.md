# Local Guide Platform — Backend

This repository contains the backend for the Local Guide Platform (Express + TypeScript + Prisma).

Quick status
- Backend implements auth, roles, user profiles, listings, bookings, reviews, wishlist and SSLCommerz payment integration.
- There are a few outstanding recommendations in code (session secret, production cookie settings, tests). See `SAMPLES.md` for checklist and curl examples.

Getting started (local)

1. Copy environment variables

```bash
cp .env.example .env
# Edit .env with your values (DATABASE_URL, JWT secrets, email credentials, etc.)
```

2. Install dependencies

```bash
npm install
```

3. Generate Prisma client and run migrations

```bash
npx prisma generate
# if you have migrations to apply
npx prisma migrate dev --name init
```

4. Run in development

```bash
npm run dev
```

Useful scripts
- `npm run dev` — start TypeScript dev server with `ts-node-dev`.
- `npm run build` — compile TypeScript.

API base
- Base URL: `http://localhost:5000/api/v1`

Important files
- `src/app.ts` — express app, middleware and router mounting
- `src/app/routes/index.ts` — registers module routes
- `src/app/modules/Auth` — registration, login, password flows
- `src/app/modules/Listings` — tour CRUD, file upload handling
- `src/app/modules/Bookings` — booking flows and status updates
- `src/app/modules/Payments` — payment init & success handlers (SSLCommerz)
- `prisma/schema.prisma` — database schema and enums

Testing (scaffolding)
This repo includes a test scaffold in `tests/`. To run tests locally install test deps:

```bash
npm install -D jest ts-jest @types/jest supertest @types/supertest
npx ts-jest config:init
npx jest
```

Postman
- A Postman collection template is provided at `docs/postman_collection.json`. Import it and set `{{baseUrl}}` to `http://localhost:5000/api/v1`.

Deliverables checklist
- See `SAMPLES.md` for a concise checklist to reach full marks and curl examples for core flows.

Contact
- If you want, I can apply small code fixes (session secret, cookie settings), add tests or wire up CI. Reply with which tasks to apply.
