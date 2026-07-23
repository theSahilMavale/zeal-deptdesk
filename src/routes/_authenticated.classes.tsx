import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-shell";
import { DataTable, Badge, type Column } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { CrudDialog, ConfirmDelete, type FieldDef } from "@/components/crud-dialog";
import { classesHooks, departmentsHooks, facultyHooks } from "@/lib/api";
import type { ClassSection, Department, Faculty } from "@/lib/api/types";
import { RequireRole } from "@/lib/auth";
import { AccessDenied } from "@/components/access-denied";

export const Route = createFileRoute("/_authenticated/classes")({
  head: () => ({ meta: [{ title: "Classes — DeptDesk ERP" }] }),
  component: () => (
    <RequireRole roles={["admin"]} fallback={<AccessDenied />}>
      <ClassesPage />
    </RequireRole>
  ),
});

function ClassesPage() {
  const { data: classes = [], isLoading } = classesHooks.useList();
  const { data: depts = [] } = departmentsHooks.useList();
  const { data: faculty = [] } = facultyHooks.useList();
  const create = classesHooks.useCreate();
  const update = classesHooks.useUpdate();
  const remove = classesHooks.useRemove();

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<ClassSection | null>(null);
  const [deleting, setDeleting] = useState<ClassSection | null>(null);

  const fields: FieldDef[] = useMemo(() => [
    { name: "id", label: "Class Code", type: "text", required: true, placeholder: "CO5I", disabled: !!editing },
    { name: "name", label: "Name", type: "text", required: true, placeholder: "CO5I" },
    {
      name: "dept", label: "Department", type: "select", required: true,
      options: (depts as Department[]).map((d) => ({ label: `${d.code} — ${d.name}`, value: d.code })),
    },
    {
      name: "year", label: "Year", type: "select", required: true,
      options: [
        { label: "First Year (FY)", value: "FY" },
        { label: "Second Year (SY)", value: "SY" },
        { label: "Third Year (TY)", value: "TY" },
      ],
    },
    { name: "students", label: "Strength", type: "number", min: 0, max: 500 },
    {
      name: "mentor", label: "Class Mentor", type: "select", allowEmpty: true,
      options: (faculty as Faculty[]).map((f) => ({ label: f.name, value: f.id })),
    },
  ], [depts, faculty, editing]);

  const handleSubmit = async (values: Record<string, any>) => {
    const payload = {
      ...values,
      mentor: values.mentor || null,
      students: Number(values.students || 0),
    };
    if (editing) {
      await update.mutateAsync({ id: editing.id, data: payload });
      toast.success("Class updated");
    } else {
      await create.mutateAsync(payload);
      toast.success("Class created");
    }
    setOpenForm(false);
    setEditing(null);
  };

  const cols: Column<ClassSection>[] = [
    { key: "id", header: "Class", render: (r) => <span className="font-semibold">{r.id}</span> },
    { key: "dept", header: "Dept", render: (r) => <Badge tone="info">{r.dept}</Badge> },
    { key: "year", header: "Year" },
    { key: "students", header: "Strength" },
    { key: "mentor_name", header: "Class Mentor", render: (r) => r.mentor_name || "—" },
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
        title="Classes"
        description="Active class sections by department & year."
        actions={
          <Button
            onClick={() => { setEditing(null); setOpenForm(true); }}
            className="gap-2 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:brightness-110"
          >
            <Plus className="h-4 w-4" /> New Class
          </Button>
        }
      />
      {isLoading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>
      ) : (
        <DataTable data={classes as ClassSection[]} columns={cols} searchKeys={["id", "name", "dept", "year"]} />
      )}

      <CrudDialog
        open={openForm}
        onOpenChange={(o) => { setOpenForm(o); if (!o) setEditing(null); }}
        title={editing ? "Edit Class" : "New Class"}
        fields={fields}
        initial={editing ? { ...editing, mentor: editing.mentor ?? "" } : undefined}
        submitting={create.isPending || update.isPending}
        onSubmit={handleSubmit}
      />

      <ConfirmDelete
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete ${deleting?.id ?? "class"}?`}
        loading={remove.isPending}
        onConfirm={async () => {
          if (!deleting) return;
          await remove.mutateAsync(deleting.id);
          toast.success("Class deleted");
          setDeleting(null);
        }}
      />
    </div>
  );
}
