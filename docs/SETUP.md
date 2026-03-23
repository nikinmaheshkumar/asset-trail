# Setup

## Prerequisites

- Node.js 20+ recommended
- PostgreSQL database

## Install

```bash
npm install
```

## Configure environment

Create `.env` in the repo root.

Required:
- `DATABASE_URL`
- `DIRECT_URL`
- `NEXTAUTH_SECRET`

Example:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/asset_trail?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/asset_trail?schema=public"
NEXTAUTH_SECRET="replace-with-a-long-random-string"
```

## Migrate

```bash
npx prisma migrate dev
```

## Seed (optional)

```bash
npx prisma db seed
```

Seed credentials (dev only):
- password: `Password@123`
- examples: `master@assettrail.dev`, `board1@assettrail.dev`, `senior1@assettrail.dev`, `junior1@assettrail.dev`

## Run

```bash
npm run dev
```

Visit `http://localhost:3000`.

## Production build

```bash
npm run build
npm run start
```

## Deploy migrations

In CI/CD, prefer:

```bash
npx prisma migrate deploy
```
