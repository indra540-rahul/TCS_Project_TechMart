# TechMart Pro Server

This is the backend API for TechMart Pro. It powers authentication, products, categories, customers, orders, inventory, notifications, reports, settings, SMTP email delivery, and Razorpay test-mode payment verification.

## Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Bcrypt.js
- Nodemailer
- Razorpay SDK

## Scripts

```bash
npm install
npm run dev
npm start
npm run seed
```

## Environment Variables

Create `.env` in `server/`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/techmart-pro
JWT_SECRET=change_this_secret
CLIENT_URL=http://localhost:5173
CLIENT_URLS=http://localhost:5173,http://127.0.0.1:5173
RAZORPAY_KEY_ID=rzp_test_your_key
RAZORPAY_KEY_SECRET=your_test_secret
RAZORPAY_WEBHOOK_SECRET=optional_webhook_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@example.com
SMTP_PASS=your_app_password
SMTP_FROM_EMAIL=TechMart Pro <your_email@example.com>
```

## API Modules

- `authRoutes.js`
- `customerRoutes.js`
- `productRoutes.js`
- `categoryRoutes.js`
- `orderRoutes.js`
- `paymentRoutes.js`
- `inventoryRoutes.js`
- `reportRoutes.js`
- `notificationRoutes.js`
- `userRoutes.js`
- `auditLogRoutes.js`
- `settingsRoutes.js`
- `discountRoutes.js`

## Core Business Rules

- Only electronics products are supported
- Stock is reduced when orders are placed
- Stock is restored when orders are cancelled
- COD orders are created as confirmed with pending payment
- Razorpay orders are created only after signature verification
- Order tracking reads the same order records updated by admin
- Dashboard and report data are derived from MongoDB collections
- Profit is calculated from paid, non-cancelled order items

## Seed Data

The seed script creates:

- admin and manager users
- electronics categories
- 60 electronics products
- sample customers
- sample orders
- settings and notifications

## Runtime Verification

The server has been syntax-checked and exercised against live API flows for:

- customer signup/login
- COD order placement
- Razorpay order/verify flow
- admin order status update
- order history and tracking
- dashboard and reports
