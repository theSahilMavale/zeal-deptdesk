import { createFileRoute } from "@tanstack/react-router";
import { Pin, Plus, Calendar, User } from "lucide-react";
import { Card, PageHeader } from "@/components/page-shell";
import { Badge } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { NOTICES } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/notices")({
  head: () => ({ meta: [{ title: "Notices — DeptDesk ERP" }] }),
  component: NoticesPage,
});

function catTone(c: string) {
  if (c === "Exam") return "danger" as const;
  if (c === "Event") return "info" as const;
  if (c === "Academic") return "success" as const;
  if (c === "Accounts") return "warning" as const;
  return "default" as const;
}

function NoticesPage() {
  const pinned = NOTICES.filter((n) => n.pinned);
  const rest = NOTICES.filter((n) => !n.pinned);

  return (
    <div>
      <PageHeader
        title="Notices"
        description="Announcements from administration, departments and cells."
        actions={
          <Button className="gap-2 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:brightness-110">
            <Plus className="h-4 w-4" /> New Notice
          </Button>
        }
      />

      {pinned.length > 0 && (
        <>
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Pin className="h-3.5 w-3.5" /> Pinned
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {pinned.map((n) => (
              <Card key={n.id} className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
                <div className="flex items-start justify-between gap-3">
                  <Badge tone={catTone(n.category)}>{n.category}</Badge>
                  <Pin className="h-4 w-4 text-primary" />
                </div>
                <h3 className="mt-3 text-base font-semibold leading-snug text-foreground">{n.title}</h3>
                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{n.date}</span>
                  <span className="inline-flex items-center gap-1"><User className="h-3 w-3" />{n.author}</span>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      <div className="mt-6 mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">All Notices</div>
      <Card className="!p-0">
        <ul className="divide-y divide-border">
          {rest.map((n) => (
            <li key={n.id} className="flex items-center gap-4 p-4 transition-colors hover:bg-accent/40">
              <Badge tone={catTone(n.category)}>{n.category}</Badge>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-foreground">{n.title}</div>
                <div className="mt-0.5 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{n.date}</span>
                  <span className="inline-flex items-center gap-1"><User className="h-3 w-3" />{n.author}</span>
                </div>
              </div>
              <Button variant="outline" size="sm">Read</Button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
