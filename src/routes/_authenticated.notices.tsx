import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Pin, Plus, Calendar, User, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, PageHeader } from "@/components/page-shell";
import { Badge } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { CrudDialog, ConfirmDelete, type FieldDef } from "@/components/crud-dialog";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { noticesHooks, departmentsHooks } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Notice, Department } from "@/lib/api/types";

export const Route = createFileRoute("/_authenticated/notices")({
  head: () => ({ meta: [{ title: "Notices — DeptDesk ERP" }] }),
  component: NoticesPage,
});

function catTone(c: string) {
  if (c === "Exam" || c === "Urgent") return "danger" as const;
  if (c === "Event") return "info" as const;
  if (c === "Academic") return "success" as const;
  if (c === "Holiday") return "warning" as const;
  return "default" as const;
}

const CATEGORIES = ["General", "Exam", "Event", "Holiday", "Academic", "Urgent"];
const AUDIENCES = [
  { label: "Everyone", value: "all" },
  { label: "Students", value: "students" },
  { label: "Faculty", value: "faculty" },
  { label: "Department", value: "department" },
];

function NoticesPage() {
  const { user } = useAuth();
  const canManage = user?.role === "admin" || user?.role === "faculty";

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");

  const params = useMemo(() => {
    const p: Record<string, string> = {};
    if (search) p.search = search;
    if (category !== "all") p.category = category;
    return p;
  }, [search, category]);

  const { data: notices = [], isLoading } = noticesHooks.useList(params);
  const { data: depts = [] } = departmentsHooks.useList();
  const create = noticesHooks.useCreate();
  const update = noticesHooks.useUpdate();
  const remove = noticesHooks.useRemove();

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<Notice | null>(null);
  const [deleting, setDeleting] = useState<Notice | null>(null);

  const fields: FieldDef[] = useMemo(() => [
    { name: "title", label: "Title", type: "text", required: true },
    { name: "body", label: "Body", type: "textarea", required: true, rows: 5 },
    {
      name: "category", label: "Category", type: "select", required: true,
      options: CATEGORIES.map((c) => ({ label: c, value: c })),
    },
    { name: "audience", label: "Audience", type: "select", required: true, options: AUDIENCES },
    {
      name: "department", label: "Department (if scoped)", type: "select", allowEmpty: true,
      options: (depts as Department[]).map((d) => ({ label: `${d.code} — ${d.name}`, value: d.code })),
    },
    { name: "pinned", label: "Pin to top", type: "switch" },
  ], [depts]);

  const handleSubmit = async (values: Record<string, any>) => {
    const payload: Partial<Notice> = {
      title: values.title,
      body: values.body,
      category: values.category,
      audience: values.audience,
      department: values.department || null,
      pinned: Boolean(values.pinned),
    };
    if (editing) {
      await update.mutateAsync({ id: editing.id!, data: payload });
      toast.success("Notice updated");
    } else {
      await create.mutateAsync(payload);
      toast.success("Notice published");
    }
    setOpenForm(false);
    setEditing(null);
  };

  const list = notices as Notice[];
  const pinned = list.filter((n) => n.pinned);
  const rest = list.filter((n) => !n.pinned);

  const fmtDate = (n: Notice) => (n.date || n.published_at || "").slice(0, 10);

  return (
    <div>
      <PageHeader
        title="Notices"
        description="Announcements from administration, departments and cells."
        actions={
          canManage ? (
            <Button
              onClick={() => { setEditing(null); setOpenForm(true); }}
              className="gap-2 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:brightness-110"
            >
              <Plus className="h-4 w-4" /> New Notice
            </Button>
          ) : undefined
        }
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Search notices…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:w-72"
        />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>
      ) : list.length === 0 ? (
        <Card className="text-center text-sm text-muted-foreground">No notices found.</Card>
      ) : (
        <>
          {pinned.length > 0 && (
            <>
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Pin className="h-3.5 w-3.5" /> Pinned
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {pinned.map((n) => (
                  <Card key={n.id} className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
                    <div className="flex items-start justify-between gap-3">
                      <Badge tone={catTone(n.category)}>{n.category}</Badge>
                      <Pin className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="mt-3 text-base font-semibold leading-snug text-foreground">{n.title}</h3>
                    {n.body && <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{n.body}</p>}
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{fmtDate(n)}</span>
                        <span className="inline-flex items-center gap-1"><User className="h-3 w-3" />{n.author_name || n.author_username || "—"}</span>
                      </div>
                      {canManage && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => { setEditing(n); setOpenForm(true); }}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleting(n)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}

          <div className="mt-6 mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">All Notices</div>
          <Card className="!p-0">
            <ul className="divide-y divide-border">
              {rest.map((n) => (
                <li key={n.id} className="flex items-center gap-4 p-4 transition-colors hover:bg-accent/40">
                  <Badge tone={catTone(n.category)}>{n.category}</Badge>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-foreground">{n.title}</div>
                    <div className="mt-0.5 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{fmtDate(n)}</span>
                      <span className="inline-flex items-center gap-1"><User className="h-3 w-3" />{n.author_name || n.author_username || "—"}</span>
                    </div>
                  </div>
                  {canManage && (
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => { setEditing(n); setOpenForm(true); }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleting(n)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}

      <CrudDialog
        open={openForm}
        onOpenChange={(o) => { setOpenForm(o); if (!o) setEditing(null); }}
        title={editing ? "Edit Notice" : "New Notice"}
        fields={fields}
        initial={editing ? { ...editing, department: editing.department ?? "" } : { audience: "all", category: "General", pinned: false }}
        submitting={create.isPending || update.isPending}
        onSubmit={handleSubmit}
      />

      <ConfirmDelete
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete this notice?`}
        loading={remove.isPending}
        onConfirm={async () => {
          if (!deleting) return;
          await remove.mutateAsync(deleting.id!);
          toast.success("Notice deleted");
          setDeleting(null);
        }}
      />
    </div>
  );
}
