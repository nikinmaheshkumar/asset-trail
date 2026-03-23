# API

Base URL (dev): `http://localhost:3000`

All API routes are implemented as Next.js route handlers under `app/api/**/route.ts`.

Auth model:
- API routes rely on NextAuth session cookies.
- Unauthorized responses typically look like `{ "error": "Unauthorized" }` with status `401`.
- Forbidden responses typically look like `{ "error": "Forbidden" }` with status `403`.

## Auth

### NextAuth

- `GET/POST /api/auth/[...nextauth]`
  - handled by NextAuth
  - credentials provider is used by the `/login` page

## Members

Files:
- `app/api/members/route.ts`
- `app/api/members/[id]/route.ts`
- `app/api/members/[id]/reset-password/route.ts`
- `app/api/members/change-password/route.ts`

### List members (MASTER_ADMIN)

- `GET /api/members`

Response (example fields):

```json
[
  { "id": 1, "name": "Alice", "email": "alice@example.com", "role": "MASTER_ADMIN", "created_at": "..." }
]
```

### Create member (MASTER_ADMIN)

- `POST /api/members`

Body:

```json
{ "name": "User", "email": "user@example.com", "password": "Temp@123", "role": "JUNIOR_CORE" }
```

Notes:
- `role` defaults to `JUNIOR_CORE`.
- created members are forced to change password (`mustChangePwd=true`).

### Get member (MASTER_ADMIN)

- `GET /api/members/:id`

### Update member (MASTER_ADMIN)

- `PATCH /api/members/:id`

Body (any subset):

```json
{ "name": "New Name", "email": "new@example.com", "role": "BOARD" }
```

Rule:
- cannot demote the last remaining `MASTER_ADMIN`.

### Delete member (MASTER_ADMIN)

- `DELETE /api/members/:id`

Rule:
- cannot delete the last remaining `MASTER_ADMIN`.

### Reset password (MASTER_ADMIN)

- `PATCH /api/members/:id/reset-password`

Body:

```json
{ "password": "Temp@123" }
```

Effect:
- sets `mustChangePwd=true`.

### Change own password (authenticated)

- `PATCH /api/members/change-password`

Body:

```json
{ "newPassword": "NewPassword@123" }
```

## Items

Files:
- `app/api/items/route.ts`
- `app/api/items/[id]/route.ts`

### List items (authenticated)

- `GET /api/items`

Response includes:
- `id`, `name`, `category`, `quantity_total`, `quantity_available`, `location`, `status`, `created_at`

### Create item (MASTER_ADMIN, BOARD)

- `POST /api/items`

Body:

```json
{ "name": "MacBook Pro", "category": "Laptop", "quantity_total": 10, "location": "IT Rack" }
```

Rules:
- trims `name/category/location`
- `quantity_total` must be non-negative
- rejects duplicates by `(name, location)` case-insensitive

### Get item (authenticated)

- `GET /api/items/:id`

### Update item (MASTER_ADMIN, BOARD)

- `PATCH /api/items/:id`

Body (any subset):

```json
{ "name": "New", "category": "Laptop", "quantity_total": 12, "location": "A1", "status": "WORKING" }
```

Rule:
- cannot set `quantity_total` lower than current `quantity_available`.

### Delete item (MASTER_ADMIN, BOARD)

- `DELETE /api/items/:id`

## Loans

Files:
- `app/api/loans/route.ts`
- `app/api/loans/[id]/route.ts`
- `app/api/loans/my/route.ts`
- `app/api/loans/request/route.ts`
- `app/api/loans/requests/route.ts`
- `app/api/loans/active/route.ts`
- `app/api/loans/[id]/approve/route.ts`
- `app/api/loans/[id]/reject/route.ts`
- `app/api/loans/[id]/close/route.ts`

### List loans (authenticated)

- `GET /api/loans`
- optional query: `?member_id=123`

### Get loan (authenticated)

- `GET /api/loans/:id`

### List my loans (authenticated)

- `GET /api/loans/my`

Includes `item` details.

### Request a loan (authenticated)

- `POST /api/loans/request`

Body:

```json
{ "item_id": 1, "quantity": 1, "purpose": "Project work", "notes": "Optional", "due_date": "2026-03-23" }
```

Rules:
- `item_id` and `purpose` required
- `quantity` defaults to 1 and must be a positive integer
- item must exist, must be `WORKING`, and must have enough available stock
- user cannot have an existing active request/loan for that item
- user cannot request the same item if they have an overdue approved loan for it

### List pending requests (MASTER_ADMIN, BOARD)

- `GET /api/loans/requests`

### List active (approved) loans (MASTER_ADMIN, BOARD)

- `GET /api/loans/active`

### Approve a request (MASTER_ADMIN, BOARD)

- `PATCH /api/loans/:id/approve`

Rules:
- loan must be `REQUESTED`
- BOARD cannot approve their own request
- stock must be sufficient

Effect:
- sets `APPROVED`, `approved_at`, `approved_by`
- sets `due_date = approved_at + 7 days`
- decrements item stock by loan quantity (transaction)

### Reject a request (MASTER_ADMIN, BOARD)

- `PATCH /api/loans/:id/reject`

Rules:
- loan must be `REQUESTED`
- BOARD cannot reject their own request

Effect:
- sets `REJECTED`

### Close (return) an active loan (MASTER_ADMIN, BOARD)

- `PATCH /api/loans/:id/close`

Rules:
- loan must be `APPROVED`
- MASTER_ADMIN can close any loan
- BOARD can only close loans they approved

Effect:
- sets `CLOSED` and `closed_at`
- increments item stock by loan quantity (transaction)

## Dashboard / Analytics

### Dashboard payload (authenticated)

- `GET /api/dashboard`

Returns either:
- admin dashboard payload (stats + previews)
- user dashboard payload (my loans + overdue + low stock)

### Analytics payload (authenticated)

- `GET /api/analytics`

Returns:
- counts (items, active loans, pending requests, low stock)
- most-borrowed items
- monthly activity for last ~6 months
- top user borrow stats

## Activity log

### List activity logs (MASTER_ADMIN)

- `GET /api/activity`

Query params:
- `page` (default 1)
- `per_page` (default 20)
- `search` (actor name/email search)
- `action` (filter exact action)

Response:

```json
{ "logs": [ { "id": 1, "action": "loan_requested", "actor_id": 1, "target_id": 123, "created_at": "...", "actor": { "id": 1, "name": "...", "email": "..." } } ], "total": 100, "page": 1, "perPage": 20 }
```
