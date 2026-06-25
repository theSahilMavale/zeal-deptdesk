import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Pencil, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-shell";
import { DataTable, Badge, type Column } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { CrudDialog, ConfirmDelete, type FieldDef } from "@/components/crud-dialog";
import { resultsHooks, studentsHooks, subjectsHooks } from "@/lib/api";
import type { ResultRow, Student, Subject } from "@/lib/api/types";

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

const GRADES = ["O", "A+", "A", "B+", "B", "C", "D", "F"];

function ResultsPage() {
  const { data: results = [], isLoading } = resultsHooks.useList();
  const { data: students = [] } = studentsHooks.useList();
  const { data: subjects = [] } = subjectsHooks.useList();
  const create = resultsHooks.useCreate();
  const update = resultsHooks.useUpdate();
  const remove = resultsHooks.useRemove();

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<ResultRow | null>(null);
  const [deleting, setDeleting] = useState<ResultRow | null>(null);

  const fields: FieldDef[] = useMemo(() => [
    {
      name: "student", label: "Student", type: "select", required: true,
      options: (students as Student[]).map((s) => ({ label: `${s.id} — ${s.name}`, value: s.id })),
    },
    {
      name: "subject", label: "Subject", type: "select", required: true,
      options: (subjects as Subject[]).map((s) => ({ label: `${s.code} — ${s.name}`, value: s.code })),
    },
    { name: "semester", label: "Semester", type: "number", required: true, min: 1, max: 8 },
    { name: "internal", label: "Internal", type: "number", required: true, min: 0, max: 100 },
    { name: "external", label: "External", type: "number", required: true, min: 0, max: 100 },
    {
      name: "grade", label: "Grade (auto if blank)", type: "select", allowEmpty: true,
      options: GRADES.map((g) => ({ label: g, value: g })),
    },
    { name: "published", label: "Published", type: "switch" },
  ], [students, subjects]);

  const handleSubmit = async (values: Record<string, any>) => {
    const payload: Partial<ResultRow> = {
      student: values.student,
      subject: values.subject,
      semester: Number(values.semester),
      internal: Number(values.internal),
      external: Number(values.external),
      grade: values.grade || "",
      published: Boolean(values.published),
    };
    if (editing) {
      await update.mutateAsync({ id: editing.id!, data: payload });
      toast.success("Result updated");
    } else {
      await create.mutateAsync(payload);
      toast.success("Result added");
    }
    setOpenForm(false);
    setEditing(null);
  };

  const cols: Column<ResultRow>[] = [
    { key: "student", header: "Roll No", className: "font-mono text-xs" },
    { key: "student_name", header: "Student", render: (r) => <span className="font-medium">{r.student_name || r.student}</span> },
    { key: "subject_name", header: "Subject", render: (r) => <Badge tone="info">{r.subject_name || r.subject}</Badge> },
    { key: "semester", header: "Sem" },
    { key: "internal", header: "Internal", render: (r) => <span className="tabular-nums">{r.internal}</span> },
    { key: "external", header: "External", render: (r) => <span className="tabular-nums">{r.external}</span> },
    { key: "total", header: "Total", render: (r) => <span className="font-semibold tabular-nums">{r.total}</span> },
    { key: "grade", header: "Grade", render: (r) => <Badge tone={gradeTone(r.grade)}>{r.grade || "—"}</Badge> },
    {
      key: "published", header: "Status",
      render: (r) => r.published ? <Badge tone="success"><CheckCircle2 className="mr-1 inline h-3 w-3" />Published</Badge> : <Badge>Draft</Badge>,
    },
    {
      key: "actions", header: "",
      render: (r) => (
        <div className="flex justify-end gap-1">
          <Button size="sm" variant="ghost" onClick={() => { setEditing(r); setOpenForm(true); }}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleting(r)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Results"
        description="Semester examination results."
        actions={
          <Button
            onClick={() => { setEditing(null); setOpenForm(true); }}
            className="gap-2 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:brightness-110"
          >
            <Plus className="h-4 w-4" /> Add Result
          </Button>
        }
      />
      {isLoading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>
      ) : (
        <DataTable data={results as ResultRow[]} columns={cols} searchKeys={["student_name", "subject_name", "grade"]} />
      )}

      <CrudDialog
        open={openForm}
        onOpenChange={(o) => { setOpenForm(o); if (!o) setEditing(null); }}
        title={editing ? "Edit Result" : "Add Result"}
        fields={fields}
        initial={editing ?? { semester: 5, internal: 0, external: 0, published: false }}
        submitting={create.isPending || update.isPending}
        onSubmit={handleSubmit}
      />

      <ConfirmDelete
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete this result?"
        loading={remove.isPending}
        onConfirm={async () => {
          if (!deleting) return;
          await remove.mutateAsync(deleting.id!);
          toast.success("Result deleted");
          setDeleting(null);
        }}
      />
    </div>
  );
}
