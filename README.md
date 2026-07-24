# DEZ LAB - Coffee Shop Management System

A frontend-only management system for cafe / beverage shops built with React. Manage products, ingredients, recipes, orders, staff, roles, vouchers, promotions, inventory, and suppliers — all powered by mock data and local state.

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
- **Inventory** — Import/Export stock management
- **Schedules** — Staff work schedules
- **Attendance** — Staff attendance tracking
- **Suppliers** — Supplier management
- **Themes** — Theme management
- **Authentication** — Login & Register pages (local state)

## Tech Stack

- **React 19** — UI library
- **Vite 8** — Build tool
- **React Router DOM 7** — Client-side routing
- **Recharts** — Charts on dashboard
- **Lucide React** — Icons
- **Framer Motion** — Animations
- **React Hot Toast** — Notifications
- **Oxlint** — Linting

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Available Scripts

| Command           | Description                  |
| ----------------- | ---------------------------- |
| `npm run dev`     | Start development server     |
| `npm run build`   | Build for production         |
| `npm run preview` | Preview production build     |
| `npm run lint`    | Run Oxlint                   |

## Project Structure

```
src/
├── assets/            # Static images
├── components/
│   ├── layout/        # AdminLayout, Sidebar, Topbar, PageContainer, PosLayout
│   ├── ui/            # Reusable UI components (ResponsiveTable, FormSection, etc.)
│   └── pos/           # POS-specific components (PosLayout)
├── contexts/          # React context providers (Auth, Staff, Ingredients, etc.)
├── data/              # Mock data
├── pages/             # Route-level page components
│   ├── employees/     # Staff, EmployeeCreate
│   ├── ingredients/   # Ingredients, IngredientCreate, IngredientDetail
│   ├── orders/        # Orders, OrderCreate, OrderDetail
│   ├── vouchers/      # Vouchers, VoucherCreate
│   ├── roles/         # RoleCreate
│   └── ...
├── types/             # Permission types and constants
├── App.jsx            # Root component with routes
├── index.css          # Global styles
└── main.jsx           # Entry point
```

## Routes

| Path                    | Page                  |
| ----------------------- | --------------------- |
| `/`                     | Redirects to `/login` or `/dashboard` |
| `/login`                | Login                 |
| `/register`             | Register              |
| `/dashboard`            | Dashboard             |
| `/staff`                | Staff                 |
| `/employees/create`     | Add Employee          |
| `/schedules`            | Work Schedules        |
| `/attendance`           | Attendance            |
| `/accounts/roles`       | Role Management       |
| `/accounts`             | Account Management    |
| `/themes`               | Theme Management      |
| `/vouchers`             | Vouchers              |
| `/vouchers/create`      | Add Voucher           |
| `/promotions`           | Promotions            |
| `/orders`               | Orders                |
| `/orders/create`        | Create Order          |
| `/orders/:id`           | Order Detail          |
| `/pos`                  | POS                   |
| `/products`             | Menu Products         |
| `/products/create`      | Add Product           |
| `/recipes`              | Recipes               |
| `/recipes/new`          | Add Recipe            |
| `/ingredients`          | Ingredients           |
| `/ingredients/create`   | Add Ingredient        |
| `/ingredients/:id`      | Ingredient Detail     |
| `/inventory/imports`    | Stock Import          |
| `/inventory/exports`    | Stock Export          |
| `/suppliers`            | Suppliers             |

## Design

- **Primary color:** Burgundy
- **Background:** Warm cream
- **Typography:** Be Vietnam Pro / Inter
- Responsive from 320px to 1920px
