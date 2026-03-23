# Features

## Inventory

UI:
- `app/(protected)/inventory/page.tsx`
- `components/inventory/*`

Capabilities:
- View inventory list (all authenticated roles)
- Filter/search by name/category/status; optionally show low-stock only
- Borrow/request an item via `RequestLoanModal`
- Admin actions (MASTER_ADMIN, BOARD): add/edit/delete items

Borrowing constraints are enforced server-side by `POST /api/loans/request`.

## Loans

User:
- `app/(protected)/my-loans/page.tsx`
- `components/loans/MyLoansTable.tsx`

Capabilities:
- View personal loan history
- Filter by status and search item/category

Admin:
- Pending requests: `app/(protected)/admin/requests/page.tsx` + `components/loans/AdminRequestsTable.tsx`
- Active loans: `app/(protected)/admin/loans/page.tsx` + `components/loans/AdminActiveLoansTable.tsx`

Actions:
- Approve/reject requests
- Close active loans (return)

## Dashboard

UI:
- `app/(protected)/dashboard/page.tsx`

Behavior:
- Admin dashboard for MASTER_ADMIN/BOARD:
  - system stats
  - pending requests preview
  - active loans preview
  - low stock preview
- User dashboard for SENIOR_CORE/JUNIOR_CORE:
  - my active loans
  - my pending requests
  - overdue alerts
  - low stock view-only alerts

Data:
- `GET /api/dashboard`

## Analytics

API:
- `GET /api/analytics`

Includes:
- global counts
- most borrowed items
- monthly activity (last ~6 months)
- top borrowers

## Users (member management)

UI (MASTER_ADMIN only):
- `app/(protected)/admin/users/page.tsx`
- `components/users/*`

Capabilities:
- List members
- Create member
- Change role (protects against removing last MASTER_ADMIN)
- Delete member (protects against deleting last MASTER_ADMIN)
- Reset password (forces must-change-password)

## Activity log

UI (MASTER_ADMIN only):
- `app/(protected)/admin/activity/page.tsx`
- `components/loans/ActivityTable.tsx`

Capabilities:
- Paginated browsing
- Filter by action
- Search by actor name/email
