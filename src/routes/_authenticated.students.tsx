import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-shell";
import { DataTable, Badge, type Column } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { CrudDialog, ConfirmDelete, type FieldDef } from "@/components/crud-dialog";
import { studentsHooks, departmentsHooks, classesHooks } from "@/lib/api";
import type { Student, Department, ClassSection } from "@/lib/api/types";

export const Route = createFileRoute("/_authenticated/students")({
  head: () => ({ meta: [{ title: "Students — DeptDesk ERP" }] }),
  component: StudentsPage,
});

function StudentsPage() {
  const { data: students = [], isLoading } = studentsHooks.useList();
  const { data: depts = [] } = departmentsHooks.useList();
  const { data: classes = [] } = classesHooks.useList();
  const create = studentsHooks.useCreate();
  const update = studentsHooks.useUpdate();
  const remove = studentsHooks.useRemove();

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState<Student | null>(null);

  const fields: FieldDef[] = useMemo(
    () => [
      { name: "id", label: "Roll Number", type: "text", required: true, placeholder: "Z2110001", disabled: !!editing },
      { name: "name", label: "Full Name", type: "text", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "phone", label: "Phone", type: "tel" },
      {
        name: "class", label: "Class", type: "select", required: true,
        options: (classes as ClassSection[]).map((c) => ({ label: c.id, value: c.id })),
      },
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
      { name: "cgpa", label: "CGPA (0-10)", type: "number", min: 0, max: 10, step: 0.01 },
      { name: "attendance", label: "Attendance %", type: "number", min: 0, max: 100 },
      ...(editing
        ? ([
            { name: "password", label: "Reset Password (optional)", type: "password", placeholder: "Leave blank to keep current" },
          ] as FieldDef[])
        : ([
            { name: "username", label: "Login Username (optional)", type: "text", placeholder: "Defaults to roll number" },
            { name: "password", label: "Login Password", type: "password", required: true, placeholder: "Min 8 characters" },
          ] as FieldDef[])),
    ],
    [depts, classes, editing],
  );


  const handleSubmit = async (values: Record<string, any>) => {
    const payload = {
      ...values,
      cgpa: values.cgpa === "" ? 0 : Number(values.cgpa),
      attendance: values.attendance === "" ? 0 : Number(values.attendance),
    };
    if (editing) {
      await update.mutateAsync({ id: editing.id, data: payload });
      toast.success("Student updated");
    } else {
      await create.mutateAsync(payload);
      toast.success("Student added");
    }
    setOpenForm(false);
    setEditing(null);
  };

  const cols: Column<Student>[] = [
    { key: "id", header: "Roll No", className: "font-mono text-xs" },
    {
      key: "name", header: "Name",
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-xs font-semibold text-primary-foreground">
            {r.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
          <div>
            <div className="font-medium">{r.name}</div>
            <div className="text-xs text-muted-foreground">{r.email}</div>
          </div>
        </div>
      ),
    },
    { key: "class", header: "Class", render: (r) => <Badge tone="info">{r.class}</Badge> },
    { key: "dept", header: "Dept" },
    { key: "year", header: "Year" },
    { key: "cgpa", header: "CGPA", render: (r) => <span className="font-semibold">{r.cgpa}</span> },
    {
      key: "attendance", header: "Attendance",
      render: (r) => (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${r.attendance >= 75 ? "bg-success" : "bg-destructive"}`}
              style={{ width: `${r.attendance}%` }}
            />
          </div>
          <span className="text-xs font-medium tabular-nums">{r.attendance}%</span>
        </div>
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
        title="Student Management"
        description="View and manage all enrolled students."
        actions={
          <Button
            onClick={() => { setEditing(null); setOpenForm(true); }}
            className="gap-2 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:brightness-110"
          >
            <Plus className="h-4 w-4" /> Add Student
          </Button>
        }
      />
      {isLoading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>
      ) : (
        <DataTable data={students as Student[]} columns={cols} searchKeys={["name", "id", "class", "dept", "email"]} />
      )}

      <CrudDialog
        open={openForm}
        onOpenChange={(o) => { setOpenForm(o); if (!o) setEditing(null); }}
        title={editing ? "Edit Student" : "Add Student"}
        fields={fields}
        initial={editing ?? undefined}
        submitting={create.isPending || update.isPending}
        onSubmit={handleSubmit}
      />

      <ConfirmDelete
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete ${deleting?.name ?? "student"}?`}
        loading={remove.isPending}
        onConfirm={async () => {
          if (!deleting) return;
          await remove.mutateAsync(deleting.id);
          toast.success("Student deleted");
          setDeleting(null);
        }}
      />
    </div>
  );
}
