# Database Schema Documentation

## User

- `name`
- `email`
- `password`
- `role`: `admin | manager`
- `avatar`
- `status`
- `createdAt`, `updatedAt`

## Category

- `name`
- `description`
- `status`
- `createdAt`, `updatedAt`

## Product

- `name`
- `description`
- `category`
- `brand`
- `sector`: `electronics`
- `price`
- `unit`: `piece | kg | gram | liter | pack`
- `stock`
- `lowStockLimit`
- `variants[]`
- `attributes`
- `expiryDate`
- `image`
- `status`
- `totalSold`
- `createdAt`, `updatedAt`

## Customer

- `name`
- `email`
- `phone`
- `address.city`
- `address.state`
- `address.pincode`
- `address.country`
- `createdAt`, `updatedAt`

## Order

- `customer`
- `items[]`
- `subtotalAmount`
- `shippingCharge`
- `taxAmount`
- `codCharge`
- `totalAmount`
- `paymentMethod`: `razorpay | cod`
- `paymentStatus`: `pending | paid | failed`
- `paymentReference`
- `paymentProvider`
- `orderStatus`: `pending | confirmed | processing | dispatch | shipped | delivered | cancelled`
- `shippingMethod`
- `shippingAddress`
- `customerSnapshot`
- `createdAt`, `updatedAt`

## InventoryLog

- `product`
- `action`: `stock-in | stock-out | order-placed | order-cancelled | manual-update`
- `quantityChanged`
- `previousStock`
- `newStock`
- `note`
- `createdAt`, `updatedAt`

## Notification

- `title`
- `message`
- `type`: `low-stock | new-order | system | reorder | contact`
- `isRead`
- `createdAt`, `updatedAt`

## AuditLog

- `user`
- `role`: `admin | manager`
- `action`
- `module`
- `details`
- `createdAt`, `updatedAt`

## Settings

- `storeName`
- `supportEmail`
- `supportPhone`
- `currency`
- `taxRate`
- `defaultShippingCharge`
- `highDiscountApprovalLimit`
- `createdAt`, `updatedAt`
