# DEZ LAB - Coffee Shop Management System

A frontend-only management system for cafe / beverage shops built with React. Manage products, ingredients, recipes, orders, staff, and suppliers — all powered by mock data and local state.

## Features

- **Dashboard** — Real-time stats with Recharts (revenue, orders, popular products)
- **Menu Products** — CRUD for menu items with card/list views
- **Recipes** — Structured ingredient quantities per product (Công thức / Định lượng)
- **Ingredients** — Manage stock ingredients and units
- **Orders** — View and track customer orders
- **POS** — Full-screen point-of-sale interface
- **Staff** — Employee management
- **Suppliers** — Supplier management
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
│   ├── layout/        # AdminLayout, Sidebar, Topbar, PageContainer
│   └── ui/            # Reusable UI components (ResponsiveTable)
├── contexts/          # React context providers (Auth, Ingredients, etc.)
├── data/              # Mock data
├── pages/             # Route-level page components
├── App.jsx            # Root component with routes
├── index.css          # Global styles
└── main.jsx           # Entry point
```

## Routes

| Path          | Page            |
| ------------- | --------------- |
| `/`           | Redirects to `/login` or `/dashboard` |
| `/login`      | Login           |
| `/register`   | Register        |
| `/dashboard`  | Dashboard       |
| `/products`   | Menu Products   |
| `/recipes`    | Recipes         |
| `/ingredients`| Ingredients     |
| `/orders`     | Orders          |
| `/pos`        | POS             |
| `/staff`      | Staff           |
| `/suppliers`  | Suppliers       |

## Design

- **Primary color:** Burgundy
- **Background:** Warm cream
- **Typography:** Be Vietnam Pro / Inter
- Responsive from 320px to 1920px
