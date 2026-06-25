import { createFileRoute } from "@tanstack/react-router";
import { Plus, Upload } from "lucide-react";
import { PageHeader } from "@/components/page-shell";
import { DataTable, Badge, type Column } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { STUDENTS } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/students")({
  head: () => ({ meta: [{ title: "Students — DeptDesk ERP" }] }),
  component: StudentsPage,
});

function StudentsPage() {
  const cols: Column<(typeof STUDENTS)[number]>[] = [
    { key: "id", header: "Roll No", className: "font-mono text-xs" },
    {
      key: "name", header: "Name",
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-xs font-semibold text-primary-foreground">
            {r.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
          <div>
            <div className="font-medium">{r.name}</div>
            <div className="text-xs text-muted-foreground">{r.email}</div>
          </div>
        </div>
      ),
    },
    { key: "class", header: "Class", render: (r) => <Badge tone="info">{r.class}</Badge> },
    { key: "dept", header: "Dept" },
    { key: "year", header: "Year" },
    { key: "cgpa", header: "CGPA", render: (r) => <span className="font-semibold">{r.cgpa}</span> },
    {
      key: "attendance", header: "Attendance",
      render: (r) => (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${r.attendance >= 75 ? "bg-success" : "bg-destructive"}`}
              style={{ width: `${r.attendance}%` }}
            />
          </div>
          <span className="text-xs font-medium tabular-nums">{r.attendance}%</span>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Student Management"
        description="View and manage all enrolled students."
        actions={
          <>
            <Button variant="outline" className="gap-2"><Upload className="h-4 w-4" /> Import CSV</Button>
            <Button className="gap-2 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:brightness-110">
              <Plus className="h-4 w-4" /> Add Student
            </Button>
          </>
        }
      />
      <DataTable data={STUDENTS} columns={cols} searchKeys={["name", "id", "class", "dept", "email"]} />
    </div>
  );
}
