/**
 * TypeScript types mirroring the Django REST Framework serializers.
 * Keep in sync with the backend `serializers.py` definitions.
 */

export type Role = "admin" | "faculty" | "student";

export interface Department {
  id?: number;
  code: string;
  name: string;
  hod: string | null;
  hod_name?: string;
  established?: string | null;
  description?: string;
  faculty?: number;
  students?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ClassSection {
  id: string;
  name: string;
  dept: string;
  year: "FY" | "SY" | "TY" | string;
  students: number;
  mentor: string | null;
  mentor_name?: string;
}

export interface Subject {
  code: string;
  name: string;
  dept: string;
  sem: number;
  credits: number;
  type: "Theory" | "Practical" | "Project" | "Elective" | string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  class: string;
  dept: string;
  year: "FY" | "SY" | "TY" | string;
  cgpa: string | number;
  attendance: number;
}

export interface Faculty {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dept: string;
  designation: string;
  subjects: string[];
  experience: number;
  user?: number | null;
  username?: string;
  password?: string;
  has_login?: boolean;
}


export interface AppUser {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  role: Role | string;
  phone?: string;
  is_active: boolean;
  password?: string;
}

export interface AttendanceRecord {
  id?: number;
  student_id?: string;
  student?: string;
  name?: string;
  student_class?: string;
  subject: string;
  faculty?: string | null;
  date: string;
  status: "Present" | "Absent" | "Late" | "Leave" | string;
  remarks?: string;
  created_at?: string;
}

export interface AttendanceTrendPoint {
  week: string;
  present: number;
}

export interface ResultRow {
  id?: number;
  student: string;
  student_name?: string;
  subject: string;
  subject_name?: string;
  semester: number;
  internal: number | string;
  external: number | string;
  total?: number | string;
  grade: string;
  published: boolean;
}

export interface PracticalManual {
  id: string;
  title: string;
  subject: string;
  subject_name?: string;
  dept: string;
  sem: number;
  status: "Published" | "Draft" | "Review" | string;
  file?: string | null;
  file_url?: string | null;
  description?: string;
}

export interface ProjectMark {
  id: string;
  title: string;
  team: string;
  guide: string | null;
  guide_name?: string;
  internal: number;
  external: number;
  total?: number;
  status: "In Progress" | "Submitted" | "Evaluated" | string;
}

export interface TimetableEntry {
  id?: number;
  class_code: string;
  day: number;
  day_name?: string;
  start_time: string;
  end_time: string;
  subject: string | null;
  subject_name?: string;
  faculty: string | null;
  faculty_name?: string;
  room?: string;
  label?: string;
}

export interface Notice {
  id?: number;
  title: string;
  body: string;
  category: string;
  audience: string;
  department?: string | null;
  author?: number | null;
  author_name?: string;
  author_username?: string;
  pinned: boolean;
  date?: string;
  published_at?: string;
}

export interface OverviewStats {
  totals: { students: number; faculty: number; departments: number; subjects: number };
  attendance_today_pct: number;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    name?: string;
    role: Role;
    phone?: string;
  };
}
