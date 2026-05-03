# TechMart Pro

TechMart Pro is a full-stack electronics e-commerce and admin operations platform. It combines a public shopping storefront, customer account and order tracking, Razorpay/COD checkout, and an admin dashboard for products, inventory, reports, notifications, and order lifecycle management.

## Repository Structure

```text
techmart-pro/
├── client/            React + Vite frontend
├── server/            Express + MongoDB backend
├── documentation/     Project documents and diagram sources
└── README.md
```

## Core Modules

- Public storefront for electronics catalog, categories, cart, checkout, contact, and help center
- Customer authentication, account management, order history, and live tracking
- Admin and manager portal with role-based access
- Product, category, order, customer, inventory, notification, audit, and settings modules
- Razorpay test-mode payment flow and cash-on-delivery flow
- SMTP-backed customer signup welcome email
- Analytics and reports driven by MongoDB order, inventory, and category data

## Tech Stack

- Frontend: React, Vite, React Router DOM, Axios, Tailwind CSS, Recharts, Lucide React, React Hot Toast
- Backend: Node.js, Express.js, MongoDB, Mongoose, JWT, Bcrypt.js, Nodemailer, Razorpay SDK
- Database: MongoDB local instance or MongoDB Atlas

## Quick Start

### 1. Install dependencies

```bash
cd techmart-pro
npm run install:all
```

### 2. Configure environment variables

Create `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/techmart-pro
JWT_SECRET=change_this_secret
CLIENT_URL=http://localhost:5173
RAZORPAY_KEY_ID=rzp_test_your_key
RAZORPAY_KEY_SECRET=your_test_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@example.com
SMTP_PASS=your_app_password
SMTP_FROM_EMAIL=TechMart Pro <your_email@example.com>
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_your_key
```

### 3. Seed demo data

```bash
npm run seed
```

### 4. Start the backend

```bash
npm run dev:server
```

### 5. Start the frontend

```bash
npm run dev:client
```

## Demo Credentials

- Admin: `admin@techmart.com` / `admin123`
- Manager: `manager@techmart.com` / `manager123`
- Seeded customer password: `user123`

## Important Routes

### Frontend

- `/` shop home
- `/categories`
- `/cart`
- `/checkout`
- `/contact`
- `/help-center`
- `/track-order`
- `/order-history`
- `/account`
- `/login`
- `/dashboard`

### Backend

- `/api/auth`
- `/api/customers`
- `/api/products`
- `/api/categories`
- `/api/orders`
- `/api/payments`
- `/api/inventory`
- `/api/reports`
- `/api/notifications`
- `/api/users`
- `/api/audit-logs`
- `/api/settings`

## Documentation

Project documents are available in [documentation](./documentation/README.md).

- [Client README](./client/README.md)
- [Server README](./server/README.md)
- [Software Requirement Specification](./documentation/software-requirement-specification.md)
- [Development Plan](./documentation/development-plan.md)
- [Requirements Traceability Matrix](./documentation/requirements-traceability-matrix.md)
- [Software Testing](./documentation/software-testing.md)
- [Database Schema](./documentation/database-schema.md)
- [API Documentation](./documentation/api-documentation.md)

## Current State

- Electronics-only product catalog
- Backend-connected checkout and order tracking
- Admin status updates reflected in customer/public tracking
- Live dashboard and report cards backed by database records
- Runtime API flow verified for customer signup, COD, Razorpay verification, admin order updates, and reporting
