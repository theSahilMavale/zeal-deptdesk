import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-shell";
import { DataTable, Badge, type Column } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { CrudDialog, ConfirmDelete, type FieldDef } from "@/components/crud-dialog";
import { subjectsHooks, departmentsHooks } from "@/lib/api";
import type { Subject, Department } from "@/lib/api/types";

export const Route = createFileRoute("/_authenticated/subjects")({
  head: () => ({ meta: [{ title: "Subjects — DeptDesk ERP" }] }),
  component: SubjectsPage,
});

function SubjectsPage() {
  const { data: subjects = [], isLoading } = subjectsHooks.useList();
  const { data: depts = [] } = departmentsHooks.useList();
  const create = subjectsHooks.useCreate();
  const update = subjectsHooks.useUpdate();
  const remove = subjectsHooks.useRemove();

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [deleting, setDeleting] = useState<Subject | null>(null);

  const fields: FieldDef[] = useMemo(
    () => [
      { name: "code", label: "Code", type: "text", required: true, placeholder: "22516", disabled: !!editing },
      { name: "name", label: "Name", type: "text", required: true },
      {
        name: "dept",
        label: "Department",
        type: "select",
        required: true,
        options: (depts as Department[]).map((d) => ({ label: `${d.code} — ${d.name}`, value: d.code })),
      },
      { name: "sem", label: "Semester", type: "number", required: true, min: 1, max: 8 },
      { name: "credits", label: "Credits", type: "number", required: true, min: 0, max: 10 },
      {
        name: "type",
        label: "Type",
        type: "select",
        required: true,
        options: [
          { label: "Theory", value: "Theory" },
          { label: "Practical", value: "Practical" },
          { label: "Project", value: "Project" },
          { label: "Elective", value: "Elective" },
        ],
      },
    ],
    [depts, editing],
  );

  const handleSubmit = async (values: Record<string, any>) => {
    const payload = { ...values, sem: Number(values.sem), credits: Number(values.credits) };
    if (editing) {
      await update.mutateAsync({ id: editing.code, data: payload });
      toast.success("Subject updated");
    } else {
      await create.mutateAsync(payload);
      toast.success("Subject created");
    }
    setOpenForm(false);
    setEditing(null);
  };

  const cols: Column<Subject>[] = [
    { key: "code", header: "Code", className: "font-mono text-xs" },
    { key: "name", header: "Subject", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "dept", header: "Dept", render: (r) => <Badge tone="info">{r.dept}</Badge> },
    { key: "sem", header: "Semester" },
    { key: "credits", header: "Credits" },
    {
      key: "type", header: "Type",
      render: (r) => (
        <Badge tone={r.type === "Practical" || r.type === "Project" ? "success" : "default"}>
          {r.type}
        </Badge>
      ),
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
        title="Subjects"
        description="MSBTE curriculum subjects offered this academic year."
        actions={
          <Button
            onClick={() => { setEditing(null); setOpenForm(true); }}
            className="gap-2 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:brightness-110"
          >
            <Plus className="h-4 w-4" /> Add Subject
          </Button>
        }
      />
      {isLoading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>
      ) : (
        <DataTable data={subjects as Subject[]} columns={cols} searchKeys={["code", "name", "dept"]} />
      )}

      <CrudDialog
        open={openForm}
        onOpenChange={(o) => { setOpenForm(o); if (!o) setEditing(null); }}
        title={editing ? "Edit Subject" : "Add Subject"}
        fields={fields}
        initial={editing ?? undefined}
        submitting={create.isPending || update.isPending}
        onSubmit={handleSubmit}
      />

      <ConfirmDelete
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete ${deleting?.name ?? "subject"}?`}
        loading={remove.isPending}
        onConfirm={async () => {
          if (!deleting) return;
          await remove.mutateAsync(deleting.code);
          toast.success("Subject deleted");
          setDeleting(null);
        }}
      />
    </div>
  );
}
