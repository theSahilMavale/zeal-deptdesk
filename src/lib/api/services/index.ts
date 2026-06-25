import { apiClient } from "../client";
import { createCrudService } from "./crud";
import type {
  Department,
  ClassSection,
  Subject,
  Student,
  Faculty,
  AppUser,
  AttendanceRecord,
  AttendanceTrendPoint,
  DeptEnrollmentPoint,
  ResultRow,
  PracticalManual,
  ProjectMark,
  TimetableRow,
  Notice,
} from "../types";

/**
 * Per-module services. Each is a full CRUD client against the convention
 *   /api/{resource}/
 * on the Django backend. Extend with custom endpoints as needed.
 */

export const departmentsService = createCrudService<Department>("departments");
export const classesService = createCrudService<ClassSection>("classes");
export const subjectsService = {
  ...createCrudService<Subject>("subjects"),
};
export const studentsService = createCrudService<Student>("students");
export const facultyService = createCrudService<Faculty>("faculty");
export const usersService = createCrudService<AppUser>("users");
export const practicalsService = createCrudService<PracticalManual>("practical-manuals");
export const projectMarksService = createCrudService<ProjectMark>("project-marks");
export const noticesService = createCrudService<Notice>("notices");
export const resultsService = createCrudService<ResultRow>("results");

/** Attendance has both list/CRUD and analytics endpoints. */
export const attendanceService = {
  ...createCrudService<AttendanceRecord, string | number>("attendance"),

  async recent(params?: { date?: string; subject?: string; class?: string }) {
    const { data } = await apiClient.get<AttendanceRecord[]>("/attendance/recent/", { params });
    return data;
  },

  async trend(params?: { weeks?: number; dept?: string }) {
    const { data } = await apiClient.get<AttendanceTrendPoint[]>("/attendance/trend/", { params });
    return data;
  },

  async markBulk(records: AttendanceRecord[]) {
    const { data } = await apiClient.post<AttendanceRecord[]>("/attendance/bulk/", { records });
    return data;
  },
};

/** Timetable is typically read-only per class; expose a class-scoped fetch. */
export const timetableService = {
  async forClass(classId: string) {
    const { data } = await apiClient.get<TimetableRow[]>(`/timetable/${classId}/`);
    return data;
  },
  async update(classId: string, rows: TimetableRow[]) {
    const { data } = await apiClient.put<TimetableRow[]>(`/timetable/${classId}/`, { rows });
    return data;
  },
};

/** Aggregated analytics shown on the dashboard. */
export const analyticsService = {
  async deptEnrollment() {
    const { data } = await apiClient.get<DeptEnrollmentPoint[]>("/analytics/dept-enrollment/");
    return data;
  },
  async overview() {
    const { data } = await apiClient.get<{
      totals: { students: number; faculty: number; classes: number; departments: number };
      attendance_today_pct: number;
    }>("/analytics/overview/");
    return data;
  },
};
