# SalesPro - Enterprise Inventory & Sales Management
## Complete Project Blueprint

---

## 📋 PROJECT OVERVIEW

An enterprise-grade inventory and sales management application with:
- Multi-role access (Admin, Sales Reps, Dispatch Partners)
- Order management from social media ads
- Commission calculation and earnings tracking
- Dispatch and delivery management
- Payment gateway integration (Paystack & Flutterwave)
- PWA support for mobile installation

---

## 🏗️ ARCHITECTURE

### Tech Stack
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Knex.js ORM
- **Frontend**: React 18 with React Router v6
- **State Management**: React Query (TanStack Query)
- **Styling**: Tailwind CSS with Dark Mode
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Animations**: Framer Motion
- **PWA**: Service Workers, Web Manifest
- **Auth**: JWT with access/refresh tokens
- **Payments**: Paystack + Flutterwave integration

### Project Structure
inventory-sales-app/
├── package.json # Monorepo orchestrator
├── setup.sh # Automated setup script
├── PROJECT_BLUEPRINT.md # This file
├── server/
│ ├── package.json
│ ├── .env
│ ├── ecosystem.config.js # PM2 config
│ ├── src/
│ │ ├── app.js # Express app entry
│ │ ├── config/
│ │ │ ├── database.js # Knex DB connection
│ │ │ └── knexfile.js # Knex configuration
│ │ ├── models/ # Database entities
│ │ │ ├── User.js
│ │ │ ├── Product.js
│ │ │ ├── Order.js
│ │ │ ├── Earning.js
│ │ │ ├── DispatchPartner.js
│ │ │ ├── DispatchAssignment.js
│ │ │ └── UserCommission.js
│ │ ├── repositories/ # Database queries
│ │ │ ├── user.repository.js
│ │ │ ├── product.repository.js
│ │ │ ├── order.repository.js
│ │ │ ├── earning.repository.js
│ │ │ ├── dispatchPartner.repository.js
│ │ │ ├── dispatchAssignment.repository.js
│ │ │ └── dispatchEarning.repository.js
│ │ ├── services/ # Business logic
│ │ │ ├── auth.service.js
│ │ │ ├── product.service.js
│ │ │ ├── order.service.js
│ │ │ ├── commission.service.js
│ │ │ ├── dispatch.service.js
│ │ │ ├── salesRep.service.js
│ │ │ ├── payment.service.js
│ │ │ └── admin.service.js
│ │ ├── controllers/ # Request handlers
│ │ │ ├── auth.controller.js
│ │ │ ├── product.controller.js
│ │ │ ├── order.controller.js
│ │ │ ├── commission.controller.js
│ │ │ ├── dispatch.controller.js
│ │ │ ├── salesRep.controller.js
│ │ │ ├── payment.controller.js
│ │ │ └── admin.controller.js
│ │ ├── middleware/
│ │ │ ├── auth.js # JWT auth & role check
│ │ │ ├── validate.js # Joi validation
│ │ │ ├── auditLogger.js # Audit trail
│ │ │ └── requestLogger.js # HTTP logging
│ │ ├── routes/ # API routes
│ │ │ ├── auth.routes.js
│ │ │ ├── product.routes.js
│ │ │ ├── order.routes.js
│ │ │ ├── commission.routes.js
│ │ │ ├── dispatch.routes.js
│ │ │ ├── salesRep.routes.js
│ │ │ ├── payment.routes.js
│ │ │ └── admin.routes.js
│ │ ├── dtos/ # Request/Response objects
│ │ └── utils/
│ │ ├── logger.js # Winston logger
│ │ └── validators.js # Joi schemas
│ ├── migrations/ # Database migrations
│ │ ├── 001_initial_schema.js
│ │ ├── 002_commission_tables.js
│ │ └── 003_dispatch_tables.js
│ └── seeds/
│ └── 001_seed_all_data.js # Sample data seeder
└── client/
├── package.json
├── .env
├── tailwind.config.js
├── public/
│ ├── manifest.json # PWA manifest
│ ├── serviceWorker.js # Service worker
│ ├── offline.html # Offline page
│ └── icons/ # PWA icons
└── src/
├── index.js # React entry
├── App.js # Root component
├── index.css # Tailwind + PWA styles
├── serviceWorkerRegistration.js
├── context/
│ ├── AuthContext.js
│ └── ThemeContext.js
├── services/
│ ├── api.js # Axios instance
│ ├── productService.js
│ ├── orderService.js
│ ├── commissionService.js
│ ├── dispatchService.js
│ ├── salesRepService.js
│ ├── paymentService.js
│ └── adminService.js
├── components/
│ ├── layout/
│ │ ├── ProtectedRoute.js
│ │ ├── Sidebar.js
│ │ └── TopBar.js
│ ├── feedback/
│ │ ├── Toast.js
│ │ ├── LoadingSpinner.js
│ │ ├── ErrorBoundary.js
│ │ └── ConfirmDialog.js
│ ├── forms/
│ │ ├── ValidatedInput.js
│ │ └── PasswordStrength.js
│ ├── datadisplay/
│ │ ├── DataTable.js
│ │ └── StatusBadge.js
│ └── pwa/
│ ├── InstallPrompt.js
│ └── OfflineIndicator.js
├── pages/
│ ├── auth/
│ │ └── LoginPage.js
│ ├── customer/
│ │ └── OrderPage.js
│ ├── admin/
│ │ ├── Dashboard.js
│ │ ├── AdminOverview.js
│ │ ├── ProductManagement.js
│ │ ├── ProductFormModal.js
│ │ ├── AdSetup.js
│ │ ├── SalesRepManagement.js
│ │ ├── SalesRepFormModal.js
│ │ ├── SalesRepDetailsModal.js
│ │ ├── CredentialsModal.js
│ │ ├── PasswordResetModal.js
│ │ ├── DispatchPartnerManagement.js
│ │ ├── PaymentSettings.js
│ │ └── CommissionSettings.js
│ ├── salesrep/
│ │ ├── Dashboard.js
│ │ ├── Overview.js
│ │ ├── OrdersQueue.js
│ │ ├── MyOrders.js
│ │ └── Earnings.js
│ └── dispatch/
│ ├── Dashboard.js
│ ├── RegisterPage.js
│ ├── DispatchOverview.js
│ ├── AssignedDeliveries.js
│ ├── DeliveryHistory.js
│ └── DispatchEarnings.js
└── utils/
└── logger.js
text


