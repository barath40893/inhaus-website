# InHaus Smart Home - Product Requirements Document

## Original Problem Statement
Build and refine an internal tool for the "InHaus" e-commerce business. This includes product management, generating customized PDF quotations, and a complete e-commerce system with customer authentication.

## Core Requirements
- **Product Management**: Admin panel to manage smart home products with image upload (PNG, max 2MB)
- **Quotation System**: Generate, send, and download PDF quotations with product images
- **E-commerce System**: Customer authentication, room-based cart, checkout, and order management
- **User & Role Management**: Admin and Customer authentication with JWT
- **Invoice System**: PDF invoices with room-wise product grouping, shipping/billing address, company branding

## Tech Stack
- **Frontend**: React, Tailwind CSS, Shadcn UI
- **Backend**: FastAPI, Motor (async MongoDB)
- **Database**: MongoDB
- **PDF Generation**: ReportLab, Pillow
- **Authentication**: JWT + Emergent-managed Google OAuth

---

## What's Been Implemented

### December 2025

#### E-commerce System (Completed)
- [x] Customer registration with email/password
- [x] Customer login with email/password
- [x] Google OAuth integration (via Emergent-managed auth)
- [x] Auth-gated product catalog
- [x] Room-based cart system (predefined + custom rooms)
- [x] Room selection modal when adding products
- [x] Cart page with room-wise product grouping
- [x] Checkout with shipping/billing address
- [x] Cash on Delivery payment method
- [x] Order placement and confirmation
- [x] PDF invoice generation with:
  - InHaus logo/address on left
  - Customer details on right
  - Room-wise product listing with images
  - Tax calculation (GST)
  - Discount display
- [x] Invoice download and email sending
- [x] Customer orders history page
- [x] Admin customer management (manual user creation)
- [x] Admin shop orders with profit margins

#### Admin Order Editing (NEW - Completed)
- [x] Edit individual product prices in orders
- [x] Edit product quantities
- [x] Apply percentage discount (e.g., 10% off)
- [x] Apply fixed amount discount (e.g., Rs. 500 off)
- [x] Toggle GST inclusion (on/off)
- [x] Change GST percentage (default 18%)
- [x] Live preview of updated totals
- [x] Convert customer orders to quotations
- [x] Download invoice with applied discounts
- [x] Changed Rs symbol from ₹ to Rs. for PDF compatibility

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
- [x] Fixed PDF discount rendering
- [x] Fixed product image rendering in PDFs
- [x] Fixed PDF invoice generation (_create_footer method)
- [x] Reverted website redesign (HomePage, AboutPage, ContactPage)
- [x] **P0 Fixed: Admin navigation bug** - All admin pages now use AdminHeader component with Customers and Shop Orders links
- [x] Fixed AdminCustomersPage token bug - was using 'token' instead of 'adminToken'
- [x] **Fixed duplicate headers** - Removed duplicate AdminHeader from individual pages (ProtectedRoute handles it)
- [x] **UI/UX Redesign** - Complete dark theme redesign of public pages (Home, Products, About, Contact)
- [x] **Fixed account page link** - Changed /account to /customer/orders in Navbar
- [x] **Added partner logos** - Added "Works Seamlessly With" section (Amazon Alexa, Google Home, Apple HomeKit, Matter)
- [x] **Updated startup animation** - Dark theme welcome screen with animated grid and glowing effects
- [x] **Added trust indicators** - Free Installation, 2-Year Warranty, 24/7 Support badges on hero
- [x] **Dark theme for CustomerOrdersPage** - Updated order cards and status badges for dark mode
- [x] **P0 Fixed: Blank /login page** - Added redirect from `/login` to `/customer/login` in App.js (Feb 2026)
- [x] **P0 Fixed: Quotations not saving/loading** - Fixed `convert_order_to_quotation` endpoint creating wrong schema (used `quotation_number`/`customer`/`rooms` instead of `quote_number`/`customer_name`/`items`). Added legacy data migration in GET endpoint. (Feb 2026)
- [x] **Price Calculator embed** - Added Price Calculator iframe as a popup modal (triggered by button) on both Create/Edit Quotation and Create/Edit Invoice pages (Feb 2026)
- [x] **Invoice Payment Tracking** - Added Amount Paid input, auto-calculated Balance Due, and auto Payment Status (PENDING/PARTIAL/PAID) to Invoice create/edit form. Backend now correctly computes amount_due and payment_status on create and update. (Mar 2026)
- [x] **Product Image Display** - Added Image column with thumbnails to quotation and invoice item tables. Added onError fallback for broken images. Product selector on invoice page now shows product images. (Mar 2026)
- [x] **Homepage Redesign v2 (NOVIQ-inspired)** - Complete redesign with interactive smart lights demo (9-room live SVG floorplan with per-room toggles, warm glow effects, light rays, All On/Off, Voice Command banner), scrolling tech ticker, glass-morphism capability cards, new InHaus logo (PDF extracted), "Home, Reimagined by InHaus" tagline. Partners section retained. (Mar 2026)

