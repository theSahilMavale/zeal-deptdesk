import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-shell";
import { DataTable, Badge, type Column } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { CrudDialog, ConfirmDelete, type FieldDef } from "@/components/crud-dialog";
import { projectMarksHooks, facultyHooks } from "@/lib/api";
import type { ProjectMark, Faculty } from "@/lib/api/types";

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
  const { data: projects = [], isLoading } = projectMarksHooks.useList();
  const { data: faculty = [] } = facultyHooks.useList();
  const create = projectMarksHooks.useCreate();
  const update = projectMarksHooks.useUpdate();
  const remove = projectMarksHooks.useRemove();

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<ProjectMark | null>(null);
  const [deleting, setDeleting] = useState<ProjectMark | null>(null);

  const fields: FieldDef[] = useMemo(() => [
    { name: "id", label: "Project ID", type: "text", required: true, placeholder: "PRJ100", disabled: !!editing },
    { name: "title", label: "Title", type: "text", required: true },
    { name: "team", label: "Team", type: "text", required: true, placeholder: "Lead + members" },
    {
      name: "guide", label: "Guide", type: "select", allowEmpty: true,
      options: (faculty as Faculty[]).map((f) => ({ label: f.name, value: f.id })),
    },
    { name: "internal", label: "Internal / 100", type: "number", min: 0, max: 100 },
    { name: "external", label: "External / 100", type: "number", min: 0, max: 100 },
    {
      name: "status", label: "Status", type: "select", required: true,
      options: [
        { label: "In Progress", value: "In Progress" },
        { label: "Submitted", value: "Submitted" },
        { label: "Evaluated", value: "Evaluated" },
      ],
    },
  ], [faculty, editing]);

  const handleSubmit = async (values: Record<string, any>) => {
    const payload = {
      ...values,
      guide: values.guide || null,
      internal: Number(values.internal || 0),
      external: Number(values.external || 0),
    };
    if (editing) {
      await update.mutateAsync({ id: editing.id, data: payload });
      toast.success("Project updated");
    } else {
      await create.mutateAsync(payload);
      toast.success("Project added");
    }
    setOpenForm(false);
    setEditing(null);
  };

  const cols: Column<ProjectMark>[] = [
    { key: "id", header: "Project ID", className: "font-mono text-xs" },
    { key: "title", header: "Title", render: (r) => <span className="font-medium">{r.title}</span> },
    { key: "team", header: "Team" },
    { key: "guide_name", header: "Guide", render: (r) => r.guide_name || "—" },
    { key: "internal", header: "Internal / 100", render: (r) => <span className="tabular-nums">{r.internal}</span> },
    { key: "external", header: "External / 100", render: (r) => <span className="tabular-nums">{r.external}</span> },
    { key: "total", header: "Total", render: (r) => <span className="font-semibold tabular-nums">{(r.internal || 0) + (r.external || 0)}</span> },
    { key: "status", header: "Status", render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
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
        title="Project Marks"
        description="Capstone project evaluation — internal & external."
        actions={
          <Button
            onClick={() => { setEditing(null); setOpenForm(true); }}
            className="gap-2 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:brightness-110"
          >
            <Plus className="h-4 w-4" /> Add Project
          </Button>
        }
      />
      {isLoading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>
      ) : (
        <DataTable data={projects as ProjectMark[]} columns={cols} searchKeys={["title", "team", "id"]} />
      )}

      <CrudDialog
        open={openForm}
        onOpenChange={(o) => { setOpenForm(o); if (!o) setEditing(null); }}
        title={editing ? "Edit Project" : "Add Project"}
        fields={fields}
        initial={editing ? { ...editing, guide: editing.guide ?? "" } : undefined}
        submitting={create.isPending || update.isPending}
        onSubmit={handleSubmit}
      />

      <ConfirmDelete
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete ${deleting?.title ?? "project"}?`}
        loading={remove.isPending}
        onConfirm={async () => {
          if (!deleting) return;
          await remove.mutateAsync(deleting.id);
          toast.success("Project deleted");
          setDeleting(null);
        }}
      />
    </div>
  );
}
