import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-shell";
import { DataTable, Badge, type Column } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { PROJECTS } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/project-marks")({
  head: () => ({ meta: [{ title: "Project Marks — DeptDesk ERP" }] }),
  component: ProjectMarksPage,
});

function statusTone(s: string) {
  if (s === "Evaluated") return "success" as const;
  if (s === "Submitted") return "info" as const;
  return "warning" as const;
}

function ProjectMarksPage() {
  const cols: Column<(typeof PROJECTS)[number]>[] = [
    { key: "id", header: "Project ID", className: "font-mono text-xs" },
    { key: "title", header: "Title", render: (r) => <span className="font-medium">{r.title}</span> },
    { key: "team", header: "Team" },
    { key: "guide", header: "Guide" },
    { key: "internal", header: "Internal / 100", render: (r) => <span className="tabular-nums">{r.internal}</span> },
    { key: "external", header: "External / 100", render: (r) => <span className="tabular-nums">{r.external}</span> },
    {
      key: "total", header: "Total",
      render: (r) => <span className="font-semibold tabular-nums">{r.internal + r.external}</span>,
    },
    { key: "status", header: "Status", render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
  ];

  return (
    <div>
      <PageHeader
        title="Project Marks"
        description="Capstone project evaluation — internal & external."
        actions={
          <Button className="gap-2 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:brightness-110">
            <Plus className="h-4 w-4" /> Add Project
          </Button>
        }
      />
      <DataTable data={PROJECTS} columns={cols} searchKeys={["title", "team", "guide", "status", "id"]} />
    </div>
  );
}