---

## 🔌 API ENDPOINTS

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/login | No | User login |
| POST | /api/auth/refresh | No | Refresh token |
| GET | /api/auth/me | Yes | Get current user |
| POST | /api/auth/change-password | Yes | Change password |
| POST | /api/auth/users | Admin | Create user |

### Products
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/products | Admin/SR | List products |
| GET | /api/products/:id | Admin/SR | Get product |
| POST | /api/products | Admin | Create product |
| PUT | /api/products/:id | Admin | Update product |
| DELETE | /api/products/:id | Admin | Delete product |
| PATCH | /api/products/:id/stock | Admin | Update stock |
| GET | /api/products/ads | Admin/SR | Get ad links |

### Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/orders | No | Create order (customer) |
| GET | /api/orders | Yes | List orders |
| GET | /api/orders/:id | Yes | Get order |
| PATCH | /api/orders/:id/status | Yes | Update status |
| POST | /api/orders/assign | Admin | Assign to reps |
| GET | /api/orders/stats | SR | Rep stats |

### Commissions
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/commissions/set/:userId | Admin | Set commission |
| GET | /api/commissions/my-earnings | SR | My earnings |
| GET | /api/commissions/user/:userId | Admin | User earnings |
| POST | /api/commissions/process-salaries | Admin | Process salaries |

### Dispatch
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/dispatch/register | No | Register partner |
| GET | /api/dispatch/dashboard | DP | Partner dashboard |
| PATCH | /api/dispatch/delivery/:id/status | DP | Update delivery |
| GET | /api/dispatch/partners | Admin | List partners |
| POST | /api/dispatch/partners/:id/verify | Admin | Verify partner |
| POST | /api/dispatch/assign | Admin | Assign delivery |

### Sales Reps
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/sales-reps | Admin | Create rep |
| GET | /api/sales-reps | Admin | List reps |
| GET | /api/sales-reps/:id | Admin | Get rep details |
| PUT | /api/sales-reps/:id | Admin | Update rep |
| PATCH | /api/sales-reps/:id/toggle-active | Admin | Activate/deactivate |
| POST | /api/sales-reps/:id/reset-password | Admin | Reset password |

