"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAddProjectMember, useProjectMembers, useRemoveProjectMember } from "@/hooks/use-projects";
import { toast } from "@/lib/toast";

const ROLE_OPTIONS = ["owner", "admin", "member", "viewer"] as const;

const memberSchema = z.object({
  email: z.string().email("Valid email is required"),
  role: z.enum(ROLE_OPTIONS),
});

export function ProjectMembersLayout({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{
    userId: string;
    label: string;
  } | null>(null);
  const { data } = useProjectMembers(projectId);
  const addMember = useAddProjectMember({
    onSuccess: () => {
      toast.success("Member added");
      setOpen(false);
    },
  });
  const removeMember = useRemoveProjectMember({
    onSuccess: () => {
      toast.success("Member removed");
      setMemberToRemove(null);
    },
  });

  const form = useForm({
    defaultValues: { email: "", role: "member" },
    validators: { onSubmit: memberSchema },
    onSubmit: async ({ value }) => {
      await addMember.mutateAsync({ id: projectId, data: value as never });
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
            <form
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
            >
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
                        onValueChange={(value) =>
                          field.handleChange(value as (typeof ROLE_OPTIONS)[number])
                        }
                      >
                        <SelectTrigger id={field.name} aria-invalid={isInvalid}>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLE_OPTIONS.map((role) => (
                            <SelectItem key={role} value={role} className="capitalize">
                              {role}
                            </SelectItem>
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
        {data?.map((member) => (
          <div key={member.id} className="flex items-center justify-between rounded-md border p-3">
            <div>
              <p className="font-medium">{member.user?.name || member.user?.email || member.userId}</p>
              <p className="text-xs text-muted-foreground">{member.user?.email || member.userId}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs capitalize text-muted-foreground">{member.role}</span>
              {member.role !== "owner" && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setMemberToRemove({
                      userId: member.userId,
                      label: member.user?.name || member.user?.email || member.userId,
                    })
                  }
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
      <AlertDialog open={memberToRemove !== null} onOpenChange={(openState) => !openState && setMemberToRemove(null)}>
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
              onClick={(event) => {
                event.preventDefault();
                if (!memberToRemove) return;
                void removeMember.mutateAsync({
                  projectId,
                  userId: memberToRemove.userId,
                });
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
