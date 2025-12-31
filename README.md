# 🌍 LocalGuide – Tour Booking Platform (Backend)

**Live API URL:**
👉 https://your-api-domain.com

**Frontend URL (optional):**
👉 https://your-frontend-domain.com

---

## 📌 Project Overview

**LocalGuide** is a role-based tour booking platform backend where:

- **Tourists** can browse tours, book guides, make payments, review tours, and manage wishlists
- **Guides** can manage their tour listings and handle incoming bookings
- **Admins** can monitor and manage the entire system

This backend is built following **clean architecture**, **role-based access control**, and **industry best practices** using Node.js, Express, Prisma, and PostgreSQL.

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (ADMIN, GUIDE, TOURIST)
- Secure protected routes
- Password change enforcement
- OAuth-ready structure (Google, Facebook, GitHub)

### 👤 User Roles
- Tourist
- Guide (OTP verification system)
- Admin (super admin support)

### 🧭 Tour Management
- Create, update, activate/deactivate tours (Guide)
- Public tour listing with:
  - Search
  - City filter
  - Category filter
  - Price range filter
  - Pagination & sorting
- Guide-specific “My Tours” listing

### 📅 Booking System
- Tour booking by tourists
- Role-based booking access:
  - Tourist → own bookings
  - Guide → incoming bookings
  - Admin → all bookings
- Booking lifecycle:
  - PENDING → CONFIRMED → COMPLETED / CANCELLED

### 💳 Payment System
- SSLCommerz payment gateway integration
- Secure transaction handling
- Idempotent payment success handler
- Automatic booking update after payment
- Guide payout calculation

### ⭐ Reviews
- Tour reviews by tourists
- Review allowed only after completed booking
- One review per booking
- Public review listing

### ❤️ Wishlist
- Add/remove tours to wishlist
- Tourist-specific wishlist retrieval

### 📧 OTP & Email
- OTP-based guide verification
- Rate-limited OTP resend
- Email notification utility

### 🛡️ Security & Stability
- Global error handler
- Custom API error handling
- Zod request validation
- Rate limiting
- Prisma-safe queries
- Transaction-based critical operations

---

## 🧰 Technology Stack

### Backend
- Node.js
- Express.js
- TypeScript

### Database
- PostgreSQL
- Prisma ORM

### Authentication
- JWT
- Passport.js (OAuth ready)

### Validation & Utilities
- Zod
- Axios
- QS
- bcrypt
- http-status

### Payment
- SSLCommerz

### Tooling
- Postman
- ESLint
- Prettier

---

## 🗂️ Project Structure

src/
├── app/
│ ├── modules/
│ │ ├── auth
│ │ ├── user
│ │ ├── admin
│ │ ├── guide
│ │ ├── tourist
│ │ ├── tour
│ │ ├── booking
│ │ ├── payment
│ │ ├── review
│ │ └── wishlist
│ ├── middlewares
│ ├── errors
│ ├── interfaces
│ └── routes
├── helpers
├── lib
├── config
├── generated
├── app.ts
└── server.ts



---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository
```bash
git clone https://github.com/your-username/localguide-backend.git
cd localguide-backend
```


### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Environment Variables

Create a .env file:
```
# App
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/app_db?schema=public"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Session
EXPRESS_SESSION_SECRET=your_express_session_secret

# Password & Auth
SALT_ROUND=10
JWT_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=1y

# Email (Gmail SMTP)
EMAIL=example@gmail.com
APP_PASS="xxxx xxxx xxxx xxxx"

# Password Reset
RESET_PASS_LINK=http://localhost:3000/reset-password
RESET_PASS_TOKEN=your_reset_token_secret
RESET_PASS_TOKEN_EXPIRES_IN=5m

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# SSLCommerz (Sandbox)
SSLC_STORE_ID=your_store_id
SSLC_STORE_PASSWORD=your_store_password
SSLC_PAYMENT_URL=https://sandbox.sslcommerz.com/gwprocess/v3/api.php
SSLC_SUCCESS_URL=http://localhost:5000/api/v1/payments/sslcommerz/success
SSLC_FAIL_URL=http://localhost:5000/api/v1/payments/sslcommerz/fail
SSLC_CANCEL_URL=http://localhost:5000/api/v1/payments/sslcommerz/cancel
```

### 🗄️ Database Setup
```bash
npx prisma migrate dev
npx prisma generate
```

### ▶️ Run the Server
Development
```bash
npm run dev
```
Production
```bash
npm run build
npm start
```

### 🧪 API Testing

Import the provided Postman Collection

APIs are organized module-wise and role-wise

Supports JSON body, form-data, and query parameters

### 📈 Future Improvements

- Admin analytics dashboard

- Refund handling

- Guide payout automation

- Notification system

- Redis caching

- Swagger API documentation

### 👨‍💻 Author

Habib
Diploma in Engineering (CSE)
Backend Developer (Node.js, Prisma, PostgreSQL)

### 📜 License

This project is developed for educational and assignment purposes.
Free to use and modify.