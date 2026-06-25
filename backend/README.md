# DeptDesk ERP — Django Backend

Django 5 + DRF backend for the DeptDesk ERP frontend (Zeal Polytechnic).

## Apps

| App           | Resource(s)                          |
|---------------|--------------------------------------|
| `accounts`    | Custom `User`, JWT login, `/users/`  |
| `departments` | `/departments/`                      |
| `subjects`    | `/subjects/`                         |
| `faculty`     | `/faculty/`                          |
| `students`    | `/students/`                         |
| `attendance`  | `/attendance/` + bulk/recent/trend   |
| `results`     | `/results/`                          |
| `timetable`   | `/timetable/` + by-class actions     |
| `notices`     | `/notices/`                          |

## Quick start

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

python manage.py makemigrations accounts departments subjects faculty students attendance results timetable notices
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8000
```

Frontend env: `VITE_API_BASE_URL=http://localhost:8000/api`

## Auth

SimpleJWT — same endpoints the SPA's `authService` expects:

- `POST /api/auth/token/` — `{ username, password }` → `{ access, refresh }`
- `POST /api/auth/login/` — same + embedded `user` payload
- `POST /api/auth/token/refresh/` — `{ refresh }` → `{ access }`
- `GET  /api/auth/me/` — current user
- `POST /api/auth/change-password/`

All `/api/*` endpoints require `Authorization: Bearer <access>`. The
`accounts.User` model carries a `role` (`admin` | `faculty` | `student`)
derived server-side; clients cannot self-elevate.

## REST conventions

- `GET    /api/<resource>/` — paginated list (`?page=2&search=...&ordering=...`)
- `POST   /api/<resource>/` — create
- `GET    /api/<resource>/<id>/` — retrieve
- `PATCH  /api/<resource>/<id>/` — partial update
- `PUT    /api/<resource>/<id>/` — full update
- `DELETE /api/<resource>/<id>/` — destroy

Custom actions:

- `POST /api/students/bulk/` · `GET /api/students/stats/`
- `POST /api/attendance/bulk/` · `GET /api/attendance/recent/` · `GET /api/attendance/trend/`
- `GET /api/timetable/by-class/<class_code>/`
- `PUT /api/timetable/by-class/<class_code>/replace/`
