import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, X, Save } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { toast } from "sonner";
import { Card, PageHeader } from "@/components/page-shell";
import { Badge } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { ATTENDANCE_RECENT, ATTENDANCE_TREND } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/attendance")({
  head: () => ({ meta: [{ title: "Attendance — DeptDesk ERP" }] }),
  component: AttendancePage,
});

function AttendancePage() {
  const [rows, setRows] = useState(ATTENDANCE_RECENT);
  const present = rows.filter((r) => r.status === "Present").length;
  const pct = Math.round((present / rows.length) * 100);

  const toggle = (id: string) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status: r.status === "Present" ? "Absent" : "Present" } : r)));

  return (
    <div>
      <PageHeader
        title="Attendance"
        description="Mark and review class attendance."
        actions={
          <Button
            onClick={() => toast.success("Attendance saved successfully")}
            className="gap-2 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:brightness-110"
          >
            <Save className="h-4 w-4" /> Save Attendance
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Today</div>
          <div className="mt-2 text-3xl font-bold">{pct}%</div>
          <div className="mt-1 text-sm text-muted-foreground">{present} / {rows.length} present · CO5I · OS</div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-gradient-to-r from-primary to-primary-glow" style={{ width: `${pct}%` }} />
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <div className="mb-2 text-sm font-semibold text-foreground">8-week attendance</div>
          <div className="h-40">
            <ResponsiveContainer>
              <AreaChart data={ATTENDANCE_TREND}>
                <defs>
                  <linearGradient id="att2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="week" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} domain={[60, 100]} />
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
            <h3 className="font-semibold">Class CO5I · Operating Systems</h3>
            <p className="text-xs text-muted-foreground">25 June 2026 · Period 2</p>
          </div>
          <Badge tone="info">Lecture</Badge>
        </div>
        <ul className="divide-y divide-border">
          {rows.map((r) => {
            const present = r.status === "Present";
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
                    onClick={() => present || toggle(r.id)}
                    className={`grid h-9 w-9 place-items-center rounded-lg border transition-all ${
                      present ? "border-success bg-success text-success-foreground" : "border-border text-muted-foreground hover:border-success hover:text-success"
                    }`}
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => present && toggle(r.id)}
                    className={`grid h-9 w-9 place-items-center rounded-lg border transition-all ${
                      !present ? "border-destructive bg-destructive text-destructive-foreground" : "border-border text-muted-foreground hover:border-destructive hover:text-destructive"
                    }`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
