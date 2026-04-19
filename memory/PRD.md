# InHaus Smart Home - Product Requirements Document

## Original Problem Statement
Build and refine an internal tool for the "InHaus" e-commerce business. This includes product management, generating customized PDF quotations, and a complete e-commerce system with customer authentication. The public homepage features an interactive 3D floorplan demo inspired by the competitor site NOVIQ.

## Core Requirements
- **Product Management**: Admin panel to manage smart home products with image upload (PNG, max 2MB)
- **Quotation System**: Generate, send, and download PDF quotations with product images
- **E-commerce System**: Customer authentication, room-based cart, checkout, and order management
- **User & Role Management**: Admin and Customer authentication with JWT
- **Invoice System**: PDF invoices with room-wise product grouping, shipping/billing address, company branding
- **Interactive Homepage**: NOVIQ-inspired 3D floorplan with toggleable room lights using user's NoLights.png

## Tech Stack
- **Frontend**: React, Tailwind CSS, Shadcn UI, Framer Motion
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
- [x] PDF invoice generation with InHaus branding
- [x] Invoice download and email sending
- [x] Customer orders history page
- [x] Admin customer management (manual user creation)
- [x] Admin shop orders with profit margins

#### Admin Order Editing (Completed)
- [x] Edit individual product prices/quantities in orders
- [x] Apply percentage/fixed amount discount
- [x] Toggle GST inclusion, change GST percentage
- [x] Convert customer orders to quotations
- [x] Download invoice with applied discounts

#### Core Features (Completed)
- [x] Admin authentication (JWT-based)
- [x] Product CRUD operations
- [x] Quotation creation with multi-product support
- [x] PDF generation with product images
- [x] Quote sending functionality
- [x] Contact form submission
- [x] Responsive UI with InHaus branding

### February-March 2026

#### Bug Fixes (Completed)
- [x] Fixed blank /login page (redirects to /customer/login)
- [x] Fixed GET /api/quotations 500 error (legacy schema migration)
- [x] Fixed convert_order_to_quotation schema mismatch
- [x] Fixed broken product images in admin quotation/invoice tables

#### Feature Additions (Completed)
- [x] Price Calculator iframe modal on Quotation & Invoice pages
- [x] Invoice Payment Tracking (Amount Paid, Balance Due, Payment Status)
- [x] Product image thumbnails in quotation/invoice item tables

### April 2026

#### Homepage Complete Redesign (April 2026)
- [x] New "Jewel & Luxury" dark theme with Outfit + Manrope Google Fonts
- [x] Hero: Left copy ("Automation for Every Space") + Right interactive floorplan with mini toggle bar
- [x] Tech Ticker: react-fast-marquee scrolling tech labels
- [x] Service Categories: "Homes. Offices. Hotels." with 3 image cards (Residential, Commercial, Hotels)
- [x] Interactive Demo: NOVIQ-style controller + 9-room PNG overlay floorplan (realistic pre-rendered lighting)
- [x] Stats (5000+ homes, 50K+ devices), Partners marquee, Feature cards, CTA section

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

### Customer Cart & Orders
- `GET /api/customer/rooms` - Get customer's rooms
- `POST /api/customer/rooms` - Add custom room
- `POST /api/customer/checkout` - Place order
- `GET /api/customer/orders` - Get order history
- `GET /api/customer/orders/{id}/invoice` - Download invoice PDF

### Admin (JWT Required)
- `POST /api/auth/login` - Admin login
- `GET/POST/DELETE /api/products` - Product CRUD
- `GET/POST /api/quotations` - Quotation management
- `GET /api/admin/customers` - View all customers
- `GET /api/admin/customer-orders` - View all orders
- `POST /api/admin/invoices` - Create invoice

---

## Prioritized Backlog

### P1 - High Priority
- [ ] GST calculation logic on backend + frontend + PDF invoices
- [ ] Auto-email invoices to customers after checkout
- [ ] Payment gateway integration (Razorpay/Stripe)

### P2 - Medium Priority
- [ ] Performance optimization (app reported as "too slow")
- [ ] User profile management
- [ ] Order tracking notifications
- [ ] Refactor server.py (~3000 lines) into separate route/model files

### P3 - Low Priority
- [ ] Role-Based Access Control (RBAC)
- [ ] Auto-logout functionality

---

## Test Credentials
- **Admin**: barath40893@gmail.com / InHaus@2024
- **Customer**: test@inhaus.co.in / Test1234

## Test Reports
- `/app/test_reports/iteration_1.json` - E-commerce backend tests
- `/app/test_reports/iteration_2.json` - Admin navigation fix verification
- `/app/test_reports/iteration_3.json` - Homepage floorplan + full regression (100% pass)
- `/app/test_reports/iteration_4.json` / `iteration_5.json` - Touch/Tap/Talk demo iterations
- `/app/test_reports/iteration_6.json` - Split hero + voice + products + admin regression (Backend 26/26, Frontend ~95%)

---

## February 2026

### Hero Section Cinematic Refresh (Feb 2026) — COMPLETED
- [x] Split hero layout: headline + CTAs on left, live floorplan on right (desktop); stacked on mobile (floorplan first)
- [x] Headline + typewriter "SMARTER THAN EVER" appears immediately (delay reduced to 0.2s)
- [x] Hero stats strip: 9 Live Rooms / 3 Control Modes / 60+ Products
- [x] **Walk-In / Walk-Out Looping Narrative** on live floorplan:
  - Phase 0 (Walk-in): Lights cascade ON with "Walking In / Lights follow your path..."
  - Phase 1 (Lit): All lights glow with "Your Space Wakes Up / Every room, instantly ready."
  - Phase 2 (Walk-out): Lights cascade OFF with "Walking Out / Fading gracefully as you leave."
  - Phase 3 (Rest): "Energy Saved / Ready when you return." (emerald accent)
- [x] Animated walking person silhouette moves with phase direction (LTR walk-in, RTL walk-out)
- [x] Loop auto-stops when user interacts with Touch/Tap/Talk demo section below
