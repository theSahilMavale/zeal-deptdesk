import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-shell";
import { DataTable, Badge, type Column } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { CLASSES } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/classes")({
  head: () => ({ meta: [{ title: "Classes — DeptDesk ERP" }] }),
  component: ClassesPage,
});

function ClassesPage() {
  const cols: Column<(typeof CLASSES)[number]>[] = [
    { key: "name", header: "Class", render: (r) => <span className="font-semibold">{r.name}</span> },
    { key: "dept", header: "Dept", render: (r) => <Badge tone="info">{r.dept}</Badge> },
    { key: "year", header: "Year" },
    { key: "students", header: "Strength" },
    { key: "mentor", header: "Class Mentor" },
  ];
  return (
    <div>
      <PageHeader
        title="Classes"
        description="Active class sections by department & year."
        actions={
          <Button className="gap-2 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:brightness-110">
            <Plus className="h-4 w-4" /> New Class
          </Button>
        }
      />
      <DataTable data={CLASSES} columns={cols} searchKeys={["name", "dept", "mentor", "year"]} />
    </div>
  );
}
