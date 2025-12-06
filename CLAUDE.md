# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ระบบลงทะเบียนงานประชุมวิชาการ สำหรับโรงพยาบาล (Conference Registration System for Hospitals)

## Tech Stack

- Next.js 14 (App Router) + TypeScript
- Prisma ORM + PostgreSQL
- Tailwind CSS + shadcn/ui
- NextAuth.js v5 (Auth.js) with JWT sessions
- Recharts (for dashboard charts)
- Docker

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (public)/          # Public pages (Landing)
│   ├── (auth)/            # Auth pages (Login)
│   ├── (portal)/          # Hospital portal (protected)
│   ├── (admin)/           # Admin portal (protected)
│   └── api/               # API routes
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── landing/           # Landing page components
│   ├── portal/            # Portal components
│   └── shared/            # Shared components
├── lib/
│   ├── prisma.ts          # Prisma client singleton
│   ├── auth.ts            # NextAuth configuration
│   └── utils.ts           # Utility functions (cn, etc.)
└── types/                 # TypeScript types
```

## Commands

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run migrations
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed initial data
```

### PM2 Production Deployment

Production runs on port 3002 (configured in `ecosystem.config.js`).

```bash
npm run pm2:start    # Start with PM2
npm run pm2:stop     # Stop PM2 process
npm run pm2:restart  # Restart PM2 process
npm run pm2:logs     # View logs
npm run pm2:status   # Check status
```

Note: Build uses `output: "standalone"` mode. Always run `npm run build` before `pm2:start`.

## Database

- **Host**: localhost:5432
- **Database**: conference_2025
- **User**: postgres
- Use Prisma for all database operations
- Schema defined in `prisma/schema.prisma`

### Key Tables

| Table     | Description                         |
| --------- | ----------------------------------- |
| members   | ผู้ใช้งาน (ตัวแทนโรงพยาบาล + admin) |
| hospitals | ข้อมูลโรงพยาบาล                     |
| attendees | ผู้ลงทะเบียนเข้าร่วมประชุม          |
| finances  | การชำระเงิน                         |
| news      | ข่าวสาร (Landing Page)              |
| schedules | กำหนดการ (Landing Page)             |
| hotels    | ข้อมูลโรงแรม                        |

## Coding Conventions

### Language

- **UI Text**: Thai (ภาษาไทย)
- **Code**: English (variables, functions, comments)

### Components

- Use Server Components by default
- Add `"use client"` only when needed (interactivity, hooks)
- Follow shadcn/ui patterns
- Use `cn()` for className merging

### File Naming

- Components: PascalCase (`Navbar.tsx`, `NewsCard.tsx`)
- Utilities: camelCase (`utils.ts`, `prisma.ts`)
- Routes: kebab-case folders (`/api/auth/login`)

### Styling

- Use Tailwind CSS classes
- CSS variables defined in `globals.css`
- Responsive: mobile-first approach

### API Routes

- Use proper HTTP methods
- Validate input with Zod (if needed)
- Return JSON with appropriate status codes
- Handle errors gracefully

## Authentication

- NextAuth.js v5 (Auth.js) with Credentials provider
- Session extended with custom fields: `memberType`, `hospitalCode` (see `src/types/next-auth.d.ts`)
- Password hashing: MD5 (legacy format)
- Member types:
  - `99` = Admin (full access)
  - `1` = Hospital representative (hospital-scoped access)

### Route Protection (Middleware)

- `/portal/*` - requires login
- `/admin/*` - requires login + memberType=99
- `/login` - redirects to `/portal/dashboard` if already logged in

## Docker

```bash
docker-compose up -d     # Start app container
docker-compose down      # Stop containers
docker-compose build     # Rebuild image
```

## Key Files

- `prisma/schema.prisma` - Database schema (source of truth for data model)
- `src/middleware.ts` - Route protection logic
- `src/lib/auth.ts` - NextAuth configuration
- `src/types/next-auth.d.ts` - Extended session/user types

## API Routes

- `/api/auth/*` - NextAuth handlers
- `/api/attendees` - CRUD for registration entries
- `/api/payment` - Payment submission (file upload)
- `/api/master` - Master data (hospitals, levels, positions)
- `/api/admin/*` - Admin-only endpoints (news, schedule, payments, slideshow)
- `/api/reports/export` - Export reports
- `/api/settings/*` - Admin settings (config, footer, payment settings, master data CRUD)
  - `/api/settings/members` - Member/user management (CRUD, import/export, password reset)
  - `/api/settings/hospitals` - Hospital master data
  - `/api/settings/hotels` - Hotel master data
  - `/api/settings/airlines` - Airline master data
  - `/api/settings/zones` - Zone master data

## Application Workflow

### Hospital Representative (member_type = 1)

1. **ล็อกอิน** - เข้าสู่ระบบด้วยบัญชีตัวแทนโรงพยาบาล
2. **ลงทะเบียนเข้าร่วมประชุม** (`/portal/register`) - สร้างรายการใน attendee ให้เจ้าหน้าที่โรงพยาบาลที่จะเข้าร่วมประชุม
3. **ตรวจสอบการลงทะเบียน** (`/portal/registration`) - ดู/แก้ไขข้อมูลผู้ลงทะเบียน
4. **แจ้งชำระเงิน** (`/portal/payment`) - อัปโหลดหลักฐานการโอนเงิน (ไฟล์ภาพ) พร้อมแจ้ง admin

### Admin (member_type = 99)

5. **ตรวจสอบชำระเงิน** (`/portal/payment-status`) - ตรวจสอบหลักฐานการโอนเงิน กดยืนยันเมื่อถูกต้อง
6. **แดชบอร์ด** (`/portal/stats`) - ดูสถิติผู้ลงทะเบียนเข้าร่วมประชุม
7. **รายงาน** (`/portal/reports`) - ดู/ส่งออกรายงานการเข้าประชุม

### Data Flow

```
attendee (สร้างโดย hospital rep)
    ↓
finance (สร้างเมื่อแจ้งชำระเงิน)
    ↓
admin ตรวจสอบ → อัพเดท status
```

### Status Codes

| Table    | Status | Description           |
| -------- | ------ | --------------------- |
| attendee | 1      | ค้างชำระเงิน          |
| attendee | 2      | รอตรวจสอบ             |
| attendee | 3      | ยกเลิก                |
| attendee | 9      | ชำระแล้ว              |
| finance  | 1      | รอตรวจสอบ             |
| finance  | 2      | ผ่าน (ชำระเงินสำเร็จ) |
| finance  | 9      | ไม่ผ่าน               |

### Data Mappings

**foodType (ประเภทอาหาร)**
| Code | Label |
|------|-------|
| 1 | อาหารทั่วไป |
| 2 | อาหารอิสลาม |
| 3 | อาหารมังสวิรัติ |
| 4 | อาหารเจ |

**vehicleType (ประเภทการเดินทาง)**
| Code | Label |
|------|-------|
| 1 | เครื่องบิน |
| 2 | รถโดยสาร |
| 3 | รถยนต์ส่วนตัว/ราชการ |
| 4 | รถไฟ |

**busToMeet (รถรับ-ส่งไปประชุม)**
| Code | Label |
|------|-------|
| 1 | ต้องการ |
| 2 | ไม่ต้องการ |
