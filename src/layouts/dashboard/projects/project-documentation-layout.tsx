"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateProjectDocumentation, useProjectDocumentations } from "@/hooks/use-projects";
import { toast } from "@/lib/toast";

const documentationSchema = z.object({
  title: z.string().min(3),
  type: z.string().min(1),
  content: z.string().min(10, "Content is required"),
});

export function ProjectDocumentationLayout({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const { data } = useProjectDocumentations(projectId, { page: 1, limit: 50 });
  const createDocumentation = useCreateProjectDocumentation({
    onSuccess: () => {
      toast.success("Document created");
      setOpen(false);
    },
  });

  const form = useForm({
    defaultValues: { title: "", type: "note", content: "" },
    validators: { onSubmit: documentationSchema },
    onSubmit: async ({ value }) => {
      await createDocumentation.mutateAsync({ projectId, data: value as never });
      form.reset();
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Documentation</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">New Document</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Documentation</DialogTitle>
              <DialogDescription>Add SRS, SRD, architecture notes, and related docs.</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
            >
              {(["title", "type"] as const).map((name) => (
                <form.Field key={name} name={name}>
                  {(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>{name === "title" ? "Title" : "Type"}</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value as never)}
                          aria-invalid={isInvalid}
                        />
                        {name === "type" && (
                          <FieldDescription>Use one of: srs, srd, architecture, api, note.</FieldDescription>
                        )}
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </form.Field>
              ))}
              <form.Field name="content">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Content</FieldLabel>
                      <Textarea
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
              <DialogFooter>
                <Button type="submit">Create</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-2">
        {data?.data.map((doc) => (
          <div key={doc.id} className="rounded-md border p-3">
            <p className="font-medium">{doc.title}</p>
            <p className="text-xs text-muted-foreground">
              {doc.type} • v{doc.version}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
