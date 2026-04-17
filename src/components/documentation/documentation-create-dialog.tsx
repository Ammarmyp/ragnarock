"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import type { DocumentationType } from "@/api/projects.api";
import { DOCUMENTATION_TYPE_ORDER } from "@/lib/documentation-labels";
import { DocumentationMdEditor } from "@/components/documentation/documentation-md-editor";
import { DocumentationTypeDropdown } from "@/components/documentation/documentation-type-dropdown";
import { useCreateProjectDocumentation } from "@/hooks/use-projects";
import { toast } from "@/lib/toast";

const createDocSchema = z.object({
  title: z.string().min(3, "Title is too short"),
  type: z.enum(DOCUMENTATION_TYPE_ORDER),
  content: z.string().min(1, "Content is required"),
});

type DocumentationCreateDialogProps = {
  projectId: string;
};

export function DocumentationCreateDialog({ projectId }: DocumentationCreateDialogProps) {
  const [open, setOpen] = useState(false);
  const createDocumentation = useCreateProjectDocumentation({
    onSuccess: () => {
      toast.success("Document created");
      setOpen(false);
    },
  });

  const form = useForm({
    defaultValues: { title: "", type: "note" as DocumentationType, content: "" },
    validators: { onSubmit: createDocSchema },
    onSubmit: async ({ value }) => {
      await createDocumentation.mutateAsync({
        projectId,
        data: { title: value.title, type: value.type, content: value.content },
      });
      form.reset();
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1 size-4" />
          New document
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[min(90vh,900px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="shrink-0 border-b px-6 py-4">
          <DialogTitle>Create documentation</DialogTitle>
          <DialogDescription>Add a project document. Content is stored as Markdown.</DialogDescription>
        </DialogHeader>
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
            <form.Field name="title">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="type">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Document category</FieldLabel>
                    <FieldDescription>BRD, SRS, ADR, release notes, and other types.</FieldDescription>
                    <DocumentationTypeDropdown
                      id={field.name}
                      value={field.state.value}
                      onChange={(v) => field.handleChange(v)}
                      disabled={createDocumentation.isPending}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="content">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Content</FieldLabel>
                    <div id={field.name} className="mt-1">
                      <DocumentationMdEditor
                        value={field.state.value}
                        onChange={(v) => field.handleChange(v)}
                        height={360}
                      />
                    </div>
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>
          </div>
          <DialogFooter className="shrink-0 border-t px-6 py-4">
            <Button type="submit" disabled={createDocumentation.isPending}>
              {createDocumentation.isPending ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
