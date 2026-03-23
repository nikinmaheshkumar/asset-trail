# Architecture

## Stack

- Framework: Next.js App Router
- UI: Mantine
- Auth: NextAuth (Credentials provider)
- Data access: Prisma ORM
- Database: PostgreSQL

Key folders:
- `app/`: Next.js routes (pages + API routes)
- `components/`: UI components
- `lib/`: shared helpers (auth, prisma, UI/status utilities)
- `prisma/`: schema, migrations, seed

## Runtime split

This app uses both server and client components.

- Server-side:
  - Route group layout in `app/(protected)/layout.tsx` does session checks with `getServerSession`.
  - API routes in `app/api/**/route.ts` are server-only and use Prisma.
- Client-side:
  - Most pages under `app/(protected)/**/page.tsx` are client components and fetch data from API routes.
  - Tables/modals live under `components/**`.

## Authentication

Implementation: `app/api/auth/[...nextauth]/route.ts`

- Provider: Credentials
- Password verification: bcrypt compare against `Member.password_hash`
- Session: JWT
- Session fields propagated:
  - `session.user.id` (number)
  - `session.user.role`
  - `session.user.mustChangePwd`

Protected routing:
- `app/(protected)/layout.tsx`
  - redirects unauthenticated users to `/login`
  - redirects users with `mustChangePwd=true` to `/change-password`

## Authorization (RBAC)

Server enforcement:
- `lib/auth.ts`
  - `requireAuth()`
  - `requireRole(roles)`

Client gating (UX only):
- `components/auth/RoleGuard.tsx` hides UI actions based on role.
- Never rely on client gating for security; API routes enforce roles.

Roles (Prisma enum):
- `MASTER_ADMIN`
- `BOARD`
- `SENIOR_CORE`
- `JUNIOR_CORE`

## Data flow

Typical page flow:
1. User navigates to a protected route.
2. Protected layout checks session on the server.
3. Client page loads and fetches data from an API route.
4. UI updates local state; mutations are executed via API calls.
5. Tables refresh by re-fetching after mutations.

Examples:
- Inventory page (`app/(protected)/inventory/page.tsx`)
  - fetches list via `GET /api/items`
  - borrows via `POST /api/loans/request`
  - admins mutate via `POST/PATCH/DELETE /api/items`
- Admin requests (`components/loans/AdminRequestsTable.tsx`)
  - lists via `GET /api/loans/requests`
  - approves/rejects via `PATCH /api/loans/:id/approve|reject`

## Database

Schema: `prisma/schema.prisma`

Entities:
- `Member`
- `Item`
- `Loan`
- `ActivityLog`

Loan workflow:
- Request creates a `Loan` in `REQUESTED`
- Approve transitions to `APPROVED` and decrements stock
- Close transitions to `CLOSED` and increments stock
- Reject transitions to `REJECTED`

Transactions:
- Approve and close use Prisma transactions to keep `Loan` and `Item` consistent.

## Observability / logs

- API routes log failures with `console.error(...)`.
- `ActivityLog` captures user-visible audit events.
