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
  ResultRow,
  PracticalManual,
  ProjectMark,
  TimetableEntry,
  Notice,
  OverviewStats,
} from "../types";

/**
 * Per-module services. Each is a full CRUD client against the convention
 *   /api/{resource}/
 * on the Django backend.
 */

// Departments are looked up by their `code` (string).
export const departmentsService = createCrudService<Department, string>("departments");
export const classesService = createCrudService<ClassSection, string>("classes");
export const subjectsService = createCrudService<Subject, string>("subjects");
export const studentsService = createCrudService<Student, string>("students");
export const facultyService = createCrudService<Faculty, string>("faculty");
export const usersService = createCrudService<AppUser, number>("users");
export const practicalsService = createCrudService<PracticalManual, string>("practical-manuals");
export const projectMarksService = createCrudService<ProjectMark, string>("project-marks");
export const noticesService = createCrudService<Notice, number>("notices");
export const resultsService = createCrudService<ResultRow, number>("results");

/** Attendance: CRUD + analytics. */
export const attendanceService = {
  ...createCrudService<AttendanceRecord, number>("attendance"),

  async recent(params?: { date?: string; subject?: string; class?: string }) {
    const { data } = await apiClient.get<AttendanceRecord[]>("/attendance/recent/", { params });
    return data;
  },

  async trend(params?: { weeks?: number; dept?: string }) {
    const { data } = await apiClient.get<AttendanceTrendPoint[]>("/attendance/trend/", { params });
    return data;
  },

  async markBulk(records: Partial<AttendanceRecord>[]) {
    const { data } = await apiClient.post<AttendanceRecord[]>("/attendance/bulk/", records);
    return data;
  },
};

/** Timetable: CRUD + class-scoped helpers. */
export const timetableService = {
  ...createCrudService<TimetableEntry, number>("timetable"),

  async forClass(classCode: string) {
    const { data } = await apiClient.get<TimetableEntry[]>(`/timetable/by-class/${classCode}/`);
    return data;
  },

  async replaceClass(classCode: string, rows: Partial<TimetableEntry>[]) {
    const { data } = await apiClient.put<TimetableEntry[]>(
      `/timetable/by-class/${classCode}/replace/`,
      { rows },
    );
    return data;
  },
};

/** Practical manuals: extra helper for multipart uploads. */
export const practicalManualsService = {
  ...practicalsService,

  async createWithFile(payload: Record<string, any>, file?: File | null) {
    const form = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (v !== undefined && v !== null) form.append(k, String(v));
    });
    if (file) form.append("file", file);
    const { data } = await apiClient.post<PracticalManual>("/practical-manuals/", form);
    return data;
  },

  async updateWithFile(id: string, payload: Record<string, any>, file?: File | null) {
    const form = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (v !== undefined && v !== null) form.append(k, String(v));
    });
    if (file) form.append("file", file);
    const { data } = await apiClient.patch<PracticalManual>(`/practical-manuals/${id}/`, form);
    return data;
  },
};

/** Aggregated analytics shown on the dashboard. */
export const analyticsService = {
  async overview(): Promise<OverviewStats> {
    const { data } = await apiClient.get<OverviewStats>("/analytics/overview/");
    return data;
  },
};
