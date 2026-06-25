import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-shell";
import { DataTable, Badge, type Column } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { CrudDialog, ConfirmDelete, type FieldDef } from "@/components/crud-dialog";
import { RequireRole } from "@/lib/auth";
import { AccessDenied } from "@/components/access-denied";
import { usersHooks } from "@/lib/api";
import type { AppUser } from "@/lib/api/types";

export const Route = createFileRoute("/_authenticated/users")({
  head: () => ({ meta: [{ title: "Users — DeptDesk ERP" }] }),
  component: () => (
    <RequireRole roles={["admin"]} fallback={<AccessDenied />}>
      <UsersPage />
    </RequireRole>
  ),
});

function UsersPage() {
  const { data: users = [], isLoading } = usersHooks.useList();
  const create = usersHooks.useCreate();
  const update = usersHooks.useUpdate();
  const remove = usersHooks.useRemove();

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<AppUser | null>(null);
  const [deleting, setDeleting] = useState<AppUser | null>(null);

  const fields: FieldDef[] = useMemo(() => [
    { name: "username", label: "Username", type: "text", required: true, disabled: !!editing },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "first_name", label: "First name", type: "text" },
    { name: "last_name", label: "Last name", type: "text" },
    { name: "phone", label: "Phone", type: "tel" },
    {
      name: "role", label: "Role", type: "select", required: true,
      options: [
        { label: "Admin", value: "admin" },
        { label: "Faculty", value: "faculty" },
        { label: "Student", value: "student" },
      ],
    },
    { name: "password", label: editing ? "New password (leave blank to keep)" : "Password", type: "text", required: !editing },
    { name: "is_active", label: "Active", type: "switch" },
  ], [editing]);

  const handleSubmit = async (values: Record<string, any>) => {
    const payload: Partial<AppUser> = {
      username: values.username,
      email: values.email,
      first_name: values.first_name || "",
      last_name: values.last_name || "",
      phone: values.phone || "",
      role: values.role,
      is_active: Boolean(values.is_active),
    };
    if (values.password) payload.password = values.password;

    if (editing) {
      await update.mutateAsync({ id: editing.id, data: payload });
      toast.success("User updated");
    } else {
      await create.mutateAsync(payload);
      toast.success("User created");
    }
    setOpenForm(false);
    setEditing(null);
  };

  const cols: Column<AppUser>[] = [
    { key: "id", header: "ID", className: "font-mono text-xs text-muted-foreground" },
    {
      key: "name", header: "Name",
      render: (r) => {
        const name = r.name || `${r.first_name ?? ""} ${r.last_name ?? ""}`.trim() || r.username;
        return (
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <span className="font-medium">{name}</span>
          </div>
        );
      },
    },
    { key: "email", header: "Email", render: (r) => <span className="text-muted-foreground">{r.email}</span> },
    {
      key: "role", header: "Role",
      render: (r) => (
        <Badge tone={r.role === "admin" ? "info" : r.role === "faculty" ? "success" : "default"}>
          {String(r.role).replace(/^./, (c) => c.toUpperCase())}
        </Badge>
      ),
    },
    {
      key: "is_active", header: "Status",
      render: (r) => <Badge tone={r.is_active ? "success" : "default"}>{r.is_active ? "Active" : "Inactive"}</Badge>,
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
        title="User Management"
        description="Manage admins, faculty and student accounts."
        actions={
          <Button
            onClick={() => { setEditing(null); setOpenForm(true); }}
            className="gap-2 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:brightness-110"
          >
            <Plus className="h-4 w-4" /> New User
          </Button>
        }
      />
      {isLoading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>
      ) : (
        <DataTable data={users as AppUser[]} columns={cols} searchKeys={["username", "email", "first_name", "last_name"]} />
      )}

      <CrudDialog
        open={openForm}
        onOpenChange={(o) => { setOpenForm(o); if (!o) setEditing(null); }}
        title={editing ? "Edit User" : "New User"}
        fields={fields}
        initial={editing ?? { is_active: true, role: "student" }}
        submitting={create.isPending || update.isPending}
        onSubmit={handleSubmit}
      />

      <ConfirmDelete
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete ${deleting?.username ?? "user"}?`}
        loading={remove.isPending}
        onConfirm={async () => {
          if (!deleting) return;
          await remove.mutateAsync(deleting.id);
          toast.success("User deleted");
          setDeleting(null);
        }}
      />
    </div>
  );
}
