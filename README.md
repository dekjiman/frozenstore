# Raf Store

Raf Store is a full-stack storefront for product browsing, persistent carts,
manual bank-transfer checkout, customer order tracking, and admin operations.

## Stack

- Next.js 16 and React 19
- TypeScript and Tailwind CSS
- SQLite with Drizzle ORM
- TestSprite end-to-end verification plans

## Local setup

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For a production build, set a strong `CART_SESSION_SECRET`, then run:

```bash
npm run build
CART_SESSION_SECRET="replace-with-a-strong-secret" npm start
```

The seed script creates development-only customer and admin accounts. Replace or
disable these seeded credentials before deploying publicly.

## Verification

```bash
npm run lint
npm run build
```

TestSprite plans are stored under `.testsprite/plans`.

## Local data

SQLite databases, environment files, build output, dependencies, and uploaded
payment proofs are intentionally excluded from Git.
