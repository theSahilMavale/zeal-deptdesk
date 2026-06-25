import { createFileRoute } from "@tanstack/react-router";
import { FlaskConical, Download, Plus } from "lucide-react";
import { Card, PageHeader } from "@/components/page-shell";
import { Badge } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { PRACTICALS } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/practical-manuals")({
  head: () => ({ meta: [{ title: "Practical Manuals — DeptDesk ERP" }] }),
  component: PracticalsPage,
});

function statusTone(s: string) {
  if (s === "Published") return "success" as const;
  if (s === "Review") return "warning" as const;
  return "default" as const;
}

function PracticalsPage() {
  return (
    <div>
      <PageHeader
        title="Practical Manuals"
        description="Lab manuals, experiments and rubrics by subject."
        actions={
          <Button className="gap-2 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:brightness-110">
            <Plus className="h-4 w-4" /> New Manual
          </Button>
        }
      />
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {PRACTICALS.map((p) => (
          <Card key={p.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
                <FlaskConical className="h-5 w-5" />
              </div>
              <Badge tone={statusTone(p.status)}>{p.status}</Badge>
            </div>
            <div className="mt-4">
              <div className="text-xs font-medium text-muted-foreground">{p.subject} · Sem {p.sem} · {p.dept}</div>
              <h3 className="mt-1 text-base font-semibold leading-snug text-foreground">{p.title}</h3>
            </div>
            <div className="mt-5 flex items-center gap-2">
              <Button variant="outline" size="sm" className="flex-1">View</Button>
              <Button size="sm" className="flex-1 gap-1.5"><Download className="h-3.5 w-3.5" /> PDF</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
