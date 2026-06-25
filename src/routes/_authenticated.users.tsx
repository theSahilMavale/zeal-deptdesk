import { createFileRoute } from "@tanstack/react-router";
import { Plus, Download } from "lucide-react";
import { PageHeader } from "@/components/page-shell";
import { DataTable, Badge, type Column } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { USERS } from "@/lib/mock-data";
import { RequireRole } from "@/lib/auth";
import { AccessDenied } from "@/components/access-denied";

export const Route = createFileRoute("/_authenticated/users")({
  head: () => ({ meta: [{ title: "Users — DeptDesk ERP" }] }),
  component: () => (
    <RequireRole roles={["admin"]} fallback={<AccessDenied />}>
      <UsersPage />
    </RequireRole>
  ),
});

function UsersPage() {
  const columns: Column<(typeof USERS)[number]>[] = [
    { key: "id", header: "ID", className: "font-mono text-xs text-muted-foreground" },
    {
      key: "name", header: "Name",
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {r.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
          <span className="font-medium">{r.name}</span>
        </div>
      ),
    },
    { key: "email", header: "Email", render: (r) => <span className="text-muted-foreground">{r.email}</span> },
    {
      key: "role", header: "Role",
      render: (r) => (
        <Badge tone={r.role === "Admin" ? "info" : r.role === "Faculty" ? "success" : "default"}>{r.role}</Badge>
      ),
    },
    {
      key: "status", header: "Status",
      render: (r) => <Badge tone="success">{r.status}</Badge>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="User Management"
        description="Manage admins, faculty and student accounts."
        actions={
          <>
            <Button variant="outline" className="gap-2"><Download className="h-4 w-4" /> Export</Button>
            <Button className="gap-2 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:brightness-110">
              <Plus className="h-4 w-4" /> New User
            </Button>
          </>
        }
      />
      <DataTable data={USERS} columns={columns} searchKeys={["name", "email", "role", "id"]} />
    </div>
  );
}