### Payments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/payments/initialize | Yes | Start payment |
| GET | /api/payments/verify/paystack/:ref | No | Verify Paystack |
| GET | /api/payments/verify/flutterwave | No | Verify Flutterwave |
| GET | /api/payments/config | Admin | Get config |
| POST | /api/payments/toggle-method | Admin | Toggle method |
| GET | /api/payments/transactions | Admin | Transaction history |
| POST | /api/payments/webhook/paystack | No | Paystack webhook |
| POST | /api/payments/webhook/flutterwave | No | Flutterwave webhook |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/admin/dashboard | Admin | Dashboard stats |
| GET | /api/admin/sales-reps/performance | Admin | Rep performance |

---

## 🗄️ DATABASE TABLES

1. **users** - All user accounts (admin, sales_rep, dispatch_partner)
2. **products** - Product inventory
3. **customers** - Customer information
4. **orders** - Order records
5. **user_commissions** - Commission structure per user
6. **earnings** - Commission/salary earnings
7. **dispatch_partners** - Dispatch company profiles
8. **dispatch_assignments** - Delivery assignments
9. **dispatch_earnings** - Dispatch partner earnings
10. **payment_transactions** - Payment records
11. **audit_logs** - Audit trail

---

## 🎨 DESIGN SYSTEM

### Colors
- Primary: #4F46E5 (Indigo)
- Secondary: #0D9488 (Teal)
- Accent: #F59E0B (Amber)
- Success: #10B981 (Emerald)
- Danger: #E11D48 (Rose)
- Background Light: #F8FAFC
- Background Dark: #0F172A

### Typography
- Font: System font stack
- Sizes: text-xs (12px) to text-3xl (30px)
- Weights: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Components
- DataTable with sorting, searching, pagination
- StatusBadge with color-coded states
- ValidatedInput with error animations
- ConfirmDialog for destructive actions
- Toast notifications (react-hot-toast)
- LoadingSpinner with smooth animation
- Modal with backdrop blur

---

## 🔐 SECURITY

1. **Authentication**: JWT with access (1h) and refresh (7d) tokens
2. **Password Policy**: 8+ chars, uppercase, lowercase, number, special
3. **Rate Limiting**: 100 req/15min general, 20 req/15min login
4. **Helmet.js**: Security headers
5. **CORS**: Restricted to client origin
6. **Input Validation**: Joi (backend) + Zod (frontend)
7. **Audit Logging**: All CUD operations tracked
8. **Role-Based Access**: Admin, Sales Rep, Dispatch Partner

---

## 📱 PWA FEATURES

1. **Installable**: Web manifest with icons
2. **Offline Support**: Service worker with cache strategies
3. **Push Notifications**: Order updates
4. **Background Sync**: Offline order queuing
5. **Install Prompt**: Custom UI for install
6. **Offline Page**: Styled fallback page

---

## 🚀 QUICK START

```bash
# Clone and enter project
cd inventory-sales-app

# Run setup
chmod +x setup.sh
./setup.sh

# Start development
npm run dev

# Login (Password: Password@123)
# Admin: admin@salespro.com
# Sales Rep: john.smith@salespro.com  
# Dispatch: dispatch1@speedexlogistics.com

📦 DEPLOYMENT
bash

# Build client
npm run build:client

# Start with PM2
cd server
pm2 start ecosystem.config.js

# Or direct
NODE_ENV=production npm start

🔄 ORDER STATUS FLOW
text

pending → assigned → confirmed → processing → dispatched → delivered → completed
                       ↓              ↓            ↓           ↓
                   cancelled     cancelled    cancelled   cancelled

💰 COMMISSION STRUCTURES

    Commission Only: X% per completed order

    Salary Only: Fixed monthly salary

    Salary + Commission: Base salary + X% per order

🛠️ MAINTENANCE
Database
bash

npm run migrate          # Run migrations
npm run seed             # Seed data
npm run migrate:rollback # Rollback last migration

Logs

    Server logs: server/logs/

    Error logs: server/logs/error.log

    Combined: server/logs/combined.log

Version: 1.0.0
Last Updated: 2024
text


---

## How to Use This

1. **Save the seed file** at `server/seeds/001_seed_all_data.js`
2. **Save the setup script** at `setup.sh` in root
3. **Save the blueprint** at `PROJECT_BLUEPRINT.md` in root
4. **Run the setup:**
```bash
chmod +x setup.sh
./setup.sh