# DeptDesk ERP — Django Backend

Django REST Framework backend for the **Students** module of DeptDesk ERP.
Pairs with the existing frontend API client in `src/lib/api/`.

## Quick start

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8000
```

The frontend expects `VITE_API_BASE_URL=http://localhost:8000/api`.

## Endpoints

Auth (SimpleJWT):
- `POST /api/auth/token/` — `{ username, password }` → `{ access, refresh }`
- `POST /api/auth/token/refresh/` — `{ refresh }` → `{ access }`
- `POST /api/auth/token/verify/`

Students (`students.StudentViewSet`):

| Method | Path                       | Purpose                              |
|--------|----------------------------|--------------------------------------|
| GET    | `/api/students/`           | Paginated list (filter/search/order) |
| POST   | `/api/students/`           | Create one                           |
| GET    | `/api/students/{id}/`      | Retrieve                             |
| PATCH  | `/api/students/{id}/`      | Partial update                       |
| PUT    | `/api/students/{id}/`      | Full update                          |
| DELETE | `/api/students/{id}/`      | Destroy                              |
| POST   | `/api/students/bulk/`      | Bulk create (CSV import)             |
| GET    | `/api/students/stats/`     | Aggregate stats                      |

Query params: `?dept=Computer&year=TY&search=rohan&ordering=-cgpa&page=2`

## Field mapping

The model field `student_class` is exposed in the API as `class` to match
the frontend `Student.class` property.
