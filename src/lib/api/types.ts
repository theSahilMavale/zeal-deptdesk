/**
 * TypeScript types mirroring the Django REST Framework serializers.
 * Keep in sync with the backend `serializers.py` definitions.
 */

export interface Department {
  id: string;
  name: string;
  hod: string;
  faculty: number;
  students: number;
}

export interface ClassSection {
  id: string;
  name: string;
  dept: string;
  year: string;
  students: number;
  mentor: string;
}

export interface Subject {
  code: string;
  name: string;
  dept: string;
  sem: number;
  credits: number;
  type: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  class: string;
  dept: string;
  year: string;
  cgpa: string | number;
  attendance: number;
}

export interface Faculty {
  id: string;
  name: string;
  email: string;
  dept: string;
  designation: string;
  subjects: string[];
  experience: number;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Faculty" | "Student" | string;
  status: "Active" | "Inactive" | string;
}

export interface AttendanceRecord {
  id?: string | number;
  student_id?: string;
  name?: string;
  class?: string;
  status: "Present" | "Absent" | string;
  date: string;
  subject: string;
}

export interface AttendanceTrendPoint {
  week: string;
  present: number;
}

export interface DeptEnrollmentPoint {
  name: string;
  students: number;
}

export interface ResultRow {
  id: string;
  name: string;
  class: string;
  os: number;
  se: number;
  ajp: number;
  total: number;
  grade: string;
}

export interface PracticalManual {
  id: string;
  subject: string;
  title: string;
  dept: string;
  sem: number;
  status: "Published" | "Draft" | "Review" | string;
}

export interface ProjectMark {
  id: string;
  team: string;
  title: string;
  guide: string;
  internal: number;
  external: number;
  status: string;
}

export interface TimetableRow {
  time: string;
  mon: string;
  tue: string;
  wed: string;
  thu: string;
  fri: string;
  sat: string;
}

export interface Notice {
  id: string;
  title: string;
  category: string;
  date: string;
  author: string;
  pinned: boolean;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "admin" | "faculty" | "student";
    department?: string;
  };
}
