# Conference Registration System

## Project Overview
ระบบลงทะเบียนงานประชุมวิชาการ สำหรับโรงพยาบาลในเขตสุขภาพ

## Tech Stack
- Next.js 14 (App Router) + TypeScript
- Prisma ORM + PostgreSQL
- Tailwind CSS + shadcn/ui
- NextAuth.js v5 (Auth.js)
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
```

## Database
- **Host**: localhost:5432
- **Database**: conference_2025
- **User**: postgres
- Use Prisma for all database operations
- Schema defined in `prisma/schema.prisma`

### Key Tables
| Table | Description |
|-------|-------------|
| members | ผู้ใช้งาน (ตัวแทนโรงพยาบาล + admin) |
| hospitals | ข้อมูลโรงพยาบาล |
| attendees | ผู้ลงทะเบียนเข้าร่วมประชุม |
| finances | การชำระเงิน |
| news | ข่าวสาร (Landing Page) |
| schedules | กำหนดการ (Landing Page) |
| hotels | ข้อมูลโรงแรม |

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
- NextAuth.js v5 (Auth.js)
- Credentials provider (email/password)
- Member types:
  - `99` = Admin
  - `1` = Hospital representative

## Docker
```bash
docker-compose up -d     # Start app container
docker-compose down      # Stop containers
docker-compose build     # Rebuild image
```

## Key Files Reference
| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database schema |
| `src/lib/prisma.ts` | Prisma client singleton |
| `src/lib/utils.ts` | Utility functions |
| `src/app/layout.tsx` | Root layout |
| `src/app/globals.css` | Global styles + CSS variables |
| `tailwind.config.ts` | Tailwind configuration |
| `components.json` | shadcn/ui configuration |

## Feature Flags
- Landing Page: Public access
- Portal: Requires login (hospital representative)
- Admin: Requires login (member_type = 99)

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
| Table | Status | Description |
|-------|--------|-------------|
| attendee | 1 | ค้างชำระเงิน |
| attendee | 2 | ชำระเงินแล้ว |
| finance | 1 | รอตรวจสอบ |
| finance | 2 | ผ่าน (ชำระเงินสำเร็จ) |
| finance | 3 | ไม่ผ่าน |
