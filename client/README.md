# TechMart Pro Client

This is the frontend application for TechMart Pro. It provides the public electronics storefront, customer account experience, and the admin/manager dashboard UI.

## Stack

- React
- Vite
- React Router DOM
- Axios
- Tailwind CSS
- Recharts
- Lucide React
- React Hot Toast

## Main User Areas

- Public pages: home, categories, about, contact, help center
- Shopping flow: cart, checkout, Razorpay/COD payment selection
- Customer flow: signup, login, account, order history, tracking
- Admin flow: dashboard, products, categories, orders, customers, inventory, reports, notifications
- Admin-only flow: user management, audit logs, settings

## Scripts

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Environment Variables

Create `.env` in `client/`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_your_key
```

Notes:

- Checkout now fetches the Razorpay key from the backend config endpoint too.
- `VITE_RAZORPAY_KEY_ID` is still useful as a local fallback.

## Frontend Structure

```text
client/src/
├── components/
├── context/
├── hooks/
├── pages/
├── routes/
├── services/
└── main.jsx
```

## Important Pages

- `Shop.jsx`: public home/storefront
- `StoreCategories.jsx`: live electronics catalog by category
- `Cart.jsx`: cart management
- `Checkout.jsx`: shipping and payment flow
- `TrackOrder.jsx`: public single-order tracking
- `CustomerAccount.jsx`: customer profile and order tracking
- `Dashboard.jsx`: admin KPI and charts
- `Reports.jsx`: reporting and export UI

## Backend Integration

The client consumes live APIs for:

- authentication
- customer profile and orders
- product and category listing
- cart-to-order checkout
- Razorpay order creation and verification
- admin order status management
- inventory and report data

## Build Verification

The client has been production-built successfully with `npm run build`.

## Deployment Notes

- Vercel: use `client/` as the root directory and `dist` as the output directory
- Netlify: use `client/` as the base directory and `client/dist` as the publish directory
- Set `VITE_API_URL` to your Render backend URL ending in `/api`
- SPA rewrites are included in `vercel.json` and `netlify.toml`
