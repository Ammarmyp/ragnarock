"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Plus, Sparkles, PencilLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DocumentationType } from "@/api/projects.api";
import { DOCUMENTATION_TYPE_ORDER, DOCUMENTATION_TYPE_LABELS } from "@/lib/documentation-labels";
import { DocumentationMdEditor } from "@/components/documentation/documentation-md-editor";
import { DocumentationTypeDropdown } from "@/components/documentation/documentation-type-dropdown";
import {
  useCreateProjectDocumentation,
  useGenerateProjectArchDoc,
  type ArchDocType,
} from "@/hooks/use-projects";
import { useProjectSpecifications } from "@/hooks/use-project-ai-chat";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

const createDocSchema = z.object({
  title: z.string().min(3, "Title is too short"),
  type: z.enum(DOCUMENTATION_TYPE_ORDER),
  content: z.string().min(1, "Content is required"),
});

const AI_GENERATABLE_TYPES: ArchDocType[] = ["sad", "hld", "lld", "adr"];

const AI_DOC_TYPE_LABELS: Record<ArchDocType, string> = {
  sad: "Software Architecture Document",
  hld: "High-Level Design",
  lld: "Low-Level Design",
  adr: "Architecture Decision Record",
};

const AI_DOC_TYPE_DESCRIPTIONS: Record<ArchDocType, string> = {
  sad: "End-to-end system overview — components, data flow, tech stack, deployment, and cross-cutting concerns.",
  hld: "Module breakdown, interface contracts between services, data models, and key design decisions.",
  lld: "Detailed component design, class diagrams, API specs, database schema, and algorithm descriptions.",
  adr: "Captures a single architectural decision — context, the chosen option, rationale, and trade-offs.",
};

type CreationMode = "manual" | "ai";

type DocumentationCreateDialogProps = {
  projectId: string;
};

