import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, MapPin, Building2, Edit3 } from "lucide-react";
import { Card, PageHeader } from "@/components/page-shell";
import { Badge } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — DeptDesk ERP" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null;
  const initials = user.name.split(" ").map((n) => n[0]).slice(0, 2).join("");

  return (
    <div>
      <PageHeader
        title="My Profile"
        description="Your personal and account information."
        actions={<Button variant="outline" className="gap-2"><Edit3 className="h-4 w-4" /> Edit</Button>}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <div className="flex flex-col items-center text-center">
            <div className="grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-2xl font-bold text-primary-foreground shadow-md">
              {initials}
            </div>
            <h3 className="mt-4 text-lg font-bold text-foreground">{user.name}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <Badge tone="info" >{user.role.toUpperCase()}</Badge>
          </div>
          <div className="mt-6 space-y-3 border-t border-border pt-5 text-sm">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Mail className="h-4 w-4" /> {user.email}
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Phone className="h-4 w-4" /> +91 98220 12345
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Building2 className="h-4 w-4" /> Zeal Polytechnic
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <MapPin className="h-4 w-4" /> Zeal Polytechnic, Pune
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="text-base font-semibold text-foreground">Account Details</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              ["Full Name", user.name],
              ["Email", user.email],
              ["Role", user.role[0].toUpperCase() + user.role.slice(1)],
              ["Username", user.username],
              ["Employee / Roll No", user.id],
              ["Joined", "Aug 2023"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{k}</div>
                <div className="mt-1 font-medium text-foreground">{v}</div>
              </div>
            ))}
          </div>

          <h3 className="mt-8 text-base font-semibold text-foreground">Recent Activity</h3>
          <ul className="mt-3 divide-y divide-border">
            {[
              ["Signed in", "Just now"],
              ["Updated profile photo", "Yesterday"],
              ["Changed password", "12 Jun 2026"],
              ["Marked attendance for CO5I", "10 Jun 2026"],
            ].map(([w, t]) => (
              <li key={w} className="flex items-center justify-between py-3 text-sm">
                <span className="text-foreground">{w}</span>
                <span className="text-xs text-muted-foreground">{t}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
