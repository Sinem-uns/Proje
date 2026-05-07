# HEALTH AI – Co-Creation & Innovation Platform – SRS

This document mirrors the SRS content discussed in the design conversation and describes scope, stakeholders, requirements, and constraints for the HEALTH AI platform.

## 1. Introduction

### 1.1 Purpose

Define requirements for the HEALTH AI – Co-Creation & Innovation Platform, a web system enabling structured first-contact collaboration between healthcare professionals and engineers via structured posts and meeting requests.

### 1.2 Scope

- Facilitate discovery of collaboration opportunities.
- Support structured posts (no file uploads, no patient data).
- Enable interest expression and external meeting scheduling (Zoom/Teams).
- Provide admin oversight, logging, and GDPR-compliant data handling.

### 1.3 User Classes

- Engineer
- Healthcare Professional
- Admin

## 2. Overall Description

- Standalone web application.
- Layered architecture: Presentation → Business Logic → Data Access → Database.
- RESTful API between React frontend and Node/Express backend.

## 3. Functional Requirements (Summary)

- User registration and authentication with .edu validation and email verification.
- Role-based access control with Engineer, Healthcare Professional, and Admin roles.
- Post lifecycle management: Draft → Active → Meeting Scheduled → Partner Found → Expired.
- Search and filtering of posts by domain, expertise, city, country, stage, and status.
- Meeting request workflow with NDA acceptance and time slots.
- Admin panel for user/post management and activity logs.
- Activity logging for logins, post actions, meeting requests, and admin actions.
- GDPR features: data export and deletion request.

## 4. Non-Functional Requirements

- Search response < 1.5 sec for typical queries.
- Page load < 3 sec for core pages.
- HTTPS mandatory in production.
- Encrypted passwords with bcrypt.
- JWT-based authentication with short-lived access tokens and refresh tokens.
- Responsive design and WCAG accessibility considerations.

## 5. Use Cases (Excerpt)

- Register user with .edu email and verify via email.
- Login and obtain JWT.
- Create, edit, and manage collaboration posts.
- Search and browse collaboration posts.
- Express interest and request meetings.
- Admin moderates users and posts.
- User requests GDPR data export and deletion.

## 6. Data Model (High-Level)

- Users, Posts, Meeting Requests, Activity Logs, Notifications, NDA Acceptances.
- Relationships:
  - User 1–N Post (owner).
  - User 1–N MeetingRequest (requester and owner).
  - Post 1–N MeetingRequest.
  - User 1–N ActivityLog.
  - User 1–N Notification.
  - User 1–N NdaAcceptance.

## 7. Interface Requirements

- Web-based React UI with TailwindCSS.
- RESTful JSON API over HTTPS.
- Email provider integration for verification and notifications.

## 8. Traceability Matrix (Excerpt)

Requirements map to use cases and endpoints as outlined in the design, e.g. registration requirements map to `POST /auth/register` and `/auth/verify-email`, post management requirements map to `/posts` endpoints, and meeting workflow maps to `/meetings` endpoints.

