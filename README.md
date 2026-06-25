# DeptDesk ERP

**College Management System** for **Zeal Polytechnic** — a modern, responsive ERP frontend built with TanStack Start, React 19, and Tailwind CSS v4.

## Overview

DeptDesk is a complete department management interface covering students, faculty, attendance, timetables, results, notices, and more. The current build ships a polished frontend with mock data, designed to plug into a Django (or any REST) backend later.

## Tech Stack

- **Framework:** TanStack Start v1 (React 19, file-based routing, SSR-ready)
- **Build:** Vite 7
- **Styling:** Tailwind CSS v4 + shadcn/ui components
- **Charts:** Recharts
- **State / Auth:** React Context + `localStorage` (mock)
- **Language:** TypeScript (strict)

## Features

- Role-based access (Admin, Faculty, Student) with server-derived roles
- Dashboard with interactive attendance & enrollment charts
- Modules: Students, Faculty, Users, Departments, Subjects, Classes
- Academic tools: Attendance, Timetable, Results, Project Marks, Practical Manuals
- Notice board with pinning
- Searchable data tables, responsive sidebar, dark-mode-ready theming
- Light blue theme (`#2563EB` primary)

## Demo Credentials

| Role    | Email                    | Password      |
| ------- | ------------------------ | ------------- |
| Admin   | admin@zealpoly.edu       | admin@123     |
| Faculty | sneha@zealpoly.edu       | faculty@123   |
| Student | rohan@zealpoly.edu       | student@123   |

## Getting Started

```bash
bun install
bun dev
```

Open the preview URL printed by Vite (usually http://localhost:8080).

## Project Structure

```
src/
├── routes/              # File-based routes (TanStack Router)
│   ├── __root.tsx       # App shell
│   ├── auth.tsx         # Login page
│   └── _authenticated.* # Protected routes (dashboard, students, etc.)
├── components/          # App shell, sidebar, data table, page shell
│   └── ui/              # shadcn/ui primitives
├── lib/
│   ├── api/             # Django REST integration (axios + React Query)
│   │   ├── client.ts        # axios instance, JWT token storage + refresh
│   │   ├── types.ts         # TypeScript shapes mirroring DRF serializers
│   │   ├── services/        # Per-module REST clients (CRUD)
│   │   └── hooks/           # React Query hooks (useList/useCreate/...)
│   ├── auth.tsx         # Mock auth + role derivation (fallback)
│   └── mock-data.ts     # Seed data for all modules
└── styles.css           # Tailwind v4 theme tokens
```

## Backend Integration (Django REST Framework)

The frontend talks to a Django REST backend through `src/lib/api/`. Configure
the base URL in `.env`:

```
VITE_API_BASE_URL=http://localhost:8000/api
```

### Expected endpoints

The services assume conventional DRF `ModelViewSet` URLs:

| Module             | Endpoint                       |
| ------------------ | ------------------------------ |
| Auth (SimpleJWT)   | `POST /auth/login/`, `POST /auth/token/refresh/`, `POST /auth/logout/`, `GET /auth/me/` |
| Departments        | `/departments/`                |
| Classes            | `/classes/`                    |
| Subjects           | `/subjects/`                   |
| Students           | `/students/`                   |
| Faculty            | `/faculty/`                    |
| Users              | `/users/`                      |
| Practical Manuals  | `/practical-manuals/`          |
| Project Marks      | `/project-marks/`              |
| Notices            | `/notices/`                    |
| Results            | `/results/`                    |
| Attendance         | `/attendance/`, `/attendance/recent/`, `/attendance/trend/`, `/attendance/bulk/` |
| Timetable          | `/timetable/{class_id}/`       |
| Analytics          | `/analytics/dept-enrollment/`, `/analytics/overview/` |

Each resource supports `GET /` (list, with optional DRF pagination),
`POST /`, `GET /:id/`, `PATCH /:id/`, `PUT /:id/`, `DELETE /:id/`.

### Using the API in a component

```tsx
import { departmentsHooks } from "@/lib/api";

function Departments() {
  const { data: rows = [], isLoading } = departmentsHooks.useList();
  const create = departmentsHooks.useCreate();
  const update = departmentsHooks.useUpdate();
  const remove = departmentsHooks.useRemove();
  // ...render existing table, no UI changes required
}
```

JWT access + refresh tokens are stored in `localStorage` under
`deptdesk.access_token` / `deptdesk.refresh_token`. The axios interceptor
attaches `Authorization: Bearer <token>` automatically and transparently
refreshes on 401 via `/auth/token/refresh/`.

### Authentication

```ts
import { authService } from "@/lib/api";
await authService.login(email, password); // stores JWT + returns user
await authService.logout();
```

## Roadmap

- Replace remaining mock-data fallbacks once Django endpoints are live
- Add file uploads for practical manuals (multipart/form-data)
- Email notifications for notices
- Realtime updates via Django Channels / WebSockets

## License

Internal project — Zeal Polytechnic.

