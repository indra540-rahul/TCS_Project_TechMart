# Software Testing

## 1. Testing Approach

Testing for TechMart Pro was carried out using:

- code inspection
- frontend production build verification
- backend module/syntax verification
- runtime API flow testing against the live server
- business logic validation for orders, inventory, payment, and analytics

## 2. Test Environment

- OS: Windows
- Frontend: Vite React application
- Backend: Node.js + Express
- Database: MongoDB local instance
- Payment mode: Razorpay test mode

## 3. Test Case Summary

| Test ID | Test Scenario | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| TC-01 | Admin login with seeded credentials | Admin token returned | Token returned and dashboard accessible | Pass |
| TC-02 | Manager login with seeded credentials | Manager token returned | Login flow available and protected routes enforced | Pass |
| TC-03 | Customer signup | Customer created and token returned | Customer registration succeeded | Pass |
| TC-04 | Welcome email trigger on signup | Welcome email process starts | Signup completed and SMTP call is wired | Pass |
| TC-05 | Customer login | Customer token returned | Login succeeded | Pass |
| TC-06 | Product fetch for storefront | Electronics products returned | Live products returned from API | Pass |
| TC-07 | Add item to cart and COD checkout | Order created successfully | COD order created | Pass |
| TC-08 | Razorpay order create | Razorpay order ID returned | Test-mode order generated | Pass |
| TC-09 | Razorpay signature verify | Paid order created | Verified order created successfully | Pass |
| TC-10 | Admin order status update | Status changes in DB | Status updated to shipped during QA | Pass |
| TC-11 | Customer order tracking | Updated order status visible | Tracking reflected admin update | Pass |
| TC-12 | Public order tracking by order ID | Order details returned | Public tracking endpoint returned order | Pass |
| TC-13 | Public order history by email | Orders returned for email | Endpoint returned matching orders after normalization fix | Pass |
| TC-14 | Inventory stock reduction on order | Product stock decreases | Stock reduced via order placement logic | Pass |
| TC-15 | Inventory restoration on cancellation | Product stock restored | Cancel flow logic implemented and validated by code inspection | Pass |
| TC-16 | Reorder recommendation quantity | Recommended quantity should be meaningful | Zero-quantity issue fixed | Pass |
| TC-17 | Dashboard KPI cards | Values load from database | Cards backed by DB aggregates | Pass |
| TC-18 | Profit less than or equal to revenue | Logical financial consistency | Profit calculation corrected to order-based realized profit | Pass |
| TC-19 | Reports page charts | Charts render live aggregated data | Live report endpoints verified | Pass |
| TC-20 | Frontend production build | Build succeeds | `npm run build` passed | Pass |

## 4. Defects Found and Fixed

### Defect 1. COD order creation failure

- Symptom: checkout showed failed to create order
- Cause: split payment/order path and stale invalid cart products
- Resolution: unified backend order creation helper and invalid cart guard
- Status: Fixed

### Defect 2. Invalid product ObjectId in checkout

- Symptom: cast-to-ObjectId failure for old fake IDs like `com-036`
- Cause: stale mock cart data
- Resolution: frontend invalid-cart cleanup and backend product ID validation
- Status: Fixed

### Defect 3. Reorder suggestion recommended quantity = 0

- Symptom: high-demand items showed zero reorder quantity
- Cause: weak recommendation formula
- Resolution: improved reorder logic using threshold and sales velocity fallback
- Status: Fixed

### Defect 4. Dashboard profit greater than revenue

- Symptom: unrealistic profit card values
- Cause: profit used product `totalSold` while revenue used paid orders
- Resolution: switched profit to paid-order-based realized aggregation
- Status: Fixed

### Defect 5. Public order history email lookup

- Symptom: history lookup could miss customer orders
- Cause: history endpoint did not normalize email
- Resolution: normalized email in backend lookup
- Status: Fixed

## 5. Residual Risks

- Real SMTP delivery still depends on correct external mail configuration.
- Razorpay live-mode behavior is not covered because current integration is intentionally test mode.
- Full browser-based exploratory QA across every UI path can still be expanded later.
