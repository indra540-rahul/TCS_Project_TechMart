# API Documentation

Base URL: `http://localhost:5000/api`

## Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/profile`

## Products

- `GET /products`
- `GET /products/:id`
- `POST /products`
- `PUT /products/:id`
- `DELETE /products/:id`
- `GET /products/low-stock`
- `GET /products/demand-prediction`

## Categories

- `GET /categories`
- `POST /categories`
- `PUT /categories/:id`
- `DELETE /categories/:id`

## Orders

- `GET /orders`
- `GET /orders/history?email=customer@example.com`
- `GET /orders/:id`
- `POST /orders`
- `PUT /orders/:id/status`
- `PUT /orders/:id/cancel`
- `DELETE /orders/:id`

## Customers

- `GET /customers`
- `GET /customers/:id`
- `POST /customers`

## Inventory

- `GET /inventory/logs`
- `PUT /inventory/:productId/stock`
- `GET /inventory/reorder-suggestions`

## Reports

- `GET /reports/dashboard-summary`
- `GET /reports/sales`
- `GET /reports/top-products`
- `GET /reports/inventory`
- `GET /reports/order-status`
- `GET /reports/category-performance`
- `GET /reports/profit`
- `GET /reports/export`

## Notifications

- `GET /notifications`
- `PUT /notifications/:id/read`
- `DELETE /notifications/:id`

## Users

- `POST /users/create-manager`
- `GET /users`

## Audit Logs

- `GET /audit-logs`

## Settings

- `GET /settings`
- `PUT /settings`

## Discounts

- `PUT /discounts/:id/approve`

## Authentication Rules

- Public routes: `GET /products`, `GET /products/:id`, `GET /categories`, `POST /orders`, `GET /orders/:id`, `GET /orders/history`, login/register
- Protected routes require `Authorization: Bearer <token>`
- Admin-only actions: category write actions, order delete/cancel, product delete, user management, audit logs, settings, profit/export reports, discount approval
- Admin and manager actions: product create/edit, order workflow status update, customer view, inventory updates, dashboard, notifications
