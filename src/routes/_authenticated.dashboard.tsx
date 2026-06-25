import { createFileRoute } from "@tanstack/react-router";
import {
  Users as UsersIcon, GraduationCap, Building2, BookOpen, TrendingUp, Calendar, Megaphone, Activity,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { useAuth } from "@/lib/auth";
import { Card, PageHeader } from "@/components/page-shell";
import { Badge } from "@/components/data-table";
import {
  DEPARTMENTS, STUDENTS, FACULTY, SUBJECTS, ATTENDANCE_TREND, DEPT_ENROLLMENT, NOTICES,
} from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — DeptDesk ERP" }] }),
  component: Dashboard,
});

const STAT_TONES = {
  primary: "from-primary/10 to-primary-glow/10 text-primary",
  success: "from-success/10 to-success/5 text-success",
  warning: "from-warning/20 to-warning/10 text-warning-foreground",
  info:    "from-primary-glow/15 to-primary/10 text-primary",
} as const;

function Stat({
  label, value, delta, icon: Icon, tone = "primary",
}: { label: string; value: string | number; delta?: string; icon: any; tone?: keyof typeof STAT_TONES }) {
  return (
    <Card className="flex items-start justify-between">
      <div className="min-w-0">
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="mt-2 text-3xl font-bold tracking-tight text-foreground">{value}</div>
        {delta && (
          <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-success">
            <TrendingUp className="h-3.5 w-3.5" /> {delta}
          </div>
        )}
      </div>
      <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${STAT_TONES[tone]}`}>
        <Icon className="h-5 w-5" />
      </div>
    </Card>
  );
}

const PIE_COLORS = ["var(--primary)", "var(--primary-glow)", "var(--success)", "var(--warning)", "var(--destructive)"];

function Dashboard() {
  const { user } = useAuth();
  const greeting = `Welcome back, ${user?.name.split(" ").slice(-1)[0]}`;

  return (
    <div>
      <PageHeader title={greeting} description="Here's what's happening at Zeal Polytechnic today." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total Students" value={STUDENTS.length * 78} delta="+4.2% MoM" icon={GraduationCap} tone="primary" />
        <Stat label="Faculty" value={FACULTY.length * 11} delta="+1.1%" icon={UsersIcon} tone="info" />
        <Stat label="Departments" value={DEPARTMENTS.length} icon={Building2} tone="success" />
        <Stat label="Active Subjects" value={SUBJECTS.length * 6} delta="+8 new" icon={BookOpen} tone="warning" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-foreground">Attendance Trend</h3>
              <p className="text-xs text-muted-foreground">Weekly average across departments</p>
            </div>
            <Badge tone="info">Last 8 weeks</Badge>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ATTENDANCE_TREND}>
                <defs>
                  <linearGradient id="att" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="week" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} domain={[60, 100]} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12,
                  }}
                />
                <Area type="monotone" dataKey="present" stroke="var(--primary)" strokeWidth={2.5} fill="url(#att)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="mb-4">
            <h3 className="text-base font-semibold text-foreground">Enrollment by Dept</h3>
            <p className="text-xs text-muted-foreground">Distribution of students</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={DEPT_ENROLLMENT}
                  dataKey="students"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {DEPT_ENROLLMENT.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-foreground">Department Performance</h3>
            <p className="text-xs text-muted-foreground">Average pass percentage this semester</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEPARTMENTS.map((d) => ({ name: d.id, pass: 65 + Math.round(Math.random() * 30) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Bar dataKey="pass" fill="var(--primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">Latest Notices</h3>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </div>
          <ul className="space-y-3">
            {NOTICES.slice(0, 5).map((n) => (
              <li key={n.id} className="flex gap-3 rounded-lg p-2 transition-colors hover:bg-accent/40">
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-foreground">{n.title}</div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {n.date} · {n.category}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-foreground">Recent Activity</h3>
            <p className="text-xs text-muted-foreground">Live updates from across the institute</p>
          </div>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </div>
        <ul className="divide-y divide-border">
          {[
            { who: "Prof. Sneha Deshpande", what: "marked attendance for CO5I — Operating Systems", when: "5 min ago" },
            { who: "Exam Cell", what: "published mid-semester schedule", when: "2 hours ago" },
            { who: "Rohan Patil", what: "submitted Project Synopsis: Smart Attendance System", when: "Today, 10:14 AM" },
            { who: "Dr. P. Kale", what: "approved practical manual: Memory Management Simulation", when: "Yesterday" },
            { who: "T&P Cell", what: "opened registration for TCS Industrial Visit", when: "2 days ago" },
          ].map((a, i) => (
            <li key={i} className="flex items-center gap-3 py-3 text-sm">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {a.who.split(" ").map((w) => w[0]).slice(0, 2).join("")}
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-medium text-foreground">{a.who}</span>{" "}
                <span className="text-muted-foreground">{a.what}</span>
              </div>
              <div className="shrink-0 text-xs text-muted-foreground">{a.when}</div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
