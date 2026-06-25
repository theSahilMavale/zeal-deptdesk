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
│   ├── auth.tsx         # Mock auth + role derivation
│   └── mock-data.ts     # Seed data for all modules
└── styles.css           # Tailwind v4 theme tokens
```

## Roadmap

- Replace mock auth with Django REST + JWT
- Wire data tables to live API endpoints
- Add file uploads for practical manuals
- Email notifications for notices

## License

Internal project — Zeal Polytechnic.
