import { createFileRoute } from "@tanstack/react-router";
import { Building2, Users, GraduationCap, Plus } from "lucide-react";
import { Card, PageHeader } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { DEPARTMENTS } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/departments")({
  head: () => ({ meta: [{ title: "Departments — DeptDesk ERP" }] }),
  component: DeptsPage,
});

function DeptsPage() {
  return (
    <div>
      <PageHeader
        title="Departments"
        description="Academic departments at Zeal Polytechnic."
        actions={
          <Button className="gap-2 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:brightness-110">
            <Plus className="h-4 w-4" /> New Department
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {DEPARTMENTS.map((d) => (
          <Card key={d.id} className="flex flex-col">
            <div className="flex items-start justify-between">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
                <Building2 className="h-6 w-6" />
              </div>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {d.id}
              </span>
            </div>
            <h3 className="mt-4 text-lg font-bold text-foreground">{d.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">Head: {d.hod}</p>

            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" /> Faculty
                </div>
                <div className="mt-1 text-xl font-bold text-foreground">{d.faculty}</div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <GraduationCap className="h-3.5 w-3.5" /> Students
                </div>
                <div className="mt-1 text-xl font-bold text-foreground">{d.students}</div>
              </div>
            </div>

            <Button variant="outline" className="mt-5 w-full">View Department</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
