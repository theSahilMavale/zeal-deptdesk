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
  TimetableRow,
  AppUser,
} from "../types";

export const departmentsHooks = createCrudHooks<Department>("departments", departmentsService);
export const classesHooks = createCrudHooks<ClassSection>("classes", classesService);
export const subjectsHooks = createCrudHooks<Subject>("subjects", subjectsService);
export const studentsHooks = createCrudHooks<Student>("students", studentsService);
export const facultyHooks = createCrudHooks<Faculty>("faculty", facultyService);
export const usersHooks = createCrudHooks<AppUser>("users", usersService);
export const practicalsHooks = createCrudHooks<PracticalManual>("practical-manuals", practicalsService);
export const projectMarksHooks = createCrudHooks<ProjectMark>("project-marks", projectMarksService);
export const noticesHooks = createCrudHooks<Notice>("notices", noticesService);
export const resultsHooks = createCrudHooks<ResultRow>("results", resultsService);
export const attendanceHooks = createCrudHooks<AttendanceRecord, string | number>(
  "attendance",
  attendanceService,
);

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

export function useDeptEnrollment() {
  return useQuery({
    queryKey: ["analytics", "dept-enrollment"],
    queryFn: () => analyticsService.deptEnrollment(),
  });
}

export function useOverview() {
  return useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: () => analyticsService.overview(),
  });
}

/* ----------------------------- Timetable ----------------------------- */

export function useTimetable(classId: string | undefined) {
  return useQuery({
    queryKey: ["timetable", classId],
    queryFn: () => timetableService.forClass(classId as string),
    enabled: !!classId,
  });
}

export function useUpdateTimetable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ classId, rows }: { classId: string; rows: TimetableRow[] }) =>
      timetableService.update(classId, rows),
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: ["timetable", vars.classId] }),
  });
}

/* ----------------------------- Attendance ----------------------------- */

export function useMarkAttendanceBulk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (records: AttendanceRecord[]) => attendanceService.markBulk(records),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance"] }),
  });
}
