"use client";

import { useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { FolderKanban, Search } from "lucide-react";
import { DashboardLayout } from "@/layouts/dashboard/dashboard-layout";
import { useCreateProject, useDeleteProject, useProjects, useUpdateProject } from "@/hooks/use-projects";
import type { Project } from "@/api/projects.api";
import { ProjectListCard } from "@/layouts/dashboard/projects/project-list-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/lib/toast";
import { useProjectWorkspaceStore } from "@/stores/project-workspace.store";
import { cn } from "@/utils/cn";

const createProjectSchema = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters").max(120),
  description: z.string().max(2000),
});

function ProjectListSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <Card
          key={index}
          className="overflow-hidden border-border/70 shadow-none transition-shadow"
        >
          <CardHeader className="space-y-3 pb-4">
            <Skeleton className="h-5 w-[min(100%,14rem)]" />
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-[92%]" />
            </div>
          </CardHeader>
          <CardContent className="flex items-center justify-between pt-0">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-8 w-[4.5rem] rounded-md" />
          </CardContent>
        </Card>
      ))}
    </>
  );
}

export function ProjectsPageLayout() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const projectsSearch = useProjectWorkspaceStore((state) => state.projectsSearch);
  const setProjectsSearch = useProjectWorkspaceStore((state) => state.setProjectsSearch);
  const trimmedSearch = projectsSearch.trim();
  const {
    data,
    isPending,
    isFetching,
    isError,
    error,
    refetch,
  } = useProjects({ page: 1, limit: 30, search: trimmedSearch || undefined });
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const projects = Array.isArray(data?.data) ? data.data : [];

  const form = useForm({
    defaultValues: { name: "", description: "" },
    validators: { onSubmit: createProjectSchema },
    onSubmit: async ({ value }) => {
      try {
        await createProject.mutateAsync(value);
        toast.success("Project created");
        form.reset();
        setIsCreateDialogOpen(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create project";
        toast.error(message);
      }
    },
  });

  const editForm = useForm({
    defaultValues: { name: "", description: "" },
    validators: { onSubmit: createProjectSchema },
    onSubmit: async ({ value }) => {
      if (!editingProject) return;
      try {
        await updateProject.mutateAsync({
          id: editingProject.id,
          data: {
            name: value.name,
            description: value.description.trim() ? value.description : undefined,
          },
        });
        toast.success("Project updated");
        setEditingProject(null);
        editForm.reset();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update project";
        toast.error(message);
      }
    },
  });

  useEffect(() => {
    if (!editingProject) return;
    editForm.reset({
      name: editingProject.name,
      description: editingProject.description ?? "",
    });
  }, [editingProject, editForm]);

  const showEmpty = !isPending && !isError && projects.length === 0;
  const showFilteredEmpty = showEmpty && Boolean(trimmedSearch);
  const showNoProjects = showEmpty && !trimmedSearch;

  const CreateField = form.Field;
  const EditField = editForm.Field;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground">
              Manage and open project workspaces for your organization.
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="shrink-0">Create project</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create project</DialogTitle>
                <DialogDescription>Projects are scoped to your active organization.</DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  form.handleSubmit();
                }}
              >
                <FieldGroup>
                  <CreateField name="name">
                    {(field) => {
                      const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={`create-project-${field.name}`}>Project name</FieldLabel>
                          <Input
                            id={`create-project-${field.name}`}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                          />
                          <FieldDescription>Short, clear name used across the workspace.</FieldDescription>
                          {isInvalid && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                      );
                    }}
                  </CreateField>
                  <CreateField name="description">
                    {(field) => {
                      const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={`create-project-${field.name}`}>Description</FieldLabel>
                          <Input
                            id={`create-project-${field.name}`}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                          />
                          <FieldDescription>Optional short context for the team.</FieldDescription>
                          {isInvalid && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                      );
                    }}
                  </CreateField>
                </FieldGroup>
                <DialogFooter>
                  <Button type="submit" disabled={createProject.isPending}>
                    {createProject.isPending ? "Creating…" : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog
            open={editingProject !== null}
            onOpenChange={(open) => {
              if (!open) setEditingProject(null);
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit project</DialogTitle>
                <DialogDescription>Update the name and description for this project.</DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  editForm.handleSubmit();
                }}
              >
                <FieldGroup>
                  <EditField name="name">
                    {(field) => {
                      const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={`edit-project-${field.name}`}>Project name</FieldLabel>
                          <Input
                            id={`edit-project-${field.name}`}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                          />
                          <FieldDescription>Short, clear name used across the workspace.</FieldDescription>
                          {isInvalid && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                      );
                    }}
                  </EditField>
                  <EditField name="description">
                    {(field) => {
                      const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={`edit-project-${field.name}`}>Description</FieldLabel>
                          <Input
                            id={`edit-project-${field.name}`}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                          />
                          <FieldDescription>Optional short context for the team.</FieldDescription>
                          {isInvalid && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                      );
                    }}
                  </EditField>
                </FieldGroup>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setEditingProject(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateProject.isPending}>
                    {updateProject.isPending ? "Saving…" : "Save changes"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog
            open={deleteTarget !== null}
            onOpenChange={(open) => {
              if (!open) setDeleteTarget(null);
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete project</DialogTitle>
                <DialogDescription>
                  This will permanently delete{" "}
                  <span className="text-foreground font-medium">{deleteTarget?.name}</span> and its
                  workspace data. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={deleteProject.isPending}
                  onClick={() => {
                    if (!deleteTarget) return;
                    void (async () => {
                      try {
                        await deleteProject.mutateAsync(deleteTarget.id);
                        toast.success("Project deleted");
                        setDeleteTarget(null);
                      } catch (err) {
                        const message =
                          err instanceof Error ? err.message : "Failed to delete project";
                        toast.error(message);
                      }
                    })();
                  }}
                >
                  {deleteProject.isPending ? "Deleting…" : "Delete project"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative">
          <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            className="pl-9"
            placeholder="Search projects"
            value={projectsSearch}
            onChange={(e) => setProjectsSearch(e.target.value)}
            aria-label="Search projects"
          />
        </div>

        {isError && (
          <Card className="border-destructive/40 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-base">Could not load projects</CardTitle>
              <CardDescription>
                {error instanceof Error ? error.message : "Something went wrong. Try again."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        <div
          className={cn(
            "grid gap-4 md:grid-cols-2 lg:grid-cols-3",
            isFetching && !isPending && "transition-opacity duration-200 ease-out",
            isFetching && !isPending && "opacity-80",
          )}
        >
          {isPending && <ProjectListSkeleton />}

          {showFilteredEmpty && (
            <Card className="border-dashed border-border/80 bg-muted/20 md:col-span-2 lg:col-span-3">
              <CardHeader className="flex flex-row items-start gap-4 pb-2">
                <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-lg">
                  <Search className="text-muted-foreground size-5" />
                </div>
                <div className="min-w-0 space-y-1">
                  <CardTitle className="text-lg">No matching projects</CardTitle>
                  <CardDescription>
                    Nothing matches &quot;{trimmedSearch}&quot;. Try a different search or clear the
                    filter.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2 pt-0">
                <Button type="button" variant="outline" size="sm" onClick={() => setProjectsSearch("")}>
                  Clear search
                </Button>
              </CardContent>
            </Card>
          )}

          {showNoProjects && (
            <Card className="border-dashed border-border/80 bg-muted/20 md:col-span-2 lg:col-span-3">
              <CardHeader className="flex flex-row items-start gap-4 pb-2">
                <div className="bg-primary/10 flex size-10 shrink-0 items-center justify-center rounded-lg">
                  <FolderKanban className="text-primary size-5" />
                </div>
                <div className="min-w-0 space-y-1">
                  <CardTitle className="text-lg">No projects yet</CardTitle>
                  <CardDescription>
                    Create your first project to start tracking documentation, tasks, and
                    requirements in one workspace.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Button type="button" onClick={() => setIsCreateDialogOpen(true)}>
                  Create project
                </Button>
              </CardContent>
            </Card>
          )}

          {!isPending &&
            !isError &&
            projects.map((project) => (
              <ProjectListCard
                key={project.id}
                project={project}
                onEdit={setEditingProject}
                onDeleteRequest={setDeleteTarget}
              />
            ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
