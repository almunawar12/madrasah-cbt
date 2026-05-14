# skill.md

# Sistem Ujian Santri (CBT) — Fullstack Next.js

## Project Overview

Membangun aplikasi CBT (Computer Based Test) untuk santri berbasis web menggunakan:

- Next.js App Router
- TypeScript
- PostgreSQL
- Prisma ORM
- Auth.js / NextAuth
- TailwindCSS
- ShadCN UI
- Zustand
- TanStack Query
- Zod
- React Hot Toast

Aplikasi memiliki 4 role utama:

1. Super Admin
2. Guru
3. Pengawas
4. Santri

Sistem mendukung:

- Pilihan ganda
- Essay
- Campuran
- Monitoring realtime
- Auto grading
- Manual grading
- Anti cheat basic

---

# Development Rules

## Code Style

- Gunakan TypeScript strict mode
- Gunakan functional component
- Gunakan App Router
- Semua form wajib menggunakan:
  - React Hook Form
  - Zod Validation
- Gunakan async/await
- Hindari any
- Gunakan clean architecture
- Pisahkan UI dan business logic
- Gunakan server component jika memungkinkan
- Gunakan client component hanya bila perlu

---

# Folder Structure

```bash
src/
├── app/
├── components/
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   ├── templates/
│   └── layouts/
│
├── features/
│   ├── auth/
│   ├── users/
│   ├── classes/
│   ├── subjects/
│   ├── exams/
│   ├── questions/
│   ├── monitoring/
│   ├── grading/
│   ├── reports/
│   └── settings/
│
├── services/
├── hooks/
├── stores/
├── lib/
├── types/
├── validations/
├── constants/
├── prisma/
└── styles/
```

---

# Atomic Design Rules

## Atoms

Komponen kecil reusable.

Contoh:

- Button
- Input
- Badge
- Label
- Spinner

## Molecules

Gabungan beberapa atom.

Contoh:

- Search Field
- Password Input
- Form Field

## Organisms

Section besar.

Contoh:

- Sidebar
- Navbar
- Exam Panel
- Monitoring Table

## Templates

Layout halaman tanpa data.

## Layouts

Wrapper utama dashboard.

---

# Route Structure

```bash
app/
├── (auth)/
│   ├── login/
│   └── forgot-password/
│
├── (dashboard)/
│   ├── super-admin/
│   ├── guru/
│   ├── pengawas/
│   └── santri/
│
└── api/
```

---

# Authentication

Gunakan:

- Auth.js / NextAuth
- JWT Session Strategy

## Login Methods

- Email + password
- NIS + password

## Authorization

Gunakan RBAC middleware.

Role:

- SUPER_ADMIN
- GURU
- PENGAWAS
- SANTRI

---

# Database Rules

Gunakan PostgreSQL + Prisma.

## Naming Convention

- snake_case untuk database
- camelCase untuk TypeScript
- singular model name Prisma

---

# Prisma Schema Rules

- Semua tabel wajib memiliki:
  - id
  - createdAt
  - updatedAt

- Gunakan UUID untuk primary key

Contoh:

```prisma
id String @id @default(uuid())
```

---

# Main Features

# 1. Authentication

## Features

- Login
- Logout
- Session management
- Role based access
- Forgot password

---

# 2. User Management

## Super Admin

Dapat:

- CRUD user
- Reset password
- Import Excel
- Export Excel

## User Fields

### Santri

- nis
- fullName
- email
- classId
- status

### Guru

- fullName
- email
- phone

---

# 3. Class Management

## Features

- CRUD kelas
- Assign santri
- Tahun ajaran

---

# 4. Subject Management

## Features

- CRUD mapel
- Assign guru

---

# 5. Question Bank

## Question Types

### Multiple Choice

- question
- options
- correct answer
- score

### Essay

- question
- score

### Mixed

Gabungan PG dan Essay.

---

# Question Features

- Random question
- Random options
- Difficulty level
- Import Excel
- Upload image
- Clone question

---

# 6. Exam Management

## Features

- Create exam
- Set duration
- Set schedule
- Publish exam
- Generate token
- Shuffle questions
- Shuffle answers
- Auto submit

---

# 7. Exam Session

## Student Flow

1. Login
2. Input token
3. Start exam
4. Answer questions
5. Submit

---

# Exam Features

- Timer realtime
- Autosave answer
- Navigation question
- Mark question
- Progress indicator
- Fullscreen mode
- Warning anti cheat
- Auto submit

---

# 8. Monitoring

## Pengawas Features

- Monitor realtime peserta
- Lihat peserta online
- Lihat pelanggaran
- Force submit
- Block peserta

---

# Anti Cheat Features

Deteksi:

- Tab switching
- Copy paste
- Right click
- Multiple login

