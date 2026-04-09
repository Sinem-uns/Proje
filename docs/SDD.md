# HEALTH AI – Co-Creation & Innovation Platform – SDD

This document summarises the architecture and design decisions for the HEALTH AI platform, based on the SRS.

## 1. Architecture Overview

- Layered architecture:
  - Presentation Layer: React + TypeScript + TailwindCSS.
  - Business Logic Layer: Express controllers and services.
  - Data Access Layer: Prisma repositories.
  - Database Layer: PostgreSQL with Prisma schema.

## 2. Layered Design

- **Presentation**: SPA with routing for Landing, Register, Login, Dashboard, Create Post, Post Detail, Search Results, Meeting Request, Profile, and Admin Panel.
- **Business Logic**:
  - AuthService, UserService, PostService, MeetingService, AdminService, LogService, NotificationService.
  - Implements workflows: registration, post lifecycle, meeting requests, admin actions.
- **Data Access**:
  - Prisma models and queries for Users, Posts, Meeting Requests, Activity Logs, Notifications, NDA Acceptances.

## 3. Deployment

- Frontend deployed to Vercel as static build.
- Backend deployed to Render or Railway as a Node.js service.
- PostgreSQL database hosted on Supabase or Neon.
- Communication over HTTPS only.

## 4. Component Design (Backend)

- Express routers:
  - `/auth` for registration and login.
  - `/posts` for post CRUD and search.
  - `/meetings` for meeting request flows.
  - `/admin` for admin actions.
  - `/profile` for user profile and GDPR features.
  - `/logs` for admin log viewing.
- Middleware:
  - `authMiddleware` for JWT verification.
  - `requireRole` for role-based access control.
  - `errorHandler` for centralized error responses.

## 5. Data Design / ER Model

- ER model implemented in `backend/src/prisma/schema.prisma` with enums and relations for:
  - `User`, `Post`, `MeetingRequest`, `ActivityLog`, `Notification`, `NdaAcceptance`.

## 6. API Design

- REST endpoints:
  - Auth: `/auth/register`, `/auth/login`.
  - Posts: `POST /posts`, `GET /posts`, `GET /posts/:id`.
  - Meetings: `POST /meetings/posts/:postId`, `PATCH /meetings/:id/respond`.
  - Admin: `/admin/users`, `/admin/posts`.
  - Logs: `GET /logs` for admin.

## 7. State and Workflow

- Post statuses:
  - `DRAFT`, `ACTIVE`, `MEETING_SCHEDULED`, `PARTNER_FOUND`, `EXPIRED`.
- Meeting request statuses:
  - `PENDING`, `ACCEPTED`, `REJECTED`.
- State transitions enforced in services/controllers (e.g. accepting a meeting sets the related post to `MEETING_SCHEDULED`).

## 8. Security Design

- JWT-based authentication with short-lived access tokens.
- BCrypt password hashing.
- Role-based access control for Engineer, Healthcare Professional, and Admin.
- Activity logging for security-relevant events.
- GDPR-conscious handling of personal data, with export and deletion flows designed into the profile endpoints and database model.

