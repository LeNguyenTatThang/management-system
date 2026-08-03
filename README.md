# DEZ LAB - Coffee Shop Management System

A full-stack management system for cafe / beverage shops built with React (frontend) and NestJS (backend). Manage products, ingredients, recipes, orders, staff, roles, vouchers, promotions, inventory, and suppliers — all powered by real API calls and MySQL database via Prisma ORM.

## Features

- **Dashboard** — Real-time stats with Recharts (revenue, orders, popular products)
- **Menu Products** — CRUD for menu items with card/list views
- **Recipes** — Structured ingredient quantities per product (Công thức / Định lượng)
- **Ingredients** — Manage stock ingredients and units
- **Orders** — View, create, and track customer orders with detail page
- **POS** — Full-screen point-of-sale interface with multi-voucher support
- **Staff** — Employee management with personal, job, and salary info
- **Roles** — Role & permission management with hierarchical permission tree
- **Vouchers** — Voucher/discount code management
- **Promotions** — Promotion program management
- **Inventory Imports** — Stock import with RECEIVED status and atomic stock increment
- **Inventory Exports** — Stock export with EXPORTED status and atomic stock decrement
- **Inventory Adjustments** — Stock adjustment with CONFIRMED status and stock mutation
- **Stock Ledger** — Audit trail of all stock movements (IMPORT, EXPORT, ADJUSTMENT, TRANSFER)
- **Inventory Stocktake** — Stock counting with CONFIRMED status and stock reconciliation
- **Inventory Reports** — Reports & analytics (summary, movements, top ingredients, low stock, stocktake, ingredient detail)
- **Inventory Transfer** — Internal stock transfer between locations (DRAFT → CONFIRMED → TRANSFERRED)
- **Schedules** — Staff work schedules
- **Attendance** — Staff attendance tracking
- **Suppliers** — Supplier management
- **Themes** — Theme management
- **Authentication** — JWT-based login & register with role-based access control

## Tech Stack

### Frontend
- **React 19** — UI library
- **Vite 8** — Build tool
- **React Router DOM 7** — Client-side routing
- **Recharts** — Charts on dashboard
- **Lucide React** — Icons
- **Framer Motion** — Animations
- **React Hot Toast** — Notifications
- **Oxlint** — Linting

### Backend
- **NestJS** — Node.js framework
- **TypeScript** — Type safety
- **Prisma ORM** — Database ORM
- **MySQL** — Database
- **JWT + Passport** — Authentication
- **class-validator** — Request validation

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm
- MySQL 8+

### Setup

```bash
# Install dependencies
pnpm install

# Setup database
# Create MySQL database: management_system
# Update DATABASE_URL in server/.env if needed

# Run Prisma migrations
cd server
npx prisma migrate deploy

# Seed the database (optional)
npx prisma generate --no-engine
npx tsx prisma/seed.ts

# Start backend
npx nest start --watch

# Start frontend
cd ../client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Available Scripts

#### Frontend (client/)
| Command           | Description                  |
| ----------------- | ---------------------------- |
| `npm run dev`     | Start development server     |
| `npm run build`   | Build for production         |
| `npm run preview` | Preview production build     |
| `npm run lint`    | Run Oxlint                   |

#### Backend (server/)
| Command                | Description                  |
| ---------------------- | ---------------------------- |
| `npx nest start`       | Start production server      |
| `npx nest start --watch` | Start dev server with hot reload |
| `npx tsc --noEmit`     | TypeScript type check        |
| `npx prisma migrate deploy` | Run pending migrations   |
| `npx prisma generate --no-engine` | Generate Prisma Client |
| `npx tsx prisma/seed.ts` | Seed the database        |

## Project Structure

```
management-system/
├── client/                    # React frontend (Vite)
│   ├── src/
│   │   ├── assets/            # Static images
│   │   ├── components/
│   │   │   ├── layout/        # AdminLayout, Sidebar, Topbar, PageContainer, PosLayout
│   │   │   ├── ui/            # Reusable UI components (ResponsiveTable, FormSection, etc.)
│   │   │   └── pos/           # POS-specific components (PosLayout)
│   │   ├── contexts/          # React context providers (Auth, Staff, Ingredients, etc.)
│   │   ├── pages/             # Route-level page components
│   │   │   ├── employees/     # Staff, EmployeeCreate
│   │   │   ├── ingredients/   # Ingredients, IngredientCreate, IngredientDetail
│   │   │   ├── orders/        # Orders, OrderCreate, OrderDetail
│   │   │   ├── vouchers/      # Vouchers, VoucherCreate
│   │   │   ├── roles/         # RoleCreate
│   │   │   └── inventory/     # Imports, Exports, Adjustments, Stocktakes, Transfers, Reports
│   │   ├── services/          # API service files (fetch-based)
│   │   ├── types/             # Permission types and constants
│   │   ├── App.jsx            # Root component with routes
│   │   ├── index.css          # Global styles
│   │   └── main.jsx           # Entry point
│   └── vite.config.js
│
└── server/                    # NestJS backend
    ├── src/
    │   ├── app.module.ts      # Root module
    │   ├── main.ts            # Entry point
    │   └── modules/
    │       ├── auth/          # Authentication (login, register, JWT)
    │       ├── employees/     # Staff management
    │       ├── schedules/     # Work schedules
    │       ├── attendance/    # Attendance tracking
    │       ├── leave-requests # Leave requests
    │       ├── products/      # Products, categories, setup
    │       ├── recipes/       # Recipes with ingredient quantities
    │       ├── ingredients/   # Ingredients management
    │       ├── units/         # Measurement units
    │       ├── orders/        # Order management
    │       ├── order-items/   # Order items
    │       ├── vouchers/      # Voucher management
    │       ├── promotions/    # Promotion programs
    │       ├── suppliers/     # Supplier management
    │       ├── inventory-imports/    # Stock import (NHẬP KHO)
    │       ├── inventory-exports/    # Stock export (XUẤT KHO)
    │       ├── inventory-adjustments/ # Stock adjustment (ĐIỀU CHỈNH KHO)
    │       ├── stock-movements/       # Stock ledger (BIẾN ĐỘNG KHO)
    │       ├── inventory-stocktakes/  # Stocktake (KIỂM KÊ KHO)
    │       ├── inventory-reports/     # Reports (BÁO CÁO KHO)
    │       └── inventory-transfer/    # Transfer (CHUYỂN KHO)
    ├── prisma/
    │   ├── schema.prisma      # Prisma schema
    │   ├── seed.ts            # Database seed script
    │   └── migrations/        # Prisma migrations
    └── tsconfig.json
