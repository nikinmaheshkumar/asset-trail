# Security

This document describes security-relevant behavior in Asset Trail.

## Authentication

- NextAuth credentials provider validates user email/password against the database.
- Passwords are stored as bcrypt hashes in `Member.password_hash`.
- Sessions use JWT (`session.strategy = "jwt"`).
- Sensitive secret: `NEXTAUTH_SECRET` must be set in the environment.

Files:
- `app/api/auth/[...nextauth]/route.ts`

## Authorization (RBAC)

Server-side enforcement:
- `lib/auth.ts`
  - `requireAuth()` blocks unauthenticated requests
  - `requireRole([...])` blocks requests from users without the required role(s)

Client-side gating exists only for UX:
- `components/auth/RoleGuard.tsx` hides actions in the UI

Do not treat client-side gating as a security boundary.

## Roles

Defined in `prisma/schema.prisma` as enum `Role`:
- `MASTER_ADMIN`
- `BOARD`
- `SENIOR_CORE`
- `JUNIOR_CORE`

Current policy (high level):
- MASTER_ADMIN:
  - full admin access including users + audit log
- BOARD:
  - can manage inventory and approve/reject/close loans (with restrictions)
- SENIOR_CORE / JUNIOR_CORE:
  - can view inventory and request loans

The exact checks are implemented per API route.

## Password change enforcement

- `Member.mustChangePwd` triggers redirect to `/change-password` in `app/(protected)/layout.tsx`.
- `PATCH /api/members/change-password` updates hash and sets `mustChangePwd=false`.

## Stock integrity

Critical transitions use DB transactions:
- Approve loan decrements `Item.quantity_available` and sets loan state.
- Close loan increments `Item.quantity_available` and sets loan state.

Files:
- `app/api/loans/[id]/approve/route.ts`
- `app/api/loans/[id]/close/route.ts`

## Self-approval restrictions

- BOARD cannot approve or reject their own loan requests.

## Audit trail

- `ActivityLog` records key actions.
- `GET /api/activity` is restricted to MASTER_ADMIN.

## Secrets and repo hygiene

- `.env*` is ignored by git (`.gitignore`).
- Do not commit secrets (database URLs with passwords, `NEXTAUTH_SECRET`, etc.).
