import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/page-shell";
import { DataTable, Badge, type Column } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { RESULTS } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/results")({
  head: () => ({ meta: [{ title: "Results — DeptDesk ERP" }] }),
  component: ResultsPage,
});

function gradeTone(g: string) {
  if (g === "O" || g === "A+") return "success" as const;
  if (g === "A" || g === "B+") return "info" as const;
  if (g === "B") return "warning" as const;
  return "danger" as const;
}

function ResultsPage() {
  const cols: Column<(typeof RESULTS)[number]>[] = [
    { key: "id", header: "Roll No", className: "font-mono text-xs" },
    { key: "name", header: "Student", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "class", header: "Class", render: (r) => <Badge tone="info">{r.class}</Badge> },
    { key: "os", header: "OS / 100", render: (r) => <span className="tabular-nums">{r.os}</span> },
    { key: "se", header: "SE / 100", render: (r) => <span className="tabular-nums">{r.se}</span> },
    { key: "ajp", header: "AJP / 100", render: (r) => <span className="tabular-nums">{r.ajp}</span> },
    { key: "total", header: "Total / 300", render: (r) => <span className="font-semibold tabular-nums">{r.total}</span> },
    { key: "grade", header: "Grade", render: (r) => <Badge tone={gradeTone(r.grade)}>{r.grade}</Badge> },
  ];

  return (
    <div>
      <PageHeader
        title="Results"
        description="Semester examination results — TY Computer Engineering."
        actions={
          <Button variant="outline" className="gap-2"><Download className="h-4 w-4" /> Export PDF</Button>
        }
      />
      <DataTable data={RESULTS} columns={cols} searchKeys={["name", "id", "class", "grade"]} />
    </div>
  );
}
