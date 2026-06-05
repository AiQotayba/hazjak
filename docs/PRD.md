أيوه هيك الترتيب أفضل بكثير واحترافي أكثر، خصوصًا إنك شغال على مشروع Full System مو مجرد CRUD App.

الترتيب الصح يكون:

# 1. Project Overview

# 2. Tech Stack

# 3. Monorepo Structure

# 4. System Architecture

# 5. UX Flows

# 6. Database Design

# 7. API Structure

# 8. Features Breakdown

# 9. Security & Permissions

# 10. Deployment

وهذا أفضل ترتيب حقيقي للمشروع.

---

# PROJECT OVERVIEW

```txt id="x5k3d1"
Football Stadium Booking Platform

A full-stack booking platform that allows users to discover football stadiums,
view availability, submit booking requests, pay deposits, and manage bookings.

The platform contains three main roles:
- Admin
- Stadium Owner
- User

The system includes:
- Booking management
- Calendar scheduling
- Notifications
- Reviews & ratings
- Deposit payments
- Analytics dashboard
- Role-based permissions
- Booking conflict prevention
```

---

# TECH STACK

# Frontend

```txt id="k6h1fa"
Frontend
├── Next.js
├── TypeScript
├── Tailwind CSS
├── shadcn/ui
├── React Hook Form
├── Zod
├── TanStack Query
├── Zustand
├── Framer Motion
└── PWA Support
```

---

# Backend

```txt id="q8j2mv"
Backend
├── Node.js
├── Express.js
├── TypeScript
├── Prisma ORM
├── PostgreSQL
├── JWT Authentication
├── Bcrypt
├── Cookie Parser
├── Multer 
├── Nodemailer
├── Firebase Push Notifications
├── Socket.IO
├── Rate Limiting
├── Helmet
├── CORS
├── Validation Middleware 
```

---

# DATABASE

```txt id="v4n8rk"
Database
├── PostgreSQL
├── Prisma ORM
├── Prisma Migrations
├── Database Seeding
└── Relationship Management
``` 

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  ADMIN
  STADIUM_OWNER
  USER
}

enum BookingStatus {
  PENDING
  CONFIRMED
  COMPLETED
  CANCELLED
  REJECTED
  EXPIRED
  NO_SHOW
}

enum PaymentStatus {
  PENDING
  PARTIALLY_PAID
  PAID
  FAILED
  REFUNDED
}

enum NotificationType {
  BOOKING_PENDING
  BOOKING_CONFIRMED
  BOOKING_REJECTED
  BOOKING_CANCELLED
  MATCH_REMINDER
  DEPOSIT_REMINDER
}

model User {
  id                String           @id @default(uuid())
  firstName         String
  lastName          String
  email             String           @unique
  phone             String?
  password          String
  avatar            String?
  role              Role             @default(USER)
  isEmailVerified   Boolean          @default(false)
  otpCode           String?
  otpExpiresAt      DateTime?
  createdAt         DateTime         @default(now())
  updatedAt         DateTime         @updatedAt

  stadiums          Stadium[]
  bookings          Booking[]
  reviews           Review[]
  notifications     Notification[]
  payments          Payment[]
}

model Stadium {
  id                  String            @id @default(uuid())
  ownerId             String
  name                String
  slug                String            @unique
  description         String
  address             String
  city                String
  area                String
  latitude            Float?
  longitude           Float?
  morningPrice        Float
  eveningPrice        Float
  depositAmount       Float?
  contactPhone        String?
  contactWhatsapp     String?
  coverImage          String?
  isActive            Boolean           @default(true)
  createdAt           DateTime          @default(now())
  updatedAt           DateTime          @updatedAt

  owner               User              @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  images              StadiumImage[]
  bookings            Booking[]
  reviews             Review[]
  availabilitySlots   AvailabilitySlot[]
}

model StadiumImage {
  id          String      @id @default(uuid())
  stadiumId   String
  imageUrl    String
  createdAt   DateTime    @default(now())

  stadium     Stadium     @relation(fields: [stadiumId], references: [id], onDelete: Cascade)
}

model AvailabilitySlot {
  id            String      @id @default(uuid())
  stadiumId     String
  startTime     DateTime
  endTime       DateTime
  isAvailable   Boolean     @default(true)
  createdAt     DateTime    @default(now())

  stadium       Stadium     @relation(fields: [stadiumId], references: [id], onDelete: Cascade)

  @@index([stadiumId, startTime, endTime])
}