---

## Predefined Rooms
- Living Room
- Master Bedroom
- Bedroom 2
- Bedroom 3
- Kitchen
- Bathroom
- Office/Study
- Dining Room
- Balcony
- Hall
- (Custom rooms can be added by users)

---

## API Endpoints

### Public
- `POST /api/contact` - Submit contact form
- `GET /api/shop/products` - Get products for shop
- `GET /api/rooms/default` - Get predefined room list

### Customer Auth
- `POST /api/customer/register` - Customer registration
- `POST /api/customer/login` - Customer login
- `POST /api/customer/google-session` - Process Google OAuth
- `GET /api/customer/me` - Get customer profile
- `POST /api/customer/logout` - Logout customer

### Customer Cart & Orders
- `GET /api/customer/rooms` - Get customer's rooms (predefined + custom)
- `POST /api/customer/rooms` - Add custom room
- `POST /api/customer/checkout` - Place order
- `GET /api/customer/orders` - Get order history
- `GET /api/customer/orders/{id}` - Get order details
- `GET /api/customer/orders/{id}/invoice` - Download invoice PDF
- `POST /api/customer/orders/{id}/send-invoice` - Email invoice

### Admin (JWT Required)
- `POST /api/auth/login` - Admin login
- `GET/POST/DELETE /api/products` - Product CRUD
- `GET/POST /api/quotations` - Quotation management
- `GET /api/admin/customers` - View all customers
- `POST /api/admin/customers` - Create customer account
- `GET /api/admin/customer-orders` - View all orders with profit
- `PUT /api/admin/customer-orders/{id}/status` - Update order status

---

## Database Schema

### Customers Collection
```json
{
  "user_id": "cust_xxx",
  "email": "string",
  "name": "string",
  "picture": "string (optional)",
  "phone": "string (optional)",
  "shipping_address": "string (optional)",
  "billing_address": "string (optional)",
  "auth_provider": "email|google",
  "password_hash": "string (for email auth)",
  "status": "active|inactive",
  "created_at": "datetime",
  "last_login": "datetime"
}
```

### Customer Orders Collection
```json
{
  "id": "uuid",
  "order_number": "INV-2025-0001",
  "user_id": "cust_xxx",
  "customer_name": "string",
  "customer_email": "string",
  "customer_phone": "string",
  "shipping_address": "string",
  "billing_address": "string",
  "items": [{
    "product_id": "string",
    "product_name": "string",
    "model_no": "string",
    "image_url": "string",
    "list_price": "number",
    "quantity": "number",
    "total_price": "number",
    "room_name": "string",
    "room_type": "predefined|custom"
  }],
  "subtotal": "number",
  "tax_percentage": 18,
  "tax_amount": "number",
  "total": "number",
  "total_cost": "number",
  "profit_margin": "number",
  "payment_method": "cod|bank_transfer",
  "payment_status": "pending|paid|failed",
  "order_status": "pending|confirmed|processing|shipped|delivered|cancelled",
  "created_at": "datetime"
}
```

---

## Prioritized Backlog

### P0 - Critical
- [x] E-commerce system implementation ✅

### P1 - High Priority
- [ ] Payment gateway integration (Razorpay/Stripe)
- [x] Product deletion button works correctly (verified in testing)
- [ ] Product image upload improvements

### P2 - Medium Priority
- [ ] Performance optimization
- [ ] User profile management
- [ ] Order tracking notifications

### P3 - Low Priority
- [ ] In-Quotation Product Cloning testing
- [ ] Role-Based Access Control (RBAC)
- [ ] Auto-logout functionality

---

## Test Credentials
- **Admin**: barath40893@gmail.com / InHaus@2024
- **Customer**: test@inhaus.co.in / Test1234

---

## Test Files
- `/app/backend/tests/test_ecommerce.py` - 22 backend API tests
- `/app/test_reports/iteration_1.json` - Test report

---

## Known Issues
- Products show "No Image" placeholder - need to upload product images via admin

---

## Test Reports
- `/app/test_reports/iteration_1.json` - E-commerce backend tests
- `/app/test_reports/iteration_2.json` - Admin navigation fix verification
