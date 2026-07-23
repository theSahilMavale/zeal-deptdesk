import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { School, GraduationCap, Users as UsersIcon, Shield, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — DeptDesk ERP" },
      { name: "description", content: "Sign in to DeptDesk ERP, Zeal Polytechnic's college management system." },
    ],
  }),
  component: AuthPage,
});

type RoleHint = "admin" | "faculty" | "student";

const ROLES: { id: RoleHint; label: string; icon: typeof Shield; sample: string }[] = [
  { id: "admin", label: "Admin", icon: Shield, sample: "admin@zealpoly.edu" },
  { id: "faculty", label: "Faculty", icon: UsersIcon, sample: "sneha@zealpoly.edu" },
  { id: "student", label: "Student", icon: GraduationCap, sample: "rohan@zealpoly.edu" },
];

function AuthPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [roleHint, setRoleHint] = useState<RoleHint>("admin");
  const [email, setEmail] = useState("admin@zealpoly.edu");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/dashboard", replace: true });
  }, [user, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const u = await login(email, password);
      toast.success(`Welcome, ${u.name}`);
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-glow p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="relative flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 backdrop-blur">
            <School className="h-6 w-6" />
          </div>
          <div>
            <div className="text-lg font-bold leading-tight">Zeal Polytechnic</div>
            <div className="text-xs text-primary-foreground/80">Pune, Maharashtra</div>
          </div>
        </div>

        <div className="relative">
          <h1 className="text-4xl font-bold leading-tight">
            DeptDesk ERP
          </h1>
          <p className="mt-2 text-base text-primary-foreground/90">College Management System</p>
          <p className="mt-6 max-w-md text-sm text-primary-foreground/80">
            A unified workspace for administrators, faculty, and students — manage
            attendance, results, timetables, practicals, projects and notices, all in one place.
          </p>

          <div className="mt-10 grid max-w-md gap-3">
            {[
              "Real-time attendance & results tracking",
              "Department-wise analytics and reports",
              "Practical manuals & project evaluation",
              "Notices, timetable and academic calendar",
            ].map((f) => (
              <div key={f} className="flex items-center gap-3 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-white" />
                {f}
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-xs text-primary-foreground/70">
          © {new Date().getFullYear()} Zeal Polytechnic. All rights reserved.
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
              <School className="h-5 w-5" />
            </div>
            <div>
              <div className="text-base font-bold text-foreground">Zeal Polytechnic</div>
              <div className="text-xs text-muted-foreground">DeptDesk ERP</div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to continue to your dashboard.
          </p>

          {/* Role selector */}
          <div className="mt-6 grid grid-cols-3 gap-2">
            {ROLES.map((r) => {
              const active = roleHint === r.id;
              const Icon = r.icon;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    setRoleHint(r.id);
                    setEmail(r.sample);
                    setPassword("");
                  }}
                  className={
                    "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-medium transition-all " +
                    (active
                      ? "border-primary bg-primary/5 text-primary shadow-sm"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground")
                  }
                >
                  <Icon className="h-4 w-4" />
                  {r.label}
                </button>
              );
            })}
          </div>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1.5">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 pl-9"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pl-9"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="h-11 w-full bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-sm transition-all hover:shadow-md hover:brightness-110"
            >
              {submitting ? "Signing in…" : "Sign in"}
            </Button>

          </form>
        </div>
      </div>
    </div>
  );
}
