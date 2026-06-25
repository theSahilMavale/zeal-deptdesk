import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Printer } from "lucide-react";
import { Card, PageHeader } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/data-table";
import { TIMETABLE } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/timetable")({
  head: () => ({ meta: [{ title: "Timetable — DeptDesk ERP" }] }),
  component: TimetablePage,
});

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat"] as const;
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function cellTone(s: string) {
  if (!s || s === "—") return "bg-muted/40 text-muted-foreground";
  if (s.includes("Lab")) return "bg-primary text-primary-foreground shadow-sm";
  if (["Sport", "Library", "Project"].includes(s)) return "bg-accent text-accent-foreground";
  return "bg-primary/10 text-primary";
}

function TimetablePage() {
  return (
    <div>
      <PageHeader
        title="Timetable"
        description="Weekly schedule — CO5I · Computer Engineering"
        actions={
          <>
            <Button variant="outline" className="gap-2"><Calendar className="h-4 w-4" /> This Week</Button>
            <Button className="gap-2 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:brightness-110">
              <Printer className="h-4 w-4" /> Print
            </Button>
          </>
        }
      />
      <Card className="!p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 text-left">Time</th>
                {DAY_LABELS.map((d) => (
                  <th key={d} className="px-4 py-3 text-left">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIMETABLE.map((row) => (
                <tr key={row.time} className="border-b border-border/60 last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 text-xs font-medium text-muted-foreground">{row.time}</td>
                  {DAYS.map((d) => (
                    <td key={d} className="px-2 py-2">
                      <div className={`rounded-lg px-3 py-2.5 text-xs font-semibold ${cellTone(row[d])}`}>
                        {row[d]}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
        <Badge tone="info">Lecture</Badge>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">Lab</span>
        <Badge>Activity</Badge>
      </div>
    </div>
  );
}
