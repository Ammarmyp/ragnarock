"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAddProjectMember, useProjectMembers } from "@/hooks/use-projects";
import { toast } from "@/lib/toast";

const memberSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  role: z.string().min(1),
});

export function ProjectMembersLayout({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const { data } = useProjectMembers(projectId);
  const addMember = useAddProjectMember({
    onSuccess: () => {
      toast.success("Member added");
      setOpen(false);
    },
  });

  const form = useForm({
    defaultValues: { userId: "", role: "member" },
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
              <form.Field name="userId">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>User ID</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                      />
                      <FieldDescription>Use the organization member user id.</FieldDescription>
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
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value as "owner" | "admin" | "member" | "viewer")}
                        aria-invalid={isInvalid}
                      />
                      <FieldDescription>Use one of: owner, admin, member, viewer.</FieldDescription>
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
            <span className="text-xs capitalize text-muted-foreground">{member.role}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
