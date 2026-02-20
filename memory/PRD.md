# InHaus Smart Home - Product Requirements Document

## Original Problem Statement
Build and refine an internal tool for the "InHaus" e-commerce business. This includes product management, generating customized PDF quotations, and an e-commerce system.

## Core Requirements
- **Product Management**: Admin panel to manage smart home products
- **Quotation System**: Generate, send, and download PDF quotations with product images
- **E-commerce System**: Shop page, cart, checkout, and order management
- **User & Role Management**: Admin authentication with JWT
- **Contact Form**: Public contact form for inquiries

## Tech Stack
- **Frontend**: React, Tailwind CSS, Shadcn UI
- **Backend**: FastAPI, Motor (async MongoDB)
- **Database**: MongoDB
- **PDF Generation**: ReportLab, Pillow

---

## What's Been Implemented

### December 2025

#### Core Features (Completed)
- [x] Admin authentication (JWT-based)
- [x] Product CRUD operations
- [x] Quotation creation with multi-product support
- [x] PDF generation with product images
- [x] Quote sending functionality
- [x] Contact form submission
- [x] Responsive UI with InHaus branding

#### Bug Fixes Applied
- [x] Fixed "Response.clone: Body has already been consumed" error in quotations
- [x] Added cache-control headers to prevent stale PDF downloads
- [x] Fixed PDF discount rendering (HTML tags appeared instead of colored text)
- [x] Fixed product image rendering in PDFs (images now display correctly)
- [x] Added defensive code in pdf_generator.py to prevent server reload issues

#### Website Pages
- [x] HomePage (reverted to original simpler design - no framer-motion animations)
- [x] AboutPage (reverted to original design with white/orange theme)
- [x] ContactPage (reverted to original design with company field)
- [x] ProductsPage
- [x] SmartHomesPage, SmartCommercialPage, SmartHospitalityPage
- [x] Admin pages (Login, Quotations, Products, Contacts, Settings)

#### E-commerce Foundation (In Progress)
- [x] Backend APIs: `/api/shop/products`, `/api/orders`, `/api/admin/orders`
- [x] Frontend pages: ShopPage, CartPage, CheckoutPage, AdminOrdersPage
- [x] CartContext for state management
- [ ] Cart functionality (Add to cart buttons, localStorage)
- [ ] Checkout flow completion
- [ ] Payment integration

---

## Prioritized Backlog

### P0 - Critical
- [ ] Fix Product Deletion bug (frontend issue in AdminProductsPage)

### P1 - High Priority
- [ ] Complete E-commerce cart functionality
- [ ] Implement checkout flow with order placement
- [ ] Payment gateway integration (Razorpay/Stripe)

### P2 - Medium Priority
- [ ] Test "In-Quotation Product Cloning & Editing" feature
- [ ] Performance optimization (investigate slowness)
- [ ] User Registration & Management System

### P3 - Low Priority
- [ ] Role-Based Access Control (RBAC)
- [ ] Auto-logout functionality
- [ ] Switchboard grouping in quotes

---

## Known Issues

### Product Deletion Bug
- **Status**: Open
- **Description**: Admin unable to delete products from the frontend
- **Backend**: DELETE endpoint works via curl
- **Frontend**: Redirects to login page immediately

### Performance (Mitigated)
- **Status**: Monitoring
- **Root Cause**: Server running with --reload flag (readonly config)
- **Mitigation**: Defensive code added to prevent frequent reloads

---

## API Endpoints

### Public
- `POST /api/contact` - Submit contact form
- `GET /api/shop/products` - Get products for shop

### Admin (JWT Required)
- `POST /api/auth/login` - Admin login
- `GET/POST/DELETE /api/products` - Product CRUD
- `GET/POST /api/quotations` - Quotation management
- `GET /api/quotations/{id}/download` - Download PDF
- `POST /api/quotations/{id}/send` - Send quotation via email
- `GET/POST /api/orders` - Order management
- `GET /api/admin/orders` - Admin orders with profit margins

---

## Database Schema

### Products Collection
```json
{
  "name": "string",
  "sku": "string",
  "price": "number",
  "cost": "number",
  "category": "string",
  "description": "string",
  "image_url": "string"
}
```

### Orders Collection
```json
{
  "order_id": "string",
  "customer_details": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "address": "string"
  },
  "items": [{
    "product_id": "string",
    "name": "string",
    "price": "number",
    "quantity": "number"
  }],
  "total_price": "number",
  "total_cost": "number",
  "status": "string",
  "created_at": "datetime"
}
```

---

## Test Credentials
- **Email**: barath40893@gmail.com
- **Password**: InHaus@2024
