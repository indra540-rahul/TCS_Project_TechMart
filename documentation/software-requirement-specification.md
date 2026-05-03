# Software Requirement Specification

## 1. Introduction

### 1.1 Purpose

This SRS defines the functional and non-functional requirements for TechMart Pro, an electronics e-commerce and admin operations platform.

### 1.2 Scope

TechMart Pro supports:

- public browsing of electronics products
- customer registration, login, and account management
- cart and checkout
- Razorpay and cash-on-delivery ordering
- admin and manager operations
- inventory tracking and reporting
- order tracking and customer communication

### 1.3 Intended Users

- customers
- admin users
- manager users
- academic evaluators and project reviewers

## 2. Overall Description

### 2.1 Product Perspective

The system is a full-stack web application with:

- React frontend client
- Express API server
- MongoDB database
- SMTP mail integration
- Razorpay payment gateway integration

### 2.2 Product Functions

- authenticate admin, manager, and customer users
- manage products and categories
- place and track orders
- update order statuses
- manage stock levels
- generate dashboards and reports
- send signup emails

### 2.3 Constraints

- product domain is restricted to electronics
- MongoDB is required for persistent storage
- Razorpay test credentials are required for payment testing
- SMTP credentials are required for real email delivery

## 3. Functional Requirements

### FR-01 User Authentication

- The system shall allow admin and manager login.
- The system shall allow customer signup and login.
- The system shall protect routes based on role.

### FR-02 Product Catalog

- The system shall store electronics-only product data.
- The system shall allow admins and managers to view products.
- The system shall allow admins to create, update, and delete products.

### FR-03 Category Management

- The system shall allow admins to manage product categories.
- The storefront shall display categories backed by live product data.

### FR-04 Shopping Cart

- The system shall allow customers to add and remove items from cart.
- The system shall validate products before checkout.

### FR-05 Checkout and Payment

- The system shall support COD orders.
- The system shall support Razorpay test-mode payments.
- The system shall verify Razorpay signatures before confirming paid orders.

### FR-06 Order Management

- The system shall create orders in MongoDB.
- The system shall allow admin and manager users to update order status.
- The system shall allow admin users to cancel or delete orders.

### FR-07 Order Tracking

- The system shall expose customer order history.
- The system shall expose public order tracking by order ID.
- Customer tracking shall reflect admin-updated status values.

### FR-08 Inventory

- The system shall reduce stock when orders are placed.
- The system shall restore stock when orders are cancelled.
- The system shall log inventory events.
- The system shall provide reorder suggestions.

### FR-09 Reporting

- The system shall provide dashboard KPI cards.
- The system shall provide sales, profit, inventory, product, and category reports.
- Dashboard and report values shall be derived from database records.

### FR-10 Communication

- The system shall send welcome emails on successful customer signup.
- The system shall store contact form submissions as notifications.

## 4. Non-Functional Requirements

### NFR-01 Usability

- The UI shall support public, customer, and admin workflows clearly.
- The tracking UI shall present order progress visually.

### NFR-02 Reliability

- Orders shall be stored persistently in MongoDB.
- Payment verification shall happen on the backend.

### NFR-03 Security

- Passwords shall be hashed.
- JWT shall be used for protected APIs.
- Role-based access shall be enforced at route level.

### NFR-04 Maintainability

- Client and server shall be separated by module.
- Documentation shall describe modules, requirements, and tests.

### NFR-05 Performance

- Dashboard and report aggregations shall use MongoDB queries.
- The frontend shall consume pageless but structured APIs for responsive rendering.

## 5. External Interface Requirements

### 5.1 User Interface

- web browser frontend for public, customer, and admin views

### 5.2 Hardware Interface

- standard desktop or mobile device with internet/browser access

### 5.3 Software Interface

- MongoDB
- Razorpay API
- SMTP mail server

## 6. Data Requirements

Main entities:

- User
- Customer
- Category
- Product
- Order
- InventoryLog
- Notification
- AuditLog
- Settings

See [database-schema.md](./database-schema.md) for schema detail.

## 7. Acceptance Summary

The system is acceptable when:

- customer signup/login works
- order creation works for COD and Razorpay
- admin status updates reflect in tracking
- dashboard metrics load from database
- product, inventory, and report flows are operational
