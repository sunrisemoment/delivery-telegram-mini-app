# Telegram Delivery App (MVP Starter)

Monorepo starter for a private Telegram-based delivery app in Atlanta:

- `backend`: Node.js + Express + Prisma + PostgreSQL + Telegram Bot entry + WebSocket updates
- `mini-app`: Telegram Mini App (React + TypeScript + Tailwind) for customers
- `admin-dashboard`: React + TypeScript + Tailwind + React Query for admin + driver workflows

## Folder structure

- `backend/`
- `mini-app/`
- `admin-dashboard/`
- `docker-compose.yml`

## Quick start (local)

1. Copy env values:
   - `cp .env.example .env` (PowerShell: `Copy-Item .env.example .env`)
2. Install dependencies:
   - `npm install`
3. Start PostgreSQL:
   - `docker compose up -d postgres`
4. Initialize database:
   - `npm --workspace backend run prisma:migrate`
   - `npm --workspace backend run prisma:seed`
5. Start apps (3 terminals):
   - `npm --workspace backend run dev`
   - `npm --workspace admin-dashboard run dev`
   - `npm --workspace mini-app run dev`

## Default local URLs

- Backend API: `http://localhost:3000`
- Admin dashboard: `http://localhost:3001`
- Mini app web view: `http://localhost:3002`
- Realtime websocket: `ws://localhost:3000/ws`

## Demo credentials

- Admin login (dashboard):
  - username: `admin`
  - password: `admin123456`

Driver login requires a valid `driverId` UUID from seeded drivers in DB (query via admin API or DB client).

## Core API endpoints

- Auth
  - `POST /api/auth/telegram`
  - `POST /api/auth/admin/login`
  - `POST /api/auth/driver/login`
  - `GET /api/auth/me`
- Products
  - `GET /api/products`
  - `POST /api/products` (admin)
  - `PUT /api/products/:id` (admin)
  - `DELETE /api/products/:id` (admin)
- Orders
  - `GET /api/orders`
  - `GET /api/orders/:id`
  - `POST /api/orders` (customer)
  - `POST /api/orders/:id/assign` (admin)
  - `PUT /api/orders/:id/status` (admin/driver)
  - `POST /api/orders/:id/deliver` (admin/driver, multipart `photo` required)
- Drivers
  - `GET /api/drivers` (admin/driver)
  - `POST /api/drivers` (admin)
  - `PUT /api/drivers/:id` (admin)
- Addresses
  - `GET /api/addresses` (customer)
  - `POST /api/addresses` (customer)
  - `PUT /api/addresses/:id` (customer)

## Notes

- Delivery completion is enforced through photo proof endpoint.
- Order status transitions are constrained in backend logic.
- Telegram Mini App auth verification with signed `initData` should be added next for production hardening.
