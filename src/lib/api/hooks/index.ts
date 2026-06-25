import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCrudHooks } from "./factory";
import {
  attendanceService,
  analyticsService,
  classesService,
  departmentsService,
  facultyService,
  noticesService,
  practicalsService,
  projectMarksService,
  resultsService,
  studentsService,
  subjectsService,
  timetableService,
  usersService,
} from "../services";
import type {
  AttendanceRecord,
  ClassSection,
  Department,
  Faculty,
  Notice,
  PracticalManual,
  ProjectMark,
  ResultRow,
  Student,
  Subject,
  TimetableEntry,
  AppUser,
} from "../types";

export const departmentsHooks = createCrudHooks<Department, string>("departments", departmentsService);
export const classesHooks = createCrudHooks<ClassSection, string>("classes", classesService);
export const subjectsHooks = createCrudHooks<Subject, string>("subjects", subjectsService);
export const studentsHooks = createCrudHooks<Student, string>("students", studentsService);
export const facultyHooks = createCrudHooks<Faculty, string>("faculty", facultyService);
export const usersHooks = createCrudHooks<AppUser, number>("users", usersService);
export const practicalsHooks = createCrudHooks<PracticalManual, string>("practical-manuals", practicalsService);
export const projectMarksHooks = createCrudHooks<ProjectMark, string>("project-marks", projectMarksService);
export const noticesHooks = createCrudHooks<Notice, number>("notices", noticesService);
export const resultsHooks = createCrudHooks<ResultRow, number>("results", resultsService);
export const attendanceHooks = createCrudHooks<AttendanceRecord, number>("attendance", attendanceService);

/* ----------------------------- Analytics ----------------------------- */

export function useAttendanceRecent(params?: { date?: string; subject?: string; class?: string }) {
  return useQuery({
    queryKey: ["attendance", "recent", params ?? {}],
    queryFn: () => attendanceService.recent(params),
  });
}

export function useAttendanceTrend(params?: { weeks?: number; dept?: string }) {
  return useQuery({
    queryKey: ["attendance", "trend", params ?? {}],
    queryFn: () => attendanceService.trend(params),
  });
}

export function useOverview() {
  return useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: () => analyticsService.overview(),
  });
}

/* ----------------------------- Timetable ----------------------------- */

export function useTimetable(classCode: string | undefined) {
  return useQuery({
    queryKey: ["timetable", "by-class", classCode],
    queryFn: () => timetableService.forClass(classCode as string),
    enabled: !!classCode,
  });
}

export function useReplaceTimetable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ classCode, rows }: { classCode: string; rows: Partial<TimetableEntry>[] }) =>
      timetableService.replaceClass(classCode, rows),
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: ["timetable", "by-class", vars.classCode] }),
  });
}

/* ----------------------------- Attendance ----------------------------- */

export function useMarkAttendanceBulk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (records: Partial<AttendanceRecord>[]) => attendanceService.markBulk(records),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance"] }),
  });
}
