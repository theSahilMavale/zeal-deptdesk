import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Card, PageHeader } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — DeptDesk ERP" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [name, setName] = useState("Zeal Polytechnic");
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);
  const [weekly, setWeekly] = useState(true);

  return (
    <div>
      <PageHeader title="Settings" description="Manage institute preferences and notifications." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h3 className="text-base font-semibold text-foreground">Institute</h3>
          <p className="text-sm text-muted-foreground">Basic information used across DeptDesk.</p>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="iname">Institute name</Label>
              <Input id="iname" className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="code">Institute code</Label>
              <Input id="code" className="mt-1.5" defaultValue="ZPI-1138" />
            </div>
            <div>
              <Label htmlFor="addr">Address</Label>
              <Input id="addr" className="mt-1.5" defaultValue="Narhe, Pune, Maharashtra" />
            </div>
            <div>
              <Label htmlFor="ay">Academic Year</Label>
              <Input id="ay" className="mt-1.5" defaultValue="2026-27" />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button
              onClick={() => toast.success("Settings saved")}
              className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:brightness-110"
            >
              Save changes
            </Button>
          </div>
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-foreground">Notifications</h3>
          <p className="text-sm text-muted-foreground">Choose how you'd like to hear from us.</p>
          <div className="mt-5 space-y-4">
            {[
              { label: "Email notifications", desc: "Announcements & results", val: emailNotif, set: setEmailNotif },
              { label: "Push notifications", desc: "Real-time alerts", val: pushNotif, set: setPushNotif },
              { label: "Weekly digest", desc: "Summary every Monday", val: weekly, set: setWeekly },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
                <div>
                  <div className="text-sm font-medium text-foreground">{row.label}</div>
                  <div className="text-xs text-muted-foreground">{row.desc}</div>
                </div>
                <Switch checked={row.val} onCheckedChange={row.set} />
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-3">
          <h3 className="text-base font-semibold text-foreground">Security</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="cur">Current password</Label>
              <Input id="cur" type="password" className="mt-1.5" placeholder="••••••••" />
            </div>
            <div>
              <Label htmlFor="new">New password</Label>
              <Input id="new" type="password" className="mt-1.5" placeholder="••••••••" />
            </div>
            <div>
              <Label htmlFor="conf">Confirm password</Label>
              <Input id="conf" type="password" className="mt-1.5" placeholder="••••••••" />
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline">Cancel</Button>
            <Button onClick={() => toast.success("Password updated")} className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:brightness-110">
              Update password
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
