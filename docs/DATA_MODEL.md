# Data model

Prisma schema: `prisma/schema.prisma`

## Enums

### Role

- `MASTER_ADMIN`
- `BOARD`
- `SENIOR_CORE`
- `JUNIOR_CORE`

### ItemStatus

- `WORKING`
- `NEEDS_TESTING`
- `FAULTY`
- `SCRAP`

### LoanStatus

- `REQUESTED`
- `APPROVED`
- `CLOSED`
- `REJECTED`

## Models

### Member

Fields:
- `id` (Int, pk)
- `name` (String)
- `email` (String, unique)
- `password_hash` (String)
- `role` (Role)
- `mustChangePwd` (Boolean)
- `created_at` (DateTime)
- `updated_at` (DateTime)

Relations:
- `loans` - loans requested by this member (`Loan.member_id`)
- `approved_loans` - loans approved by this member (`Loan.approved_by`)

Notes:
- login identity is `email`.
- `mustChangePwd` is used to force the `/change-password` flow.

### Item

Fields:
- `id` (Int, pk)
- `name` (String)
- `category` (String)
- `quantity_total` (Int)
- `quantity_available` (Int)
- `location` (String)
- `status` (ItemStatus)
- `created_at` (DateTime)
- `updated_at` (DateTime)

Relations:
- `loans` - all loans referencing this item

Notes:
- `quantity_available` is decremented on loan approval and incremented on loan close.

### Loan

Fields:
- `id` (Int, pk)
- `item_id` (Int, fk -> Item)
- `member_id` (Int, fk -> Member)
- `quantity` (Int, default 1)
- `requested_at` (DateTime)
- `approved_at` (DateTime?)
- `closed_at` (DateTime?)
- `due_date` (DateTime?)
- `purpose` (String)
- `status` (LoanStatus)
- `approved_by` (Int?, fk -> Member)
- `created_at` (DateTime)
- `updated_at` (DateTime)

Relations:
- `item`
- `member` (borrower)
- `approver`

Indexes:
- `@@index([item_id])`
- `@@index([member_id])`

### ActivityLog

Fields:
- `id` (Int, pk)
- `action` (String)
- `actor_id` (Int)
- `target_id` (Int?)
- `created_at` (DateTime)

Notes:
- Minimal schema for audit events; the app enriches actor details at query time.
