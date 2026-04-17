"use client";

import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { DocumentationType, ProjectDocumentation } from "@/api/projects.api";
import { DOCUMENTATION_TYPE_ORDER } from "@/lib/documentation-labels";
import { DocumentationTypeDropdown } from "@/components/documentation/documentation-type-dropdown";
import { DocumentationStatusDropdown } from "@/components/documentation/documentation-status-dropdown";
import type { UpdateProjectDocumentationDto } from "@/api/projects.api";

const metaSchema = z.object({
  title: z.string().min(3),
  type: z.enum(DOCUMENTATION_TYPE_ORDER),
  status: z.enum(["draft", "pending_review", "completed", "rejected"]),
});

type DocumentationDetailMetadataFormProps = {
  doc: ProjectDocumentation;
  onSave: (data: UpdateProjectDocumentationDto) => Promise<void>;
  isPending: boolean;
};

export function DocumentationDetailMetadataForm({ doc, onSave, isPending }: DocumentationDetailMetadataFormProps) {
  const form = useForm({
    defaultValues: {
      title: "",
      type: "note" as DocumentationType,
      status: "draft" as "draft" | "pending_review" | "completed" | "rejected",
    },
    validators: { onSubmit: metaSchema },
    onSubmit: async ({ value }) => {
      await onSave({ title: value.title, type: value.type, status: value.status });
    },
  });

  useEffect(() => {
    form.reset({
      title: doc.title,
      type: doc.type,
      status: doc.status,
    });
  }, [doc, form]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-3 rounded-lg border bg-muted/20 p-4"
    >
      <p className="text-sm font-medium">Metadata</p>
      <form.Field name="title">
        {(field) => {
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={field.name}>Title</FieldLabel>
              <Input
                id={field.name}
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
      <div className="grid gap-4 md:grid-cols-2">
        <form.Field name="type">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel>Type</FieldLabel>
                <DocumentationTypeDropdown
                  value={field.state.value}
                  onChange={(v) => field.handleChange(v)}
                  disabled={isPending}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>
        <form.Field name="status">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel>Status</FieldLabel>
                <DocumentationStatusDropdown
                  value={field.state.value}
                  onChange={(v) => field.handleChange(v)}
                  disabled={isPending}
                />
                <FieldDescription>Lifecycle state for this document.</FieldDescription>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>
      </div>
      <Button type="submit" size="sm" disabled={isPending}>
        <Save className="mr-1 size-4" />
        Save metadata
      </Button>
    </form>
  );
}
