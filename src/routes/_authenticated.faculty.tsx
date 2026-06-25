import { createFileRoute } from "@tanstack/react-router";
import { Plus, Mail, Phone } from "lucide-react";
import { PageHeader } from "@/components/page-shell";
import { DataTable, Badge, type Column } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { FACULTY } from "@/lib/mock-data";
import { RequireRole } from "@/lib/auth";
import { AccessDenied } from "@/components/access-denied";

export const Route = createFileRoute("/_authenticated/faculty")({
  head: () => ({ meta: [{ title: "Faculty — DeptDesk ERP" }] }),
  component: () => (
    <RequireRole roles={["admin"]} fallback={<AccessDenied />}>
      <FacultyPage />
    </RequireRole>
  ),
});

function FacultyPage() {
  const cols: Column<(typeof FACULTY)[number]>[] = [
    { key: "id", header: "ID", className: "font-mono text-xs" },
    {
      key: "name", header: "Faculty",
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-xs font-semibold text-primary-foreground">
            {r.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
          <div>
            <div className="font-medium">{r.name}</div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{r.email}</span>
            </div>
          </div>
        </div>
      ),
    },
    { key: "dept", header: "Dept", render: (r) => <Badge tone="info">{r.dept}</Badge> },
    {
      key: "designation", header: "Designation",
      render: (r) => <Badge tone={r.designation === "HOD" ? "success" : "default"}>{r.designation}</Badge>,
    },
    { key: "subjects", header: "Subjects", render: (r) => r.subjects.join(", ") },
    { key: "experience", header: "Experience", render: (r) => `${r.experience} yrs` },
  ];

  return (
    <div>
      <PageHeader
        title="Faculty Management"
        description="All teaching staff across departments."
        actions={
          <Button className="gap-2 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:brightness-110">
            <Plus className="h-4 w-4" /> Add Faculty
          </Button>
        }
      />
      <DataTable data={FACULTY} columns={cols} searchKeys={["name", "dept", "designation", "id"]} />
    </div>
  );
}