```

## API

Base URL: `http://localhost:3000/api`

All endpoints use REST. Response format:

```json
{
  "success": true,
  "message": "OK",
  "data": {}
}
```

### Authentication
- `POST /api/auth/login` — Login and receive JWT token
- `POST /api/auth/register` — Register new user

### Permission Model
Permissions use `group.module.key` format:
- `hr.employee.create`
- `inventory.import.create`
- `inventory.transfer.confirm`
- etc.

Manager role (`dez@gmail.com` / `123456`) has all permissions by default.

## Routes

| Path                         | Page                          |
| ---------------------------- | ----------------------------- |
| `/`                          | Redirect to `/login` or `/dashboard` |
| `/login`                     | Login                         |
| `/register`                  | Register                      |
| `/dashboard`                 | Dashboard                     |
| `/staff`                     | Staff                         |
| `/employees/create`          | Add Employee                  |
| `/schedules`                 | Work Schedules                |
| `/attendance`                | Attendance                    |
| `/accounts/roles`            | Role Management               |
| `/accounts`                  | Account Management            |
| `/themes`                    | Theme Management              |
| `/vouchers`                  | Vouchers                      |
| `/vouchers/create`           | Add Voucher                   |
| `/promotions`                | Promotions                    |
| `/orders`                    | Orders                        |
| `/orders/create`             | Create Order                  |
| `/orders/:id`                | Order Detail                  |
| `/pos`                       | POS                           |
| `/products`                  | Menu Products                 |
| `/products/create`           | Add Product                   |
| `/recipes`                   | Recipes                       |
| `/recipes/new`               | Add Recipe                    |
| `/ingredients`               | Ingredients                   |
| `/ingredients/create`        | Add Ingredient                |
| `/ingredients/:id`           | Ingredient Detail             |
| `/inventory/imports`         | Stock Import                  |
| `/inventory/imports/:id`     | Import Detail                 |
| `/inventory/exports`         | Stock Export                  |
| `/inventory/exports/:id`     | Export Detail                 |
| `/inventory/adjustments`     | Stock Adjustment              |
| `/inventory/adjustments/:id` | Adjustment Detail             |
| `/inventory/stock-ledger`    | Stock Ledger                  |
| `/inventory/stock-ledger/:id`| Ledger Detail                 |
| `/inventory/stocktakes`      | Stocktake                     |
| `/inventory/stocktakes/:id`  | Stocktake Detail              |
| `/inventory/reports`         | Inventory Reports             |
| `/inventory/reports/summary` | Reports Summary               |
| `/inventory/reports/movements`| Stock Movements             |
| `/inventory/reports/top-ingredients` | Top Ingredients         |
| `/inventory/reports/low-stock` | Low Stock Report           |
| `/inventory/reports/stocktake` | Stocktake Report           |
| `/inventory/reports/ingredient/:id` | Ingredient Report      |
| `/inventory/transfers`       | Stock Transfer                |
| `/inventory/transfers/:id`   | Transfer Detail               |
| `/suppliers`                 | Suppliers                     |

## Design

- **Primary color:** Burgundy
- **Background:** Warm cream
- **Typography:** Be Vietnam Pro / Inter
- Responsive from 320px to 1920px
