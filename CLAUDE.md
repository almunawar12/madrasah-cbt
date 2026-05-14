@AGENTS.md

# CLAUDE.md

# AI Development Rules

# Sistem Ujian Santri (CBT)

Dokumen ini berisi aturan global pengembangan project yang harus diikuti oleh Claude Code saat melakukan implementasi.

---

# Tech Stack

Gunakan stack berikut:

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
- React Hook Form
- React Hot Toast

---

# Main Architecture

Gunakan kombinasi:

- Feature Based Architecture
- Atomic Design
- Service Layer Pattern
- Modular Architecture

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
├── validations/
├── constants/
├── types/
├── prisma/
└── styles/
```

---

# General Rules

## TypeScript

- Gunakan strict mode
- Hindari any
- Gunakan type inference jika memungkinkan
- Gunakan interface untuk object complex
- Gunakan type untuk union/intersection

---

# React Rules

## Components

- Gunakan functional component
- Gunakan named export jika memungkinkan
- Gunakan server component sebagai default
- Gunakan client component hanya jika dibutuhkan

---

# Hooks

- Prefix custom hooks dengan use
- Pisahkan business logic ke hooks
- Hindari hook terlalu besar

---

# Component Rules

## Atomic Design

### Atoms

Komponen kecil reusable.

Contoh:

- Button
- Input
- Badge
- Spinner

### Molecules

Gabungan atoms.

Contoh:

- Search input
- Form field
- Password field

### Organisms

Section besar.

Contoh:

- Sidebar
- Navbar
- Exam panel

### Templates

Struktur halaman tanpa data.

### Layouts

Wrapper dashboard/layout utama.

---

# File Naming Convention

Gunakan:

- kebab-case untuk file
- PascalCase untuk component
- camelCase untuk variable/function

Contoh:

```bash
exam-card.tsx
```

```ts
function calculateScore();
```

```tsx
export function ExamCard();
```

---

# Import Rules

Gunakan:

- absolute import
- alias @/

Contoh:

```ts
import { Button } from '@/components/atoms/button';
```

---

# Styling Rules

Gunakan:

- TailwindCSS
- ShadCN UI

## Jangan

- gunakan inline style
- gunakan CSS module kecuali benar-benar perlu

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

UI harus:

- responsive
- accessible
- clean
- modern
- scalable

---

# Theme Rules

## Primary Color

- Emerald / Green

## Secondary

- Slate

## Accent

- Gold

---

# Form Rules

Semua form wajib menggunakan:

- React Hook Form
- Zod validation

---

# Validation Rules

Semua input:

- wajib tervalidasi
- wajib sanitize input
- wajib tampilkan error message

---

# API Rules

Gunakan:

- Route Handlers
- Server Actions jika cocok

---

# API Response Standard

Gunakan format:

```ts
{
  success: boolean;
  message: string;
  data?: unknown;
}
```

---

# Database Rules

Gunakan:

- PostgreSQL
- Prisma ORM

---

# Prisma Rules

## Semua tabel wajib memiliki:

```prisma
id String @id @default(uuid())

createdAt DateTime @default(now())

updatedAt DateTime @updatedAt
```

---

# Database Naming Convention

Gunakan:

- snake_case untuk database
- singular model prisma

---

# State Management

Gunakan:

- Zustand

## Rules

- Pisahkan store berdasarkan feature
- Jangan buat global store terlalu besar

---

# Data Fetching

Gunakan:

- TanStack Query

## Rules

- Gunakan query key constants
- Gunakan optimistic update jika perlu
- Gunakan loading state

---

# Authentication Rules

Gunakan:

- Auth.js / NextAuth

## Session Strategy

- JWT

---

# Authorization Rules

Gunakan:

- RBAC middleware

Roles:

- SUPER_ADMIN
- GURU
- PENGAWAS
- SANTRI

---

# Security Rules

Wajib implementasi:

- Password hashing
- CSRF protection
- Rate limiting
- Input sanitization
- Secure session
- Audit logging

---

# Performance Rules

Target:

- page load < 3 detik
- autosave < 2 detik
- support 1000 concurrent users

---

# Error Handling Rules

## Wajib

- gunakan try/catch
- gunakan error boundary
- gunakan loading state
- gunakan empty state

---

# Logging Rules

Gunakan:

- structured logging

Log:

- authentication
- exam activity
- violations
- grading
- admin actions

---

# Realtime Rules

Gunakan:

- Socket.io atau Pusher

Realtime digunakan untuk:

- monitoring peserta
- timer sync
- live exam status
- warning notification

---

# Anti Cheat Rules

Implementasikan:

- tab switching detection
- fullscreen detection
- copy paste blocking
- right click blocking
- multiple login detection

---

# Accessibility Rules

Wajib:

- semantic HTML
- keyboard navigation
- aria labels
- color contrast

---

# Reusable Rules

## Reusable component wajib ditempatkan di:

```bash
components/
```

## Feature specific component wajib ditempatkan di:

```bash
features/{feature-name}/components/
```

---

# Service Layer Rules

Semua business logic:

- jangan ditaruh di component
- gunakan service layer

Contoh:

```bash
features/exams/services/
```

---

# Folder Rules

## Jangan

- membuat file terlalu besar
- mencampur UI dan logic
- mencampur server dan client logic

---

# Route Rules

Gunakan route grouping:

```bash
app/
├── (auth)
├── (dashboard)
└── api
```

---

# Dashboard Rules

Pisahkan dashboard berdasarkan role:

```bash
super-admin/
guru/
pengawas/
santri/
```

---

# Loading Rules

Semua async page wajib memiliki:

- loading state
- skeleton
- fallback UI

---

# Testing Rules

Direkomendasikan:

- Vitest
- React Testing Library

---

# Git Rules

Gunakan conventional commits.

Contoh:

```bash
feat: add exam timer
fix: resolve autosave issue
refactor: improve auth middleware
```

---

# Clean Code Rules

Wajib:

- small functions
- reusable logic
- readable naming
- avoid duplicate code
- separation of concerns

---

# Scalability Rules

Arsitektur harus:

- modular
- scalable
- maintainable
- reusable

---

# Important Notes

Claude Code harus:

- menghasilkan production-ready code
- mengutamakan maintainability
- mengutamakan scalability
- menghindari tight coupling
- mengikuti atomic design
- mengikuti feature based architecture
- mengikuti clean architecture principles

---

# Reference Documents

Claude Code harus menggunakan:

- docs/skills.md
- docs/database.md
- docs/api.md
- docs/architecture.md

Sebagai referensi implementasi fitur dan business rules.
