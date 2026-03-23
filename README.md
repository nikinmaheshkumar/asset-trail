# Asset Trail

A comprehensive asset management system built with Next.js, designed for organizations to track, manage, and loan equipment and resources efficiently.

## 🚀 Overview

Asset Trail is a full-stack web application that enables organizations to:
- **Manage inventory** - Track assets with categories, quantities, locations, and status
- **Handle loan requests** - Request, approve, and track asset loans with due dates
- **Role-based access control** - Four-tier permission system (Master Admin, Board, Senior Core, Junior Core)
- **Monitor activity** - Comprehensive audit logging and analytics
- **User management** - Member administration with password management

## ✨ Features

### Inventory Management
- View and search inventory with filters (category, status, availability)
- Track item quantities (total vs. available)
- Monitor item status (Working, Needs Testing, Faulty, Scrap)
- Low-stock alerts
- Admin capabilities: Add, edit, and delete items

### Loan System
- **For Users:**
  - Browse available items and request loans
  - View personal loan history
  - Track pending requests and active loans
  - Receive overdue notifications

- **For Admins:**
  - Review and approve/reject loan requests
  - Monitor active loans
  - Close loans when items are returned
  - Enforce borrowing constraints

### Dashboard
- **Admin Dashboard:**
  - System statistics overview
  - Pending requests preview
  - Active loans monitoring
  - Low-stock alerts

- **User Dashboard:**
  - Personal active loans
  - Pending requests status
  - Overdue loan alerts

### Analytics
- Global system metrics
- Most borrowed items tracking
- Monthly activity trends
- Top borrowers report

### User Management (Master Admin)
- Create and manage members
- Assign and modify roles
- Reset passwords with mandatory change on next login
- Protected operations (prevents deleting last Master Admin)

### Activity Log (Master Admin)
- Comprehensive audit trail
- Filterable by action type
- Searchable by actor
- Paginated browsing

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI Library:** Mantine v8
- **Styling:** Tailwind CSS v4
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js v4
- **Icons:** Tabler Icons
- **Language:** TypeScript

## 📋 Prerequisites

- Node.js 20+ (recommended)
- PostgreSQL database
- npm or pnpm package manager

## 🏁 Quick Start

### 1. Installation

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the project root:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/asset_trail?schema=public"
DIRECT_URL="postgresql://user:password@localhost:5432/asset_trail?schema=public"
NEXTAUTH_SECRET="your-long-random-secret-string"
```

**Generate a secure secret:**
```bash
openssl rand -base64 32
```

### 3. Database Setup

```bash
# Run migrations
npx prisma migrate dev

# (Optional) Seed with sample data
npx prisma db seed
```

**Default seed credentials:**
- Password: `Password@123`
- Emails:
  - Master Admin: `master@assettrail.dev`
  - Board: `board1@assettrail.dev`
  - Senior Core: `senior1@assettrail.dev`
  - Junior Core: `junior1@assettrail.dev`

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📦 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🔐 User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Master Admin** | Full system access, user management, activity logs, all admin features |
| **Board** | Inventory management, loan approval/rejection, dashboard access |
| **Senior Core** | Request loans, view personal history, user dashboard |
| **Junior Core** | Request loans, view personal history, user dashboard |

## 📁 Project Structure

```
asset-trail/
├── app/
│   ├── (auth)/           # Authentication pages (login)
│   ├── (protected)/      # Protected routes
│   │   ├── dashboard/    # Dashboard pages
│   │   ├── inventory/    # Inventory management
│   │   ├── loans/        # Loan pages
│   │   ├── my-loans/     # User loan history
│   │   └── admin/        # Admin-only pages
│   └── api/              # API routes
├── components/           # React components
│   ├── auth/
│   ├── inventory/
│   ├── layout/
│   ├── loans/
│   ├── providers/
│   └── users/
├── lib/                  # Utility functions
├── prisma/               # Database schema & migrations
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── docs/                 # Documentation
└── public/               # Static assets
```

## 📖 Documentation

- **[Setup Guide](docs/SETUP.md)** - Detailed setup instructions
- **[Architecture](docs/ARCHITECTURE.md)** - Codebase structure and data flow
- **[Data Model](docs/DATA_MODEL.md)** - Database schema overview
- **[Features](docs/FEATURES.md)** - Feature-by-feature documentation
- **[API Reference](docs/API.md)** - API routes and payloads
- **[Security](docs/SECURITY.md)** - Authentication and RBAC details
- **[Deployment](docs/DEPLOYMENT.md)** - Production deployment guide
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and solutions

## 🗄️ Database Schema

The system uses PostgreSQL with the following main models:

- **Member** - User accounts with roles and authentication
- **Item** - Inventory items with quantities and status
- **Loan** - Loan records linking members and items
- **ActivityLog** - Audit trail of system actions

See [DATA_MODEL.md](docs/DATA_MODEL.md) for details.

## 🔒 Security Features

- Bcrypt password hashing
- NextAuth.js session management
- Role-based access control (RBAC)
- Protected API routes with middleware
- Mandatory password change on first login
- Activity logging for audit trails

## 🚀 Deployment

For production deployment instructions, see [DEPLOYMENT.md](docs/DEPLOYMENT.md).

Key considerations:
- Set up PostgreSQL database
- Configure environment variables
- Run database migrations
- Build the application
- Use a production-ready Node.js server or platform (Vercel, Railway, etc.)

## 🤝 Contributing

Contributions are welcome! Please ensure:
- Code follows the existing style
- TypeScript types are properly defined
- Components are documented
- Database changes include migrations

## 📝 License

This project is private and proprietary.

## 🐛 Troubleshooting

Common issues and solutions are documented in [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md).

For additional help:
1. Check the documentation in the `docs/` folder
2. Review error logs and stack traces
3. Verify environment variables are correctly set
4. Ensure database migrations are up to date

## 📞 Support

For issues or questions, please contact the development team or open an issue in the repository.
