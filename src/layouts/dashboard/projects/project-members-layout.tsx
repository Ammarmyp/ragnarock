"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Check } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  useAddProjectMember,
  useProjectMembers,
  useRemoveProjectMember,
  useUpdateProjectMemberPersonas,
} from "@/hooks/use-projects";
import { toast } from "@/lib/toast";
import type { ProjectPersona } from "@/api/projects.api";
import { PROJECT_PERSONA_LABELS } from "@/api/projects.api";

const ROLE_OPTIONS = ["owner", "admin", "member", "viewer"] as const;
const PERSONA_OPTIONS: ProjectPersona[] = [
  "business_owner",
  "developer",
  "qa_engineer",
  "project_manager",
  "stakeholder",
];

const memberSchema = z.object({
  email: z.string().email("Valid email is required"),
  role: z.enum(ROLE_OPTIONS),
});

// ─── Multi-persona picker ──────────────────────────────────────────────────

function PersonaMultiPicker({
  value,
  onChange,
  disabled,
}: {
  value: ProjectPersona[];
  onChange: (next: ProjectPersona[]) => void;
  disabled?: boolean;
}) {
  const toggle = (p: ProjectPersona) => {
    onChange(value.includes(p) ? value.filter((x) => x !== p) : [...value, p]);
  };

  const label =
    value.length === 0
      ? "No personas"
      : value.length === 1
        ? PROJECT_PERSONA_LABELS[value[0]!]
        : `${value.length} personas`;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          className="h-7 min-w-[9rem] justify-between gap-1 px-2 text-xs font-normal"
        >
          <span className="truncate">{label}</span>
          <span className="shrink-0 text-muted-foreground opacity-60">▾</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-48 p-1">
        {PERSONA_OPTIONS.map((p) => {
          const checked = value.includes(p);
          return (
            <button
              key={p}
              type="button"
              onClick={() => toggle(p)}
              className={cn(
                "flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs transition-colors",
                checked ? "bg-primary/10 text-primary" : "hover:bg-muted",
              )}
            >
              <span className={cn("flex size-3.5 items-center justify-center rounded-sm border", checked ? "border-primary bg-primary" : "border-border")}>
                {checked && <Check className="size-2.5 text-primary-foreground" />}
              </span>
              {PROJECT_PERSONA_LABELS[p]}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}

// ─── Main layout ───────────────────────────────────────────────────────────

export function ProjectMembersLayout({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{ userId: string; label: string } | null>(null);

  const { data } = useProjectMembers(projectId);
  const addMember = useAddProjectMember({
    onSuccess: () => { toast.success("Member added"); setOpen(false); },
  });
  const removeMember = useRemoveProjectMember({
    onSuccess: () => { toast.success("Member removed"); setMemberToRemove(null); },
  });
  const updatePersonas = useUpdateProjectMemberPersonas();

  const form = useForm({
    defaultValues: { email: "", role: "member" as (typeof ROLE_OPTIONS)[number] },
    validators: { onSubmit: memberSchema },
    onSubmit: async ({ value }) => {
      await addMember.mutateAsync({
        id: projectId,
        data: { email: value.email, role: value.role },
      });
      form.reset();
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Members</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">Add Member</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Member</DialogTitle>
              <DialogDescription>Add an organization member to this project.</DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
              <form.Field name="email">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Member Email</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="teammate@company.com"
                      />
                      <FieldDescription>
                        If the user already has an account, they will be added to this project.
                      </FieldDescription>
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              </form.Field>
              <form.Field name="role">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Role</FieldLabel>
                      <Select
                        value={field.state.value}
                        onValueChange={(v) => field.handleChange(v as (typeof ROLE_OPTIONS)[number])}
                      >
                        <SelectTrigger id={field.name} aria-invalid={isInvalid}>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLE_OPTIONS.map((role) => (
                            <SelectItem key={role} value={role} className="capitalize">{role}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldDescription>Select the member&apos;s project role.</FieldDescription>
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              </form.Field>
              <DialogFooter>
                <Button type="submit">Add</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent className="space-y-2">
        {data?.map((member) => {
          const personas = member.personas ?? [];
          return (
            <div key={member.id} className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="font-medium">{member.user?.name || member.user?.email || member.userId}</p>
                <div className="mt-0.5 flex flex-wrap gap-1">
                  {personas.length === 0 ? (
                    <span className="text-xs text-muted-foreground">No personas</span>
                  ) : personas.map((p) => (
                    <Badge key={p} variant="secondary" className="text-[10px] font-normal capitalize">
                      {PROJECT_PERSONA_LABELS[p]}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <PersonaMultiPicker
                  value={personas}
                  onChange={(next) =>
                    void updatePersonas.mutateAsync({ projectId, userId: member.userId, personas: next })
                  }
                  disabled={updatePersonas.isPending}
                />
                <span className="text-xs capitalize text-muted-foreground">{member.role}</span>
                {member.role !== "owner" && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setMemberToRemove({
                      userId: member.userId,
                      label: member.user?.name || member.user?.email || member.userId,
                    })}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>

      <AlertDialog open={memberToRemove !== null} onOpenChange={(o) => !o && setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove project member?</AlertDialogTitle>
            <AlertDialogDescription>
              {memberToRemove
                ? `This will remove ${memberToRemove.label} from this project.`
                : "This will remove the selected member from this project."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeMember.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={removeMember.isPending || !memberToRemove}
              onClick={(e) => {
                e.preventDefault();
                if (!memberToRemove) return;
                void removeMember.mutateAsync({ projectId, userId: memberToRemove.userId });
              }}
            >
              {removeMember.isPending ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
