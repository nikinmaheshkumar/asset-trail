# Troubleshooting

## I keep getting redirected to /login

- You are not authenticated.
- Go to `/login` and sign in.
- Check that `NEXTAUTH_SECRET` is set.

## I keep getting redirected to /change-password

- Your account has `mustChangePwd=true`.
- Go to `/change-password` and update your password.

## API returns 401 Unauthorized

- You are not logged in, or your NextAuth session cookie is missing/expired.

## API returns 403 Forbidden

- You are logged in but lack required role(s) for that endpoint.

## Prisma cannot connect to the database

- Verify `.env` contains correct `DATABASE_URL` and `DIRECT_URL`.
- Ensure PostgreSQL is running and reachable.
- Ensure the database exists.

## Seeding fails

- `prisma/seed.ts` upserts members and items but creates loans and activity logs.
- If you re-run seeds on a non-empty database, you may hit conflicts depending on data state.
- Easiest fix in local dev: seed against a fresh database.

## Inventory quantity_total update fails

- `PATCH /api/items/:id` rejects lowering `quantity_total` below `quantity_available`.
- Close/return loans first (or increase total).

## Loan approval fails with insufficient stock

- Another approval may have reduced `quantity_available`.
- Reduce requested quantity or restock the item.
