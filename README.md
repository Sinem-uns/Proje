## HEALTH AI Co-Creation Platform

Bu proje, mühendisler ve sağlık profesyonelleri arasında **güven temelli, GDPR uyumlu** bir eşleştirme (partner discovery) ve ilk temas platformudur.

- **Yalnızca .edu kurumsal e-posta** ile kayıt
- **Teknik doküman / hasta verisi / tıbbi tavsiye saklanmaz**
- Amaç: Sadece **ilk temas** ve **toplantı planlama** (Zoom/Teams platform dışında)

### Ana Teknolojiler

- Frontend: React + TypeScript
- Backend: Node.js (Express) + TypeScript
- Veritabanı: PostgreSQL (ORM: Prisma)

### Çalıştırma (özet)

Projeyi çalıştırmanın en kolay yolu **Docker** kullanmaktır. Ana dizinde `docker-compose up --build -d` komutunu çalıştırarak tüm servisleri (veritabanı, backend ve frontend) otomatik başlatabilirsiniz. Uygulama [http://localhost:5173](http://localhost:5173) adresinde yayına girecektir.

HEALTH AI – Co-Creation & Innovation Platform
=============================================

This project is an academic full-stack web application that enables structured collaboration between healthcare professionals and engineers. It allows users to publish collaboration posts and request first-contact meetings, without storing any medical documents or patient data.

## Stack

- Frontend: React, TypeScript, TailwindCSS
- Backend: Node.js, Express.js, TypeScript
- Auth: JWT
- Database: PostgreSQL
- ORM: Prisma

## Structure

- `frontend/` – React SPA with routing and pages (Landing, Register, Login, Dashboard, Create Post, Post Detail, Search Results, Meeting Request, Profile, Admin Panel).
- `backend/` – Express API with layered architecture (controllers, services, repositories, Prisma).
- `database/` – Database-specific assets such as seed script and migrations.
- `docs/` – SRS, SDD, API, and DB documentation.

## Getting Started

### Using Docker (Recommended)

The easiest way to run the project is using Docker. It will automatically set up the database, backend, and frontend.

1. Make sure you have [Docker](https://www.docker.com/products/docker-desktop/) installed and running.
2. In the project root directory, run the following command to start all services:

```bash
docker-compose up --build -d
```

3. Once all services are running, you can access the application:
   - **Frontend:** [http://localhost:5173](http://localhost:5173)
   - **Backend API:** [http://localhost:5000](http://localhost:5000)

*Note: The database migrations and seeding are handled automatically by the Docker setup.*

### Manual Setup (Without Docker)

If you prefer to run the project manually:

1. Install dependencies:
   - In `frontend/`: `npm install`
   - In `backend/`: `npm install`
2. Configure environment variables in `backend/.env` (database URL, JWT secrets, email provider). Ensure you have a running PostgreSQL instance.
3. Run Prisma migrations and seed:
   - In `backend/`: `npx prisma migrate dev`
   - In project root or `database/`: `npm run seed` (see `database/seed.ts`).
4. Start backend:
   - In `backend/`: `npm run dev`
5. Start frontend:
   - In `frontend/`: `npm run dev`

The application is designed to be deployed with:

- Frontend on Vercel
- Backend on Render or Railway
- Database on Supabase or Neon

