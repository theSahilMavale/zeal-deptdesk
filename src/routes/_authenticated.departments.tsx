import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Building2, Users, GraduationCap, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, PageHeader } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { RequireRole } from "@/lib/auth";
import { AccessDenied } from "@/components/access-denied";
import { CrudDialog, ConfirmDelete, type FieldDef } from "@/components/crud-dialog";
import { departmentsHooks, facultyHooks } from "@/lib/api";
import type { Department, Faculty } from "@/lib/api/types";

export const Route = createFileRoute("/_authenticated/departments")({
  head: () => ({ meta: [{ title: "Departments — DeptDesk ERP" }] }),
  component: () => (
    <RequireRole roles={["admin"]} fallback={<AccessDenied />}>
      <DeptsPage />
    </RequireRole>
  ),
});

function DeptsPage() {
  const { data: depts = [], isLoading } = departmentsHooks.useList();
  const { data: faculty = [] } = facultyHooks.useList();
  const create = departmentsHooks.useCreate();
  const update = departmentsHooks.useUpdate();
  const remove = departmentsHooks.useRemove();

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [deleting, setDeleting] = useState<Department | null>(null);

  const fields: FieldDef[] = useMemo(
    () => [
      { name: "code", label: "Code", type: "text", required: true, placeholder: "CO" },
      { name: "name", label: "Name", type: "text", required: true, placeholder: "Computer Engineering" },
      {
        name: "hod",
        label: "Head of Department",
        type: "select",
        allowEmpty: true,
        options: (faculty as Faculty[]).map((f) => ({ label: `${f.name} (${f.id})`, value: f.id })),
      },
      { name: "established", label: "Established", type: "date" },
      { name: "description", label: "Description", type: "textarea", rows: 3 },
    ],
    [faculty],
  );

  const handleSubmit = async (values: Record<string, any>) => {
    const payload: Partial<Department> = {
      code: values.code,
      name: values.name,
      hod: values.hod || null,
      established: values.established || null,
      description: values.description || "",
    };
    if (editing) {
      await update.mutateAsync({ id: editing.code, data: payload });
      toast.success("Department updated");
    } else {
      await create.mutateAsync(payload);
      toast.success("Department created");
    }
    setOpenForm(false);
    setEditing(null);
  };

  return (
    <div>
      <PageHeader
        title="Departments"
        description="Academic departments at Zeal Polytechnic."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setOpenForm(true);
            }}
            className="gap-2 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:brightness-110"
          >
            <Plus className="h-4 w-4" /> New Department
          </Button>
        }
      />

      {isLoading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading departments…</div>
      ) : depts.length === 0 ? (
        <Card className="text-center text-sm text-muted-foreground">No departments yet.</Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {(depts as Department[]).map((d) => (
            <Card key={d.code} className="flex flex-col">
              <div className="flex items-start justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
                  <Building2 className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {d.code}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-bold text-foreground">{d.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Head: {d.hod_name || "—"}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" /> Faculty
                  </div>
                  <div className="mt-1 text-xl font-bold text-foreground">{d.faculty ?? 0}</div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <GraduationCap className="h-3.5 w-3.5" /> Students
                  </div>
                  <div className="mt-1 text-xl font-bold text-foreground">{d.students ?? 0}</div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => {
                    setEditing(d);
                    setOpenForm(true);
                  }}
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button
                  variant="outline"
                  className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10"
                  onClick={() => setDeleting(d)}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <CrudDialog
        open={openForm}
        onOpenChange={(o) => {
          setOpenForm(o);
          if (!o) setEditing(null);
        }}
        title={editing ? "Edit Department" : "New Department"}
        fields={fields}
        initial={editing ?? undefined}
        submitting={create.isPending || update.isPending}
        onSubmit={handleSubmit}
      />

      <ConfirmDelete
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete ${deleting?.name ?? "department"}?`}
        loading={remove.isPending}
        onConfirm={async () => {
          if (!deleting) return;
          await remove.mutateAsync(deleting.code);
          toast.success("Department deleted");
          setDeleting(null);
        }}
      />
    </div>
  );
}
