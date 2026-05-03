# Requirements Traceability Matrix

| Requirement ID | Requirement | Implementation Area | Verification Status |
|---|---|---|---|
| FR-01 | Admin/manager authentication | `server/controllers/authController.js`, `client/src/pages/Login.jsx` | Pass |
| FR-02 | Customer signup/login | `server/controllers/customerController.js`, `client/src/context/CustomerAuthContext.jsx` | Pass |
| FR-03 | Electronics product catalog | `server/models/Product.js`, `server/seed/seedData.js`, `client/src/pages/StoreCategories.jsx` | Pass |
| FR-04 | Category management | `server/routes/categoryRoutes.js`, `client/src/pages/Categories.jsx` | Pass |
| FR-05 | Cart management | `client/src/hooks/useCart.js`, `client/src/pages/Cart.jsx` | Pass |
| FR-06 | COD checkout | `client/src/pages/Checkout.jsx`, `server/controllers/orderController.js` | Pass |
| FR-07 | Razorpay test payment | `server/routes/paymentRoutes.js`, `client/src/pages/Checkout.jsx` | Pass |
| FR-08 | Admin order status update | `server/controllers/orderController.js`, `client/src/pages/Orders.jsx` | Pass |
| FR-09 | Customer tracking reflects admin update | `client/src/pages/TrackOrder.jsx`, `client/src/pages/CustomerAccount.jsx` | Pass |
| FR-10 | Public order history | `server/controllers/orderController.js`, `client/src/pages/OrderHistory.jsx` | Pass |
| FR-11 | Stock deduction on order | `server/controllers/orderController.js` | Pass |
| FR-12 | Stock restoration on cancel | `server/controllers/orderController.js` | Pass |
| FR-13 | Inventory logs | `server/models/InventoryLog.js`, `server/controllers/inventoryController.js` | Pass |
| FR-14 | Reorder suggestions | `server/utils/reorderSuggestion.js`, `client/src/components/InventoryAlert.jsx` | Pass |
| FR-15 | Dashboard KPI cards | `server/controllers/reportController.js`, `client/src/pages/Dashboard.jsx` | Pass |
| FR-16 | Report charts and exports | `server/routes/reportRoutes.js`, `client/src/pages/Reports.jsx` | Pass |
| FR-17 | Welcome signup email | `server/utils/mailer.js`, `server/controllers/customerController.js` | Pass |
| FR-18 | Contact form to backend | `server/controllers/notificationController.js`, `client/src/pages/Contact.jsx` | Pass |
| FR-19 | Help center working links | `client/src/pages/HelpCenter.jsx` | Pass |
| FR-20 | Admin role-based access | `server/middleware/roleMiddleware.js`, protected routes and pages | Pass |

## Notes

- Verification status is based on code inspection, build checks, backend module checks, and runtime API QA performed during development.
- SMTP inbox delivery still depends on correct mail server credentials and mailbox acceptance.
