import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FlaskConical, Download, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, PageHeader } from "@/components/page-shell";
import { Badge } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { CrudDialog, ConfirmDelete, type FieldDef } from "@/components/crud-dialog";
import { practicalsHooks, subjectsHooks, departmentsHooks } from "@/lib/api";
import { practicalManualsService } from "@/lib/api/services";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import type { PracticalManual, Subject, Department } from "@/lib/api/types";

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
  const qc = useQueryClient();
  const { user } = useAuth();
  const canManage = user?.role === "admin" || user?.role === "faculty";

  const { data: manuals = [], isLoading } = practicalsHooks.useList();
  const { data: subjects = [] } = subjectsHooks.useList();
  const { data: depts = [] } = departmentsHooks.useList();
  const remove = practicalsHooks.useRemove();

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<PracticalManual | null>(null);
  const [deleting, setDeleting] = useState<PracticalManual | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fields: FieldDef[] = useMemo(() => [
    { name: "id", label: "Manual ID", type: "text", required: true, placeholder: "P01", disabled: !!editing },
    { name: "title", label: "Title", type: "text", required: true },
    {
      name: "subject", label: "Subject", type: "select", required: true,
      options: (subjects as Subject[]).map((s) => ({ label: `${s.code} — ${s.name}`, value: s.code })),
    },
    {
      name: "dept", label: "Department", type: "select", required: true,
      options: (depts as Department[]).map((d) => ({ label: `${d.code} — ${d.name}`, value: d.code })),
    },
    { name: "sem", label: "Semester", type: "number", required: true, min: 1, max: 8 },
    {
      name: "status", label: "Status", type: "select", required: true,
      options: [
        { label: "Draft", value: "Draft" },
        { label: "Review", value: "Review" },
        { label: "Published", value: "Published" },
      ],
    },
    { name: "description", label: "Description", type: "textarea", rows: 3 },
    { name: "file", label: "PDF / Document", type: "file", accept: ".pdf,.doc,.docx" },
  ], [subjects, depts, editing]);

  const handleSubmit = async (values: Record<string, any>) => {
    setSubmitting(true);
    try {
      const file = values.file as File | null;
      const payload = {
        id: values.id,
        title: values.title,
        subject: values.subject,
        dept: values.dept,
        sem: Number(values.sem),
        status: values.status,
        description: values.description || "",
      };
      if (editing) {
        await practicalManualsService.updateWithFile(editing.id, payload, file);
        toast.success("Manual updated");
      } else {
        await practicalManualsService.createWithFile(payload, file);
        toast.success("Manual created");
      }
      qc.invalidateQueries({ queryKey: ["practical-manuals"] });
      setOpenForm(false);
      setEditing(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Practical Manuals"
        description="Lab manuals, experiments and rubrics by subject."
        actions={
          canManage ? (
            <Button
              onClick={() => { setEditing(null); setOpenForm(true); }}
              className="gap-2 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:brightness-110"
            >
              <Plus className="h-4 w-4" /> New Manual
            </Button>
          ) : undefined
        }
      />

      {isLoading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>
      ) : (manuals as PracticalManual[]).length === 0 ? (
        <Card className="text-center text-sm text-muted-foreground">No manuals yet.</Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {(manuals as PracticalManual[]).map((p) => (
            <Card key={p.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
                  <FlaskConical className="h-5 w-5" />
                </div>
                <Badge tone={statusTone(p.status)}>{p.status}</Badge>
              </div>
              <div className="mt-4">
                <div className="text-xs font-medium text-muted-foreground">
                  {p.subject_name || p.subject} · Sem {p.sem} · {p.dept}
                </div>
                <h3 className="mt-1 text-base font-semibold leading-snug text-foreground">{p.title}</h3>
                {p.description && <p className="mt-2 line-clamp-3 text-xs text-muted-foreground">{p.description}</p>}
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                {p.file_url && (
                  <Button asChild size="sm" className="gap-1.5">
                    <a href={p.file_url} target="_blank" rel="noopener noreferrer">
                      <Download className="h-3.5 w-3.5" /> Download
                    </a>
                  </Button>
                )}
                {canManage && (
                  <>
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => { setEditing(p); setOpenForm(true); }}>
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => setDeleting(p)}>
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </Button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <CrudDialog
        open={openForm}
        onOpenChange={(o) => { setOpenForm(o); if (!o) setEditing(null); }}
        title={editing ? "Edit Manual" : "New Manual"}
        fields={fields}
        initial={editing ?? { status: "Draft", sem: 5 }}
        submitting={submitting}
        onSubmit={handleSubmit}
      />

      <ConfirmDelete
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete ${deleting?.title ?? "manual"}?`}
        loading={remove.isPending}
        onConfirm={async () => {
          if (!deleting) return;
          await remove.mutateAsync(deleting.id);
          toast.success("Manual deleted");
          setDeleting(null);
        }}
      />
    </div>
  );
}
