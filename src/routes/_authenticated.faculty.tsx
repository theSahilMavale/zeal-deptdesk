import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Mail, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-shell";
import { DataTable, Badge, type Column } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { CrudDialog, ConfirmDelete, type FieldDef } from "@/components/crud-dialog";
import { RequireRole } from "@/lib/auth";
import { AccessDenied } from "@/components/access-denied";
import { facultyHooks, departmentsHooks, subjectsHooks } from "@/lib/api";
import type { Faculty, Department, Subject } from "@/lib/api/types";

export const Route = createFileRoute("/_authenticated/faculty")({
  head: () => ({ meta: [{ title: "Faculty — DeptDesk ERP" }] }),
  component: () => (
    <RequireRole roles={["admin"]} fallback={<AccessDenied />}>
      <FacultyPage />
    </RequireRole>
  ),
});

function FacultyPage() {
  const { data: faculty = [], isLoading } = facultyHooks.useList();
  const { data: depts = [] } = departmentsHooks.useList();
  const { data: subjects = [] } = subjectsHooks.useList();
  const create = facultyHooks.useCreate();
  const update = facultyHooks.useUpdate();
  const remove = facultyHooks.useRemove();

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<Faculty | null>(null);
  const [deleting, setDeleting] = useState<Faculty | null>(null);

  const fields: FieldDef[] = useMemo(
    () => [
      { name: "id", label: "Employee ID", type: "text", required: true, placeholder: "F101", disabled: !!editing },
      { name: "name", label: "Name", type: "text", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "phone", label: "Phone", type: "tel" },
      {
        name: "dept", label: "Department", type: "select", required: true,
        options: (depts as Department[]).map((d) => ({ label: `${d.code} — ${d.name}`, value: d.code })),
      },
      {
        name: "designation", label: "Designation", type: "select", required: true,
        options: [
          { label: "Professor", value: "Professor" },
          { label: "Associate Professor", value: "Associate Professor" },
          { label: "Assistant Professor", value: "Assistant Professor" },
          { label: "Lecturer", value: "Lecturer" },
        ],
      },
      {
        name: "subjects", label: "Subjects", type: "multiselect",
        options: (subjects as Subject[]).map((s) => ({ label: `${s.code} ${s.name}`, value: s.code })),
      },
      { name: "experience", label: "Experience (years)", type: "number", min: 0, max: 60 },
      ...(editing
        ? ([
            { name: "password", label: "Reset Password (optional)", type: "password", placeholder: "Leave blank to keep current" },
          ] as FieldDef[])
        : ([
            { name: "username", label: "Login Username (optional)", type: "text", placeholder: "Defaults to employee ID" },
            { name: "password", label: "Password", type: "password", required: true, placeholder: "Min 8 chars, letters & numbers" },
            { name: "password_confirm", label: "Confirm Password", type: "password", required: true, placeholder: "Re-enter password" },
          ] as FieldDef[])),
    ],
    [depts, subjects, editing],
  );

  const handleSubmit = async (values: Record<string, any>) => {
    if (!editing) {
      const pwd = String(values.password ?? "");
      const confirm = String(values.password_confirm ?? "");
      if (pwd.length < 8) {
        toast.error("Password must be at least 8 characters.");
        throw new Error("weak-password");
      }
      if (!/[A-Za-z]/.test(pwd) || !/\d/.test(pwd)) {
        toast.error("Password must contain both letters and numbers.");
        throw new Error("weak-password");
      }
      if (pwd !== confirm) {
        toast.error("Passwords do not match.");
        throw new Error("password-mismatch");
      }
      const email = String(values.email ?? "").trim().toLowerCase();
      if ((faculty as Faculty[]).some((f) => f.email?.toLowerCase() === email)) {
        toast.error("A faculty member with this email already exists.");
        throw new Error("duplicate-email");
      }
    }

    const { password_confirm: _pc, ...rest } = values;
    const payload: Partial<Faculty> & { username?: string; password?: string } = {
      id: rest.id,
      name: rest.name,
      email: rest.email,
      phone: rest.phone || "",
      dept: rest.dept,
      designation: rest.designation,
      subjects: rest.subjects ?? [],
      experience: Number(rest.experience || 0),
    };
    if (rest.username) payload.username = rest.username;
    if (rest.password) payload.password = rest.password;

    if (editing) {
      await update.mutateAsync({ id: editing.id, data: payload });
      toast.success("Faculty updated");
    } else {
      await create.mutateAsync(payload);
      toast.success("Faculty added — login is ready");
    }
    setOpenForm(false);
    setEditing(null);
  };


  const cols: Column<Faculty>[] = [
    { key: "id", header: "ID", className: "font-mono text-xs" },
    {
      key: "name", header: "Faculty",
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-xs font-semibold text-primary-foreground">
            {r.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
          <div>
            <div className="font-medium">{r.name}</div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{r.email}</span>
            </div>
          </div>
        </div>
      ),
    },
    { key: "dept", header: "Dept", render: (r) => <Badge tone="info">{r.dept}</Badge> },
    {
      key: "designation", header: "Designation",
      render: (r) => <Badge tone={r.designation === "Professor" ? "success" : "default"}>{r.designation}</Badge>,
    },
    { key: "subjects", header: "Subjects", render: (r) => (r.subjects ?? []).join(", ") || "—" },
    { key: "experience", header: "Experience", render: (r) => `${r.experience} yrs` },
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
        title="Faculty Management"
        description="All teaching staff across departments."
        actions={
          <Button
            onClick={() => { setEditing(null); setOpenForm(true); }}
            className="gap-2 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:brightness-110"
          >
            <Plus className="h-4 w-4" /> Add Faculty
          </Button>
        }
      />
      {isLoading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>
      ) : (
        <DataTable data={faculty as Faculty[]} columns={cols} searchKeys={["name", "dept", "designation", "id", "email"]} />
      )}

      <CrudDialog
        open={openForm}
        onOpenChange={(o) => { setOpenForm(o); if (!o) setEditing(null); }}
        title={editing ? "Edit Faculty" : "Add Faculty"}
        fields={fields}
        initial={editing ?? undefined}
        submitting={create.isPending || update.isPending}
        onSubmit={handleSubmit}
      />

      <ConfirmDelete
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete ${deleting?.name ?? "faculty"}?`}
        loading={remove.isPending}
        onConfirm={async () => {
          if (!deleting) return;
          await remove.mutateAsync(deleting.id);
          toast.success("Faculty removed");
          setDeleting(null);
        }}
      />
    </div>
  );
}
