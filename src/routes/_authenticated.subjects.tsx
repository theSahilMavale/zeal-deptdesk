import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-shell";
import { DataTable, Badge, type Column } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { SUBJECTS } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/subjects")({
  head: () => ({ meta: [{ title: "Subjects — DeptDesk ERP" }] }),
  component: SubjectsPage,
});

function SubjectsPage() {
  const cols: Column<(typeof SUBJECTS)[number]>[] = [
    { key: "code", header: "Code", className: "font-mono text-xs" },
    { key: "name", header: "Subject", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "dept", header: "Dept", render: (r) => <Badge tone="info">{r.dept}</Badge> },
    { key: "sem", header: "Semester" },
    { key: "credits", header: "Credits" },
    {
      key: "type", header: "Type",
      render: (r) => <Badge tone={r.type.includes("Practical") ? "success" : "default"}>{r.type}</Badge>,
    },
  ];
  return (
    <div>
      <PageHeader
        title="Subjects"
        description="MSBTE curriculum subjects offered this academic year."
        actions={
          <Button className="gap-2 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:brightness-110">
            <Plus className="h-4 w-4" /> Add Subject
          </Button>
        }
      />
      <DataTable data={SUBJECTS} columns={cols} searchKeys={["code", "name", "dept"]} />
    </div>
  );
}