export function DocumentationCreateDialog({ projectId }: DocumentationCreateDialogProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<CreationMode>("manual");
  const [aiDocType, setAiDocType] = useState<ArchDocType>("sad");
  const [aiLayer, setAiLayer] = useState("");

  const { data: specs } = useProjectSpecifications(projectId, { page: 1, limit: 1 });
  const hasSrs = (specs?.data?.length ?? 0) > 0;

  const createDocumentation = useCreateProjectDocumentation({
    onSuccess: () => {
      toast.success("Document created");
      setOpen(false);
    },
  });

  const generateArchDoc = useGenerateProjectArchDoc({
    onSuccess: () => {
      toast.success("Architecture document generation queued — it will appear shortly.");
      setOpen(false);
    },
    onError: (err) => {
      toast.error(err.message ?? "Failed to queue document generation");
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

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setMode("manual");
      setAiDocType("sad");
      setAiLayer("");
      form.reset();
    }
  }

  function handleAiGenerate() {
    generateArchDoc.mutate({
      projectId,
      data: { docType: aiDocType, layer: aiLayer.trim() || undefined },
    });
  }

  const isPending = createDocumentation.isPending || generateArchDoc.isPending;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1 size-4" />
          New document
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex h-full w-full max-w-none flex-col gap-0 p-0 sm:w-[min(72vw,1400px)]! sm:max-w-[min(72vw,1400px)]!"
        style={{ width: "min(72vw, 1400px)", maxWidth: "min(72vw, 1400px)" }}
      >
        <SheetHeader className="shrink-0 border-b px-6 py-4">
          <SheetTitle>Create documentation</SheetTitle>
          <SheetDescription>
            Write manually or let Ragnarock generate an architecture document from your project SRS.
          </SheetDescription>
        </SheetHeader>

        {/* Mode selector */}
        <div className="shrink-0 border-b px-6 py-4">
          <div className="flex gap-2">
            <ModeButton
              active={mode === "manual"}
              icon={<PencilLine className="size-4" />}
              label="Manual"
              description="Write your own content"
              onClick={() => setMode("manual")}
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex-1">
                  <ModeButton
                    active={mode === "ai"}
                    icon={<Sparkles className="size-4" />}
                    label="Generate with Ragnarock"
                    description="Produce an architecture doc from your SRS"
                    onClick={() => hasSrs && setMode("ai")}
                    disabled={!hasSrs}
                  />
                </span>
              </TooltipTrigger>
              {!hasSrs && (
                <TooltipContent>
                  Complete the requirements session first to generate architecture documents.
                </TooltipContent>
              )}
            </Tooltip>
          </div>
        </div>

        {mode === "ai" ? (
          <AiGenerateForm
            docType={aiDocType}
            layer={aiLayer}
            onDocTypeChange={setAiDocType}
            onLayerChange={setAiLayer}
            onGenerate={handleAiGenerate}
            isPending={isPending}
          />
        ) : (
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
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
                        placeholder="Enter document title"
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
                        disabled={isPending}
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
                      <FieldDescription>
                        Write in Markdown with live preview to validate structure while you type.
                      </FieldDescription>
                      <div id={field.name} className="mt-2">
                        <DocumentationMdEditor
                          value={field.state.value}
                          onChange={(v) => field.handleChange(v)}
                          className="documentation-md-editor--create"
                          height={680}
                        />
                      </div>
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              </form.Field>
            </div>
            <SheetFooter className="shrink-0 border-t px-6 py-4">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating…" : "Create"}
              </Button>
            </SheetFooter>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}

function ModeButton({
  active,
  icon,
  label,
  description,
  onClick,
  disabled = false,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex flex-1 items-start gap-3 rounded-lg border p-3 text-left transition-colors",
        disabled
          ? "cursor-not-allowed border-border opacity-40"
          : active
            ? "border-primary bg-primary/5 text-primary"
            : "border-border hover:border-muted-foreground/40 hover:bg-muted/40",
      )}
    >
      <span className="mt-0.5 shrink-0">{icon}</span>
      <span className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-muted-foreground text-xs">{description}</span>
      </span>
    </button>
  );
}

function AiGenerateForm({
  docType,
  layer,
  onDocTypeChange,
  onLayerChange,
  onGenerate,
  isPending,
}: {
  docType: ArchDocType;
  layer: string;
  onDocTypeChange: (t: ArchDocType) => void;
  onLayerChange: (v: string) => void;
  onGenerate: () => void;
  isPending: boolean;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
        <Field>
          <FieldLabel>Document type</FieldLabel>
          <FieldDescription>
            Ragnarock will generate this document from your project&apos;s SRS.
          </FieldDescription>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {AI_GENERATABLE_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onDocTypeChange(t)}
                className={cn(
                  "rounded-lg border p-3 text-left transition-colors",
                  docType === t
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/40 hover:bg-muted/40",
                )}
              >
                <span className={cn(
                  "font-mono text-xs uppercase tracking-wider",
                  docType === t ? "text-primary" : "text-muted-foreground",
                )}>{t}</span>
                <p className={cn(
                  "mt-0.5 text-sm font-medium leading-snug",
                  docType === t ? "text-primary" : "text-foreground",
                )}>
                  {AI_DOC_TYPE_LABELS[t]}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {AI_DOC_TYPE_DESCRIPTIONS[t]}
                </p>
              </button>
            ))}
          </div>
        </Field>

        <Field>
          <FieldLabel htmlFor="ai-layer">Layer / service (optional)</FieldLabel>
          <FieldDescription>
            Scope the document to a specific layer, e.g. &quot;backend&quot;, &quot;frontend&quot;, &quot;mobile&quot;.
          </FieldDescription>
          <Input
            id="ai-layer"
            value={layer}
            onChange={(e) => onLayerChange(e.target.value)}
            placeholder="e.g. backend, frontend, mobile (leave blank for full-system)"
            disabled={isPending}
          />
        </Field>

        <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          <Sparkles className="mb-2 size-4 text-primary" />
          Ragnarock will read your project SRS and produce a full Markdown document. Once generated
          it will appear in your documentation list with status <strong>Completed</strong>.
        </div>
      </div>

      <SheetFooter className="shrink-0 border-t px-6 py-4">
        <Button onClick={onGenerate} disabled={isPending}>
          {isPending ? "Queuing…" : "Generate document"}
        </Button>
      </SheetFooter>
    </div>
  );
}
