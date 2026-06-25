import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, X, Save } from "lucide-react";
import { toast } from "sonner";
import { Card, PageHeader } from "@/components/page-shell";
import { Badge } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  studentsHooks, subjectsHooks, classesHooks, useMarkAttendanceBulk, useAttendanceTrend,
} from "@/lib/api";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import type { Student, Subject, ClassSection } from "@/lib/api/types";

export const Route = createFileRoute("/_authenticated/attendance")({
  head: () => ({ meta: [{ title: "Attendance — DeptDesk ERP" }] }),
  component: AttendancePage,
});

type Status = "Present" | "Absent";

function AttendancePage() {
  const { data: classes = [] } = classesHooks.useList();
  const { data: subjects = [] } = subjectsHooks.useList();
  const { data: trend = [] } = useAttendanceTrend({ weeks: 8 });

  const [classCode, setClassCode] = useState<string>("");
  const [subjectCode, setSubjectCode] = useState<string>("");
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (!classCode && (classes as ClassSection[]).length) setClassCode((classes as ClassSection[])[0].id);
  }, [classes, classCode]);
  useEffect(() => {
    if (!subjectCode && (subjects as Subject[]).length) setSubjectCode((subjects as Subject[])[0].code);
  }, [subjects, subjectCode]);

  const { data: students = [], isLoading } = studentsHooks.useList(
    classCode ? { student_class: classCode } : undefined,
  );

  const [marks, setMarks] = useState<Record<string, Status>>({});
  useEffect(() => {
    // Default everyone Present whenever class changes.
    const next: Record<string, Status> = {};
    (students as Student[]).forEach((s) => { next[s.id] = "Present"; });
    setMarks(next);
  }, [students, classCode]);

  const total = (students as Student[]).length;
  const present = useMemo(
    () => Object.values(marks).filter((v) => v === "Present").length,
    [marks],
  );
  const pct = total ? Math.round((present / total) * 100) : 0;

  const toggle = (id: string, next: Status) => setMarks((m) => ({ ...m, [id]: next }));

  const bulk = useMarkAttendanceBulk();

  const onSave = async () => {
    if (!classCode || !subjectCode) {
      toast.error("Select a class and subject.");
      return;
    }
    if (total === 0) {
      toast.error("No students in this class.");
      return;
    }
    const payload = (students as Student[]).map((s) => ({
      student_id: s.id,
      subject: subjectCode,
      date,
      status: marks[s.id] ?? "Present",
    }));
    try {
      await bulk.mutateAsync(payload);
      toast.success(`Saved attendance for ${total} students`);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to save attendance.");
    }
  };

  return (
    <div>
      <PageHeader
        title="Attendance"
        description="Mark and review class attendance."
        actions={
          <Button
            onClick={onSave}
            disabled={bulk.isPending}
            className="gap-2 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:brightness-110"
          >
            <Save className="h-4 w-4" /> {bulk.isPending ? "Saving…" : "Save Attendance"}
          </Button>
        }
      />

      <Card className="mb-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label>Class</Label>
            <Select value={classCode} onValueChange={setClassCode}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select class" /></SelectTrigger>
              <SelectContent>
                {(classes as ClassSection[]).map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.id} — {c.dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Subject</Label>
            <Select value={subjectCode} onValueChange={setSubjectCode}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select subject" /></SelectTrigger>
              <SelectContent>
                {(subjects as Subject[]).map((s) => (
                  <SelectItem key={s.code} value={s.code}>{s.code} — {s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1.5" />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Session</div>
          <div className="mt-2 text-3xl font-bold">{pct}%</div>
          <div className="mt-1 text-sm text-muted-foreground">{present} / {total} present</div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-gradient-to-r from-primary to-primary-glow" style={{ width: `${pct}%` }} />
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <div className="mb-2 text-sm font-semibold text-foreground">Recent attendance trend</div>
          <div className="h-40">
            <ResponsiveContainer>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="att2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="week" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="present" stroke="var(--primary)" strokeWidth={2.5} fill="url(#att2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="mt-6 !p-0">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <h3 className="font-semibold">{classCode || "—"} · {subjectCode || "—"}</h3>
            <p className="text-xs text-muted-foreground">{date}</p>
          </div>
          <Badge tone="info">Lecture</Badge>
        </div>

        {isLoading ? (
          <div className="py-10 text-center text-sm text-muted-foreground">Loading roster…</div>
        ) : total === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">No students enrolled in this class.</div>
        ) : (
          <ul className="divide-y divide-border">
            {(students as Student[]).map((r) => {
              const status = marks[r.id] ?? "Present";
              const isPresent = status === "Present";
              return (
                <li key={r.id} className="flex items-center gap-4 px-4 py-3">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {r.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{r.id} · {r.class}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggle(r.id, "Present")}
                      className={`grid h-9 w-9 place-items-center rounded-lg border transition-all ${
                        isPresent ? "border-success bg-success text-success-foreground" : "border-border text-muted-foreground hover:border-success hover:text-success"
                      }`}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggle(r.id, "Absent")}
                      className={`grid h-9 w-9 place-items-center rounded-lg border transition-all ${
                        !isPresent ? "border-destructive bg-destructive text-destructive-foreground" : "border-border text-muted-foreground hover:border-destructive hover:text-destructive"
                      }`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