---

# 9. Grading

## Multiple Choice

Auto grading.

## Essay

Manual grading oleh guru.

---

# Features

- Publish score
- Ranking
- Export PDF
- Export Excel

---

# 10. Reports

## Reports

- Nilai per kelas
- Nilai per mapel
- Kehadiran ujian
- Pelanggaran

---

# State Management

Gunakan Zustand.

## Stores

```bash
stores/
├── auth.store.ts
├── exam.store.ts
└── monitoring.store.ts
```

---

# API Rules

Gunakan:

- Route Handlers
- Server Actions

## Response Format

```ts
{
  success: boolean
  message: string
  data?: unknown
}
```

---

# Validation Rules

Gunakan:

- Zod
- React Hook Form

Semua input wajib tervalidasi.

---

# Toast Notification Rules

Gunakan React Hot Toast untuk semua notifikasi.

## Setup

Tambahkan `<Toaster>` di root layout:

```tsx
import { Toaster } from 'react-hot-toast';

// di layout.tsx
<Toaster position="top-center" />
```

## Usage

```ts
import toast from 'react-hot-toast';

toast.success('Berhasil disimpan');
toast.error('Gagal menyimpan data');
toast.loading('Menyimpan...');
```

## Rules

- Posisi wajib `top-center`
- Gunakan untuk feedback aksi: create, update, delete, error
- Jangan gunakan alert() atau console untuk user feedback

---

# Design Reference Rules

Semua implementasi UI **wajib** mengikuti referensi design di folder `html/`.

## File Referensi

| File | Halaman |
|------|---------|
| `html/login.html` | Login page |
| `html/super-admin-dashboard.html` | Dashboard Super Admin |
| `html/teacher-dashboard.html` | Dashboard Guru |
| `html/exam-session.html` | Sesi ujian santri |
| `html/real-time-exam-session.html` | Monitoring realtime |
| `html/user-management.html` | Manajemen user |
| `html/quesstion-bank.html` | Bank soal |

## Rules

- Baca file HTML terkait sebelum implementasi halaman/komponen
- Ikuti layout, struktur, dan visual dari referensi HTML
- Terjemahkan ke komponen React dengan atomic design pattern
- Gunakan TailwindCSS + ShadCN UI, bukan CSS raw dari HTML
- Warna, spacing, dan tipografi harus konsisten dengan referensi

---

# UI/UX Rules

Gunakan:

- ShadCN UI
- TailwindCSS

## Theme

- Modern Islamic
- Clean dashboard
- Responsive
- Accessible

## Colors

Primary:

- Emerald / Green

Secondary:

- Slate

Accent:

- Gold

---

# Realtime Rules

Gunakan:

- Socket.io atau Pusher

Realtime digunakan untuk:

- Monitoring peserta
- Timer sync
- Live status

---

# Security Rules

Wajib implementasi:

- RBAC
- Rate limiting
- CSRF protection
- Input sanitization
- Password hashing
- Audit logs

---

# Performance Rules

Target:

- Support 1000 concurrent users
- Auto save < 2 detik
- Page load < 3 detik

---

# Feature Folder Example

```bash
features/exams/
├── components/
├── hooks/
├── services/
├── store/
├── validations/
├── types/
├── utils/
└── constants/
```

---

# Coding Rules

## Wajib

- Gunakan absolute import
- Gunakan reusable component
- Hindari duplicate code
- Pisahkan server dan client logic
- Gunakan loading state
- Gunakan error boundary
- Gunakan suspense jika perlu

---

# UI Components Priority

## Atoms

- button
- input
- textarea
- badge
- checkbox
- radio

## Molecules

- form-field
- password-field
- search-input

## Organisms

- sidebar
- navbar
- exam-panel
- monitoring-table

---

# Initial MVP

Prioritas pertama:

1. Authentication
2. Role management
3. CRUD user
4. CRUD soal
5. Create exam
6. Student exam session
7. Auto grading
8. Monitoring basic

---

# Future Features

## AI

- AI generate soal
- AI grading essay
- AI analytics

## Mobile App

- React Native

## Advanced Anti Cheat

- Face detection
- Browser lock
- Safe exam browser

---

# Deliverables

Claude Code harus menghasilkan:

- Prisma schema
- Authentication system
- Dashboard per role
- CRUD modules
- Reusable components
- Responsive UI
- RBAC middleware
- Exam engine
- Monitoring realtime
- Auto grading
- Report system

---

# Important Notes

- Fokus pada scalability
- Fokus pada reusable architecture
- Fokus pada clean code
- Fokus pada maintainability
- Hindari tight coupling
- Gunakan modular architecture
- Gunakan feature based pattern
- Gunakan atomic design
- Semua code production-ready

```

```
