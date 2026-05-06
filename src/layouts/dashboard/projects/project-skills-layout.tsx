"use client";

import { useCallback, useState } from "react";
import { Download, Pencil, Sparkles, Trash2 } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { exportProjectSkill } from "@/api/projects.api";
import { getErrorMessage } from "@/api/client";
import {
  useCreateProjectSkill,
  useDeleteProjectSkill,
  useProjectSkill,
  useProjectSkills,
  useProjectRole,
  useUpdateProjectSkill,
} from "@/hooks/use-projects";
import { toast } from "@/lib/toast";
import type { ProjectSkillListItem } from "@/api/projects.api";

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function ProjectSkillsLayout({ projectId }: { projectId: string }) {
  const { data: skills, isLoading, isError, error, refetch } = useProjectSkills(projectId);
  const { data: role } = useProjectRole(projectId);
  const canWrite = role?.role === "owner" || role?.role === "admin" || role?.role === "member";
  const canDelete = role?.role === "owner" || role?.role === "admin";

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [bodyMarkdown, setBodyMarkdown] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ProjectSkillListItem | null>(null);

  const { data: editingSkill, isFetching: editingLoading } = useProjectSkill(projectId, editingId ?? "", {
    enabled: dialogOpen && !!editingId,
    onSuccess: (skill) => {
      // Populate latest values after fetch (avoid setState-in-effect lint).
      setTitle(skill.title);
      setSummary(skill.summary ?? "");
      setBodyMarkdown(skill.bodyMarkdown);
    },
  });

  const createMutation = useCreateProjectSkill();
  const updateMutation = useUpdateProjectSkill();
  const deleteMutation = useDeleteProjectSkill();

  const openCreate = () => {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setSummary("");
    setBodyMarkdown("");
    setDialogOpen(true);
  };

  const openEdit = (skill: ProjectSkillListItem) => {
    setEditingId(skill.id);
    setTitle(skill.title);
    setSlug(skill.slug);
    setSummary(skill.summary ?? "");
    setBodyMarkdown("");
    setDialogOpen(true);
  };

  const handleExport = useCallback(
    async (skillId: string, format: "md" | "txt") => {
      try {
        const { blob, filename } = await exportProjectSkill(projectId, skillId, format);
        triggerBlobDownload(blob, filename);
        toast.success(format === "md" ? "Markdown downloaded" : "Text file downloaded");
      } catch {
        toast.error("Export failed");
      }
    },
    [projectId],
  );

  const handleSave = async () => {
    const t = title.trim();
    if (t.length < 2) {
      toast.error("Title must be at least 2 characters");
      return;
    }
    const body = bodyMarkdown.trim();
    if (body.length < 1) {
      toast.error("Body is required");
      return;
    }
    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          projectId,
          skillId: editingId,
          data: { title: t, summary: summary.trim() || null, bodyMarkdown: body },
        });
        toast.success("Skill updated");
      } else {
        await createMutation.mutateAsync({
          projectId,
          data: {
            title: t,
            bodyMarkdown: body,
            ...(summary.trim() ? { summary: summary.trim() } : {}),
            ...(slug.trim() ? { slug: slug.trim() } : {}),
          },
        });
        toast.success("Skill created");
      }
      setDialogOpen(false);
    } catch (e: unknown) {
      const message = e && typeof e === "object" && "message" in e ? String((e as Error).message) : "Save failed";
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }
    try {
      await deleteMutation.mutateAsync({ projectId, skillId: deleteTarget.id });
      toast.success("Skill deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Could not delete skill");
    }
  };

  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 flex-row flex-wrap items-center justify-between gap-3 border-b border-border/50 px-4 pb-4 sm:px-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <Sparkles className="size-5 opacity-90" />
          Skills
        </h2>
        {canWrite && (
          <Button type="button" onClick={openCreate}>
            New skill
          </Button>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
        {isError ? (
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm">
            <p className="font-medium text-destructive">Could not load skills</p>
            <p className="mt-2 text-muted-foreground">{getErrorMessage(error)}</p>
            <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => void refetch()}>
              Retry
            </Button>
          </div>
        ) : isLoading ? (
          <p className="text-sm text-muted-foreground">Loading skills…</p>
        ) : !skills?.length ? (
          <p className="text-sm text-muted-foreground">
            No skills yet. {canWrite ? "Create one to capture reusable guidance for this project." : ""}
          </p>
        ) : (
          <ul className="space-y-3">
            {skills.map((skill) => (
              <li
                key={skill.id}
                className="rounded-lg border border-border/60 bg-card/40 p-4 shadow-sm"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <p className="font-medium leading-tight">{skill.title}</p>
                    {skill.summary ? (
                      <p className="text-sm text-muted-foreground">{skill.summary}</p>
                    ) : null}
                    <p className="text-xs text-muted-foreground">
                      <span className="font-mono">{skill.slug}</span>
                      <span className="mx-2">·</span>
                      Updated {new Date(skill.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => void handleExport(skill.id, "md")}
                    >
                      <Download className="size-3.5" />
                      .md
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => void handleExport(skill.id, "txt")}
                    >
                      <Download className="size-3.5" />
                      .txt
                    </Button>
                    {canWrite && (
                      <Button type="button" variant="secondary" size="sm" className="gap-1.5" onClick={() => openEdit(skill)}>
                        <Pencil className="size-3.5" />
                        Edit
                      </Button>
                    )}
                    {canDelete && (
                      <Button type="button" variant="destructive" size="sm" className="gap-1.5" onClick={() => setDeleteTarget(skill)}>
                        <Trash2 className="size-3.5" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit skill" : "New skill"}</DialogTitle>
            <DialogDescription>
              Markdown body is exported with optional front matter for tools like Cursor or Claude.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="skill-title">Title</Label>
              <Input
                id="skill-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. API error handling"
                disabled={saving}
              />
            </div>
            {!editingId && (
              <div className="grid gap-2">
                <Label htmlFor="skill-slug">Slug (optional)</Label>
                <Input
                  id="skill-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="auto from title if empty"
                  disabled={saving}
                  className="font-mono text-sm"
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="skill-summary">Summary</Label>
              <Textarea
                id="skill-summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Short description"
                rows={2}
                disabled={saving}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="skill-body">Body (Markdown)</Label>
              {editingId && editingLoading && !editingSkill ? (
                <p className="text-sm text-muted-foreground">Loading skill…</p>
              ) : (
                <Textarea
                  id="skill-body"
                  value={bodyMarkdown}
                  onChange={(e) => setBodyMarkdown(e.target.value)}
                  placeholder="# Instructions&#10;&#10;…"
                  rows={12}
                  disabled={saving || (Boolean(editingId) && editingLoading)}
                  className="font-mono text-sm"
                />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void handleSave()} disabled={saving}>
              {saving ? "Saving…" : editingId ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this skill?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget ? `“${deleteTarget.title}” will be removed permanently.` : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleDelete()} disabled={deleteMutation.isPending}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
