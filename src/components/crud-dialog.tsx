import { useEffect, useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type FieldBase = { showWhen?: (values: Record<string, any>) => boolean };

export type FieldDef = FieldBase &
  (
    | {
        name: string;
        label: string;
        type: "text" | "email" | "tel" | "number" | "date" | "time";
        required?: boolean;
        placeholder?: string;
        min?: number;
        max?: number;
        step?: number;
        disabled?: boolean;
        className?: string;
      }
    | {
        name: string;
        label: string;
        type: "textarea";
        required?: boolean;
        placeholder?: string;
        rows?: number;
        className?: string;
      }
    | {
        name: string;
        label: string;
        type: "switch";
        className?: string;
      }
    | {
        name: string;
        label: string;
        type: "select";
        options: { label: string; value: string | number }[];
        required?: boolean;
        placeholder?: string;
        className?: string;
        allowEmpty?: boolean;
      }
    | {
        name: string;
        label: string;
        type: "multiselect";
        options: { label: string; value: string }[];
        className?: string;
      }
    | {
        name: string;
        label: string;
        type: "file";
        accept?: string;
        required?: boolean;
        className?: string;
      }
  );

export type CrudValues = Record<string, any>;

interface CrudDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  fields: FieldDef[];
  initial?: CrudValues;
  submitting?: boolean;
  submitLabel?: string;
  onSubmit: (values: CrudValues) => Promise<unknown> | unknown;
}

export function CrudDialog({
  open,
  onOpenChange,
  title,
  description,
  fields,
  initial,
  submitting,
  submitLabel = "Save",
  onSubmit,
}: CrudDialogProps) {
  const [values, setValues] = useState<CrudValues>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      const seed: CrudValues = {};
      fields.forEach((f) => {
        const v = initial?.[f.name];
        if (f.type === "switch") seed[f.name] = Boolean(v);
        else if (f.type === "multiselect") seed[f.name] = Array.isArray(v) ? v : [];
        else seed[f.name] = v ?? "";
      });
      setValues(seed);
      setErrors({});
    }
  }, [open, initial, fields]);

  const set = (name: string, value: any) =>
    setValues((s) => ({ ...s, [name]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    for (const f of fields) {
      const v = values[f.name];
      if ("required" in f && f.required) {
        const empty =
          v === undefined ||
          v === null ||
          (typeof v === "string" && !v.trim()) ||
          (Array.isArray(v) && v.length === 0);
        if (empty) errs[f.name] = `${f.label} is required.`;
      }
      if (f.type === "number" && v !== "" && v !== undefined && v !== null) {
        const n = Number(v);
        if (Number.isNaN(n)) errs[f.name] = `${f.label} must be a number.`;
        else {
          if (f.min !== undefined && n < f.min) errs[f.name] = `Min ${f.min}.`;
          if (f.max !== undefined && n > f.max) errs[f.name] = `Max ${f.max}.`;
        }
      }
      if (f.type === "email" && v) {
        if (!/^\S+@\S+\.\S+$/.test(String(v))) errs[f.name] = "Invalid email.";
      }
    }
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    // Normalize numeric values
    const payload: CrudValues = { ...values };
    fields.forEach((f) => {
      if (f.type === "number" && payload[f.name] !== "" && payload[f.name] != null) {
        payload[f.name] = Number(payload[f.name]);
      }
    });
    try {
      await onSubmit(payload);
    } catch (err: any) {
      const data = err?.response?.data;
      if (data && typeof data === "object") {
        const fieldErrs: Record<string, string> = {};
        Object.entries(data).forEach(([k, v]) => {
          fieldErrs[k] = Array.isArray(v) ? String(v[0]) : String(v);
        });
        setErrors(fieldErrs);
        const msg = data.detail || Object.values(fieldErrs)[0] || "Save failed.";
        toast.error(String(msg));
      } else {
        toast.error(err?.message ?? "Save failed.");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-2">
          {fields.map((f) => (
            <FieldRow
              key={f.name}
              field={f}
              value={values[f.name]}
              onChange={(v) => set(f.name, v)}
              error={errors[f.name]}
            />
          ))}

          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:brightness-110"
            >
              {submitting ? "Saving…" : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FieldRow({
  field,
  value,
  onChange,
  error,
}: {
  field: FieldDef;
  value: any;
  onChange: (v: any) => void;
  error?: string;
}) {
  const id = `f-${field.name}`;
  const required = "required" in field && field.required;
  return (
    <div className={field.className}>
      <Label htmlFor={id}>
        {field.label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      <div className="mt-1.5">
        {field.type === "textarea" ? (
          <Textarea
            id={id}
            rows={field.rows ?? 3}
            placeholder={field.placeholder}
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
        ) : field.type === "switch" ? (
          <div className="flex items-center gap-3 py-1.5">
            <Switch checked={Boolean(value)} onCheckedChange={onChange} id={id} />
            <span className="text-sm text-muted-foreground">
              {value ? "Enabled" : "Disabled"}
            </span>
          </div>
        ) : field.type === "select" ? (
          <Select
            value={value !== undefined && value !== null && value !== "" ? String(value) : ""}
            onValueChange={(v) => onChange(v === "__empty__" ? "" : v)}
          >
            <SelectTrigger id={id}>
              <SelectValue placeholder={field.placeholder ?? "Select…"} />
            </SelectTrigger>
            <SelectContent>
              {field.allowEmpty && <SelectItem value="__empty__">—</SelectItem>}
              {field.options.map((o) => (
                <SelectItem key={String(o.value)} value={String(o.value)}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : field.type === "multiselect" ? (
          <MultiSelectChips
            options={field.options}
            value={Array.isArray(value) ? value : []}
            onChange={onChange}
          />
        ) : field.type === "file" ? (
          <Input
            id={id}
            type="file"
            accept={field.accept}
            onChange={(e) => onChange(e.target.files?.[0] ?? null)}
          />
        ) : (
          <Input
            id={id}
            type={field.type}
            placeholder={"placeholder" in field ? field.placeholder : undefined}
            min={"min" in field ? field.min : undefined}
            max={"max" in field ? field.max : undefined}
            step={"step" in field ? field.step : undefined}
            disabled={"disabled" in field ? field.disabled : undefined}
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function MultiSelectChips({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (v: string) =>
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  return (
    <div className="flex flex-wrap gap-1.5 rounded-md border border-input bg-background p-2 min-h-[40px]">
      {options.length === 0 && (
        <span className="text-xs text-muted-foreground">No options</span>
      )}
      {options.map((o) => {
        const active = value.includes(o.value);
        return (
          <button
            type="button"
            key={o.value}
            onClick={() => toggle(o.value)}
            className={
              "rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors border " +
              (active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-muted text-muted-foreground hover:border-primary/40")
            }
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

interface ConfirmDeleteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: ReactNode;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
}

export function ConfirmDelete({
  open,
  onOpenChange,
  title = "Delete this item?",
  description = "This action cannot be undone.",
  onConfirm,
  loading,
}: ConfirmDeleteProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={(e) => {
              e.preventDefault();
              void onConfirm();
            }}
          >
            {loading ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
