# Deployment

## Requirements

- Node.js runtime compatible with your Next.js version
- PostgreSQL database
- Environment variables:
  - `DATABASE_URL`
  - `DIRECT_URL` (often not required at runtime, but used by Prisma tooling)
  - `NEXTAUTH_SECRET`

## Build and run

```bash
npm install
npm run build
npm run start
```

## Migrations

Recommended in CI/CD:

```bash
npx prisma migrate deploy
```

Avoid running `prisma migrate dev` in production.

## Notes

- NextAuth uses cookies/JWT; ensure your deployment environment supports secure cookies (HTTPS in production).
- Consider setting `NEXTAUTH_URL` if your environment requires it.
