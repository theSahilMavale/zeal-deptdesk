import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Printer } from "lucide-react";
import { Card, PageHeader } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/data-table";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { classesHooks, useTimetable } from "@/lib/api";
import type { ClassSection, TimetableEntry } from "@/lib/api/types";

export const Route = createFileRoute("/_authenticated/timetable")({
  head: () => ({ meta: [{ title: "Timetable — DeptDesk ERP" }] }),
  component: TimetablePage,
});

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function cellTone(label: string) {
  if (!label || label === "—") return "bg-muted/40 text-muted-foreground";
  if (label.toLowerCase().includes("lab")) return "bg-primary text-primary-foreground shadow-sm";
  if (["Sport", "Library", "Project", "Recess", "Break"].some((k) => label.includes(k)))
    return "bg-accent text-accent-foreground";
  return "bg-primary/10 text-primary";
}

function TimetablePage() {
  const { data: classes = [] } = classesHooks.useList();
  const [classCode, setClassCode] = useState<string>("");

  useEffect(() => {
    if (!classCode && (classes as ClassSection[]).length) setClassCode((classes as ClassSection[])[0].id);
  }, [classes, classCode]);

  const { data: entries = [], isLoading } = useTimetable(classCode || undefined);

  // Build a time × day grid from the entries.
  const grid = useMemo(() => {
    const slots = new Map<string, Record<number, TimetableEntry | undefined>>();
    (entries as TimetableEntry[]).forEach((e) => {
      const key = `${e.start_time.slice(0, 5)} - ${e.end_time.slice(0, 5)}`;
      const row = slots.get(key) ?? {};
      row[e.day] = e;
      slots.set(key, row);
    });
    return Array.from(slots.entries()).sort(([a], [b]) => (a < b ? -1 : 1));
  }, [entries]);

  return (
    <div>
      <PageHeader
        title="Timetable"
        description={classCode ? `Weekly schedule — ${classCode}` : "Weekly schedule"}
        actions={
          <>
            <Button variant="outline" className="gap-2"><Calendar className="h-4 w-4" /> This Week</Button>
            <Button
              onClick={() => window.print()}
              className="gap-2 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:brightness-110"
            >
              <Printer className="h-4 w-4" /> Print
            </Button>
          </>
        }
      />

      <Card className="mb-6">
        <div className="grid gap-3 sm:max-w-sm">
          <Label>Class</Label>
          <Select value={classCode} onValueChange={setClassCode}>
            <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
            <SelectContent>
              {(classes as ClassSection[]).map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.id} — {c.dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="!p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 text-left">Time</th>
                {DAY_LABELS.map((d) => (
                  <th key={d} className="px-4 py-3 text-left">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">Loading…</td></tr>
              ) : grid.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">No timetable entries for this class.</td></tr>
              ) : (
                grid.map(([slot, row]) => (
                  <tr key={slot} className="border-b border-border/60 last:border-0">
                    <td className="whitespace-nowrap px-4 py-3 text-xs font-medium text-muted-foreground">{slot}</td>
                    {[1, 2, 3, 4, 5, 6].map((d) => {
                      const e = row[d];
                      const label = e?.label || e?.subject_name || e?.subject || "—";
                      const sub = e?.room || e?.faculty_name || "";
                      return (
                        <td key={d} className="px-2 py-2">
                          <div className={`rounded-lg px-3 py-2.5 text-xs font-semibold ${cellTone(label)}`}>
                            <div>{label}</div>
                            {sub && <div className="mt-0.5 text-[10px] font-normal opacity-80">{sub}</div>}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
        <Badge tone="info">Lecture</Badge>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">Lab</span>
        <Badge>Activity</Badge>
      </div>
    </div>
  );
}