model Booking {
  id                  String            @id @default(uuid())
  userId              String
  stadiumId           String
  startTime           DateTime
  endTime             DateTime
  totalPrice          Float
  depositAmount       Float?
  status              BookingStatus     @default(PENDING)
  notes               String?
  cancelledReason     String?
  createdAt           DateTime          @default(now())
  updatedAt           DateTime          @updatedAt

  user                User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  stadium             Stadium           @relation(fields: [stadiumId], references: [id], onDelete: Cascade)
  payment             Payment?
  review              Review?

  @@index([stadiumId, startTime, endTime])
}


model Review {
  id                String        @id @default(uuid())
  userId            String
  stadiumId         String
  bookingId         String        @unique
  rating            Int
  comment           String?
  ownerReply        String?
  createdAt         DateTime      @default(now())

  user              User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  stadium           Stadium       @relation(fields: [stadiumId], references: [id], onDelete: Cascade)
  booking           Booking       @relation(fields: [bookingId], references: [id], onDelete: Cascade)
}

model Notification {
  id                String              @id @default(uuid())
  userId            String
  title             String
  message           String
  type              NotificationType
  isRead            Boolean             @default(false)
  createdAt         DateTime            @default(now())

  user              User                @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model RefreshToken {
  id                String        @id @default(uuid())
  userId            String
  token             String        @unique
  expiresAt         DateTime
  createdAt         DateTime      @default(now())

  user              User          @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Settings {
  id                      String      @id @default(uuid())
  cancellationPolicy      String?
  allowInstantBooking     Boolean     @default(false)
  bookingExpirationMin    Int         @default(15)
  createdAt               DateTime    @default(now())
  updatedAt               DateTime    @updatedAt
}
```
 

# PAYMENT & NOTIFICATIONS

```txt id="m1c7yw"
Services  
├── WhatsApp Notifications
├── Push Notifications
└── Cron Jobs
```

---

# MONOREPO STRUCTURE

```txt id="e2d4tz"
stadium-booking-platform/
├── apps/
│
│   ├── web/                              # Main Platform (User + Stadium Owner)
│   │   ├── src/
│   │   │
│   │   │   ├── app/
│   │   │   │
│   │   │   │   ├── (public)/            # Public Pages
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── stadiums/
│   │   │   │   │   ├── about/
│   │   │   │   │   ├── contact/
│   │   │   │   │   └── policy/
│   │   │   │
│   │   │   │   ├── (auth)/              # Authentication
│   │   │   │   │   ├── login/
│   │   │   │   │   ├── register/
│   │   │   │   │   ├── forgot-password/
│   │   │   │   │   └── verify-email/
│   │   │   │
│   │   │   │   ├── user/                # User Dashboard
│   │   │   │   │   ├── profile/
│   │   │   │   │   ├── bookings/
│   │   │   │   │   ├── notifications/
│   │   │   │   │   └── reviews/
│   │   │   │
│   │   │   │   ├── stadium-owner/       # Stadium Owner Dashboard
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   ├── bookings/
│   │   │   │   │   ├── calendar/
│   │   │   │   │   ├── analytics/
│   │   │   │   │   ├── reviews/
│   │   │   │   │   ├── stadium/
│   │   │   │   │   └── settings/
│   │   │   │
│   │   │   │   └── stadium/
│   │   │   │       └── [slug]/
│   │   │   │
│   │   │   ├── components/
│   │   │   │
│   │   │   │   ├── ui/
│   │   │   │   ├── shared/
│   │   │   │   ├── booking/
│   │   │   │   ├── stadium/
│   │   │   │   ├── review/
│   │   │   │   ├── calendar/
│   │   │   │   ├── analytics/
│   │   │   │   └── notifications/
│   │   │   │
│   │   │   ├── features/
│   │   │   │   ├── auth/
│   │   │   │   ├── booking/
│   │   │   │   ├── stadium/
│   │   │   │   ├── review/
│   │   │   │   ├── payment/
│   │   │   │   └── notifications/
│   │   │   │
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── store/
│   │   │   ├── lib/
│   │   │   ├── types/
│   │   │   ├── styles/
│   │   │   └── middleware.ts
│   │   │
│   │   ├── public/
│   │   ├── package.json
│   │   ├── next.config.js
│   │   ├── tailwind.config.ts
│   │   └── tsconfig.json
│
│   ├── admin/                            # Separate Admin Panel
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── features/
│   │   │   ├── services/
│   │   │   ├── hooks/
│   │   │   ├── store/
│   │   │   └── middleware.ts
│   │   │
│   │   ├── public/
│   │   ├── package.json
│   │   ├── next.config.js
│   │   ├── tailwind.config.ts
│   │   └── tsconfig.json
│
│   └── api/                              # Backend API
│       ├── src/
│       │
│       │   ├── modules/
│       │   │
│       │   │   ├── auth/
│       │   │   ├── users/
│       │   │   ├── stadiums/
│       │   │   ├── stadium-owner/
│       │   │   ├── bookings/
│       │   │   ├── reviews/
│       │   │   ├── payments/
│       │   │   ├── notifications/
│       │   │   ├── analytics/
│       │   │   ├── uploads/
│       │   │   └── settings/
│       │   │
│       │   ├── middlewares/
│       │   ├── guards/
│       │   ├── services/
│       │   ├── utils/
│       │   ├── jobs/
│       │   ├── sockets/
│       │   ├── config/
│       │   ├── app.ts
│       │   └── server.ts
│       │
│       ├── uploads/
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│
│   ├── ui/                               # Shared UI Components
│   ├── database/                         # Prisma
│   ├── validation/                       # Zod Schemas
│   ├── types/                            # Shared Types
│   ├── utils/                            # Shared Utils
│   ├── constants/                        # Global Constants
│   └── config/                           # Shared Config
│
├── docs/
├── docker/
├── scripts/
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

---

# MONOREPO TOOLS

```txt id="y8b6xe"
Monorepo Tools
├── Turborepo
├── pnpm Workspaces
├── Shared Packages
├── Shared Types
├── Shared Validation
└── Shared UI Components
```

---

# WHY MONOREPO?

```txt id="n0s4ql"
Benefits
├── Shared Types Between Frontend & Backend
├── Shared Validation Schemas
├── Shared UI Components
├── Better Code Organization
├── Easier Scaling
├── Faster Development
└── Cleaner Architecture
```

---

# SECURITY

```txt id="p9w2jm"
Security
├── JWT Authentication
├── Role-Based Access Control
├── Password Hashing
├── Rate Limiting
├── Secure Cookies
├── CSRF Protection
├── Input Validation
├── File Upload Validation
├── SQL Injection Protection
└── XSS Protection
``` 
# API STRUCTURE
# API ARCHITECTURE

```txt id="z8j3kx"
Base URL
/api/v1
```

---

# AUTH API

```txt id="f3n8qp"
POST   /auth/register
POST   /auth/login
POST   /auth/logout
POST   /auth/refresh-token
POST   /auth/forgot-password
POST   /auth/reset-password
POST   /auth/verify-email
POST   /auth/verify-otp
GET    /auth/me
```

---

# AUTH REQUEST BODY

## POST /auth/register

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+970599999999",
  "password": "12345678"
}
```

---

## POST /auth/login

```json
{
  "email": "john@example.com",
  "password": "12345678"
}
```

---

# AUTH RESPONSE

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "jwt-token",
    "user": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "USER"
    }
  }
}
```

---

# STADIUM API

```txt id="a5k2tm"
GET     /stadiums
GET     /stadiums/:id
POST    /stadiums
PATCH   /stadiums/:id
DELETE  /stadiums/:id
GET     /stadiums/:id/reviews
GET     /stadiums/:id/availability
POST    /stadiums/:id/images
```

---

# STADIUM FILTERS

## GET /stadiums

```txt id="m9x2fs"
Query Params
├── search=
├── city=
├── area=
├── minPrice=
├── maxPrice=
├── rating=
├── available=
├── page=
├── limit=
├── sortBy=
└── order=
```

---

# EXAMPLE FILTER REQUEST

```txt id="h2w7pr"
/api/v1/stadiums?city=Gaza&minPrice=50&maxPrice=100&rating=4&page=1&limit=10
```

---

# CREATE STADIUM BODY

## POST /stadiums

```json
{
  "name": "Elite Football Stadium",
  "description": "Professional football field",
  "city": "Gaza",
  "area": "Al Remal",
  "address": "Street 10",
  "morningPrice": 50,
  "eveningPrice": 80,
  "depositAmount": 20,
  "contactPhone": "+970599999999",
  "contactWhatsapp": "+970599999999"
}
```

---

# STADIUM RESPONSE

```json
{
  "success": true,
  "message": "Stadium created successfully",
  "data": {
    "id": "uuid",
    "name": "Elite Football Stadium",
    "city": "Gaza",
    "morningPrice": 50,
    "eveningPrice": 80
  }
}
```

---

# BOOKING API

```txt id="v1m8qd"
GET     /bookings
GET     /bookings/:id
POST    /bookings
PATCH   /bookings/:id
DELETE  /bookings/:id
PATCH   /bookings/:id/status
GET     /bookings/upcoming
GET     /bookings/history
POST    /bookings/:id/rebook
```

---

# BOOKING FILTERS

## GET /bookings

```txt id="s7j3lp"
Query Params
├── status=
├── stadiumId=
├── userId=
├── startDate=
├── endDate=
├── page=
├── limit=
├── sortBy=
└── order=
```

---

# CREATE BOOKING BODY

## POST /bookings

```json
{
  "stadiumId": "uuid",
  "startTime": "2026-05-22T18:00:00Z",
  "endTime": "2026-05-22T19:00:00Z",
  "notes": "Friendly match"
}
```

---

# UPDATE BOOKING STATUS BODY

## PATCH /bookings/:id/status

```json
{
  "status": "CONFIRMED"
}
```

---

# BOOKING RESPONSE

```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": "uuid",
    "status": "PENDING",
    "totalPrice": 80,
    "depositAmount": 20
  }
}
```

---

# AVAILABILITY API

```txt id="t4d6wy"
GET     /availability
POST    /availability
PATCH   /availability/:id
DELETE  /availability/:id
```

---

# AVAILABILITY FILTERS

```txt id="e8j5ra"
Query Params
├── stadiumId=
├── startDate=
├── endDate=
└── available=
```

---

# CREATE AVAILABILITY BODY

## POST /availability

```json
{
  "stadiumId": "uuid",
  "startTime": "2026-05-22T08:00:00Z",
  "endTime": "2026-05-22T09:00:00Z"
}
```

---

# REVIEW API

```txt id="k3w2vs"
GET     /reviews
POST    /reviews
PATCH   /reviews/:id
DELETE  /reviews/:id
POST    /reviews/:id/reply
```

---

# REVIEW FILTERS

```txt id="j8v6tc"
Query Params
├── stadiumId=
├── rating=
├── page=
├── limit=
└── sortBy=
```

---

# CREATE REVIEW BODY

## POST /reviews

```json
{
  "bookingId": "uuid",
  "stadiumId": "uuid",
  "rating": 5,
  "comment": "Amazing stadium"
}
```

---

# PAYMENT API

```txt id="q2n4yf"
GET     /payments
GET     /payments/:id
POST    /payments/create-intent
POST    /payments/webhook
PATCH   /payments/:id/refund
```

---

# CREATE PAYMENT BODY

## POST /payments/create-intent

```json
{
  "bookingId": "uuid",
  "amount": 20
}
```

---

# PAYMENT RESPONSE

```json
{
  "success": true,
  "message": "Payment intent created",
  "data": {
    "clientSecret": "secret-key"
  }
}
```

---

# USER API

```txt id="g9m1pk"
GET     /users
GET     /users/:id
PATCH   /users/:id
DELETE  /users/:id
GET     /users/:id/bookings
GET     /users/:id/notifications
```

---

# USER FILTERS

```txt id="r6k8xt"
Query Params
├── role=
├── search=
├── verified=
├── page=
├── limit=
└── sortBy=
```

---

# NOTIFICATION API

```txt id="u8d4vz"
GET     /notifications
PATCH   /notifications/:id/read
PATCH   /notifications/read-all
DELETE  /notifications/:id
```

---

# ANALYTICS API

```txt id="c1m7qt"
GET     /analytics/dashboard
GET     /analytics/revenue
GET     /analytics/bookings
GET     /analytics/popular-hours
```

---

# ANALYTICS FILTERS

```txt id="l5v3fr"
Query Params
├── stadiumId=
├── startDate=
├── endDate=
├── period=
└── type=
```

---

# SETTINGS API

```txt id="x2p9hd"
GET     /settings
PATCH   /settings
```

---

# COMMON RESPONSE STRUCTURE

## SUCCESS RESPONSE

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

---

## ERROR RESPONSE

```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "email": ["Email already exists"]
  }
}
```

---

# PAGINATION RESPONSE

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

# BEST PRACTICES

```txt id="n4f7jr"
API Standards
├── RESTful Structure
├── Versioned API (/v1)
├── Consistent Response Format
├── Pagination Support
├── Filtering Support
├── Sorting Support
├── Validation Middleware
├── JWT Authentication
├── Role-Based Authorization
├── Rate Limiting
└── File Upload Validation
```
