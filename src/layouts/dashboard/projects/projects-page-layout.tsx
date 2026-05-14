"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "@tanstack/react-form";
import type { OnChangeFn, PaginationState } from "@tanstack/react-table";
import { z } from "zod";
import { FolderKanban, LayoutGrid, List, Plus, Search } from "lucide-react";
import { DashboardLayout } from "@/layouts/dashboard/dashboard-layout";
import { useCreateProject, useDeleteProject, useProjects, useUpdateProject } from "@/hooks/use-projects";
import { authClient } from "@/lib/auth/auth-client";
import type { Project } from "@/api/projects.api";
import { ProjectListCard } from "@/layouts/dashboard/projects/project-list-card";
import { createProjectListColumns } from "@/layouts/dashboard/projects/project-list-table-columns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/lib/toast";
import { useProjectWorkspaceStore } from "@/stores/project-workspace.store";
import { cn } from "@/utils/cn";
import { DataTable } from "@/components/data-table";

type StatusFilter = "all" | Project["status"];

const createProjectSchema = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters").max(120),
  description: z.string().max(2000),
});

type ProjectSortKey = "name-asc" | "name-desc" | "updated-desc" | "updated-asc";

function sortProjectsList<T extends { name: string; updatedAt: string }>(
  list: T[],
  sort: ProjectSortKey,
): T[] {
  const next = [...list];
  next.sort((a, b) => {
    switch (sort) {
      case "name-asc":
        return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      case "name-desc":
        return b.name.localeCompare(a.name, undefined, { sensitivity: "base" });
      case "updated-desc":
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      case "updated-asc":
        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      default:
        return 0;
    }
  });
  return next;
}

function ProjectListSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <Card
          key={index}
          className="overflow-hidden rounded-xl border-border/60 shadow-sm ring-1 ring-black/5 transition-shadow dark:ring-white/10"
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
  const { data: activeOrg } = authClient.useActiveOrganization();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<ProjectSortKey>("name-asc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [tablePagination, setTablePagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const projectsSearch = useProjectWorkspaceStore((state) => state.projectsSearch);
  const setProjectsSearch = useProjectWorkspaceStore((state) => state.setProjectsSearch);
  const trimmedSearch = projectsSearch.trim();

  const listPage = tablePagination.pageIndex + 1;
  const listLimit = tablePagination.pageSize;
  const isListView = viewMode === "list";

  const {
    data,
    isPending,
    isFetching,
    isError,
    error,
    refetch,
  } = useProjects(
    {
      page: isListView ? listPage : 1,
      limit: isListView ? listLimit : 30,
      search: trimmedSearch || undefined,
      ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    },
    { enabled: !!activeOrg?.id },
  );
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const rawProjects = Array.isArray(data?.data) ? data.data : [];
  const projects = isListView
    ? rawProjects
    : sortProjectsList(rawProjects, sortBy);

  const onTablePaginationChange = useCallback<OnChangeFn<PaginationState>>((updater) => {
    setTablePagination((prev) => (typeof updater === "function" ? updater(prev) : updater));
  }, []);

  const tableColumns = useMemo(
    () =>
      createProjectListColumns({
        onEdit: setEditingProject,
        onDeleteRequest: setDeleteTarget,
      }),
    [],
  );

  const totalPages = data?.pagination?.totalPages ?? 0;
  const totalItems = data?.pagination?.totalItems ?? 0;
  const tablePageCount = Math.max(totalPages, 1);

  const showTableList =
    isListView && !isError && (isPending || projects.length > 0);

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
  const hasActiveFilters = Boolean(trimmedSearch) || statusFilter !== "all";
  const showFilteredEmpty = showEmpty && hasActiveFilters;
  const showNoProjects = showEmpty && !hasActiveFilters;

  const CreateField = form.Field;
  const EditField = editForm.Field;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-5 p-5 md:p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Projects</h1>
          <p className="text-muted-foreground mt-1 max-w-xl text-sm leading-relaxed">
            Manage and open project workspaces for your organization.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <div className="relative min-w-0 w-full flex-1 sm:min-w-[12rem] sm:max-w-md lg:max-w-lg">
              <Search className="text-muted-foreground pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2" />
              <Input
                className="h-9 pl-9 text-sm"
                placeholder="Search for a project"
                value={projectsSearch}
                onChange={(e) => {
                  setProjectsSearch(e.target.value);
                  setTablePagination((p) => ({ ...p, pageIndex: 0 }));
                }}
                aria-label="Search projects"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value as StatusFilter);
                setTablePagination((p) => ({ ...p, pageIndex: 0 }));
              }}
            >
              <SelectTrigger size="sm" className="h-9 w-[min(100%,11rem)] sm:w-auto" aria-label="Filter by status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            {!isListView && (
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as ProjectSortKey)}>
                <SelectTrigger
                  size="sm"
                  className="h-9 w-[min(100%,13rem)] sm:w-[13rem]"
                  aria-label="Sort projects"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name (A–Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z–A)</SelectItem>
                  <SelectItem value="updated-desc">Last updated</SelectItem>
                  <SelectItem value="updated-asc">Oldest updates</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-start gap-2 sm:justify-end">
            <div className="flex items-center gap-0.5">
              <Button
                type="button"
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon-sm"
                className="size-8 shrink-0"
                aria-label="Grid view"
                aria-pressed={viewMode === "grid"}
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="size-4" />
              </Button>
              <Button
                type="button"
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon-sm"
                className="size-8 shrink-0"
                aria-label="List view"
                aria-pressed={viewMode === "list"}
                onClick={() => {
                  setViewMode("list");
                  setTablePagination((p) => ({ ...p, pageIndex: 0 }));
                }}
              >
                <List className="size-4" />
              </Button>
            </div>
            <Button
              type="button"
              size="sm"
              className="h-9 shrink-0 gap-1.5 px-3 font-medium"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="size-4" />
              New project
            </Button>
          </div>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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
                          <Textarea
                            id={`create-project-${field.name}`}
                            name={field.name}
                            rows={4}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            className="min-h-[5.5rem] resize-y"
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
                          <Textarea
                            id={`edit-project-${field.name}`}
                            name={field.name}
                            rows={4}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            className="min-h-[5.5rem] resize-y"
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

        {(showFilteredEmpty || showNoProjects) && (
          <div className="w-full">
            {showFilteredEmpty && (
            <Card className="border-dashed border-border/80 bg-muted/20">
              <CardHeader className="flex flex-row items-start gap-4 pb-2">
                <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-lg">
                  <Search className="text-muted-foreground size-5" />
                </div>
                <div className="min-w-0 space-y-1">
                  <CardTitle className="text-lg">No matching projects</CardTitle>
                  <CardDescription>
                    {trimmedSearch && statusFilter !== "all" ? (
                      <>
                        Nothing matches &quot;{trimmedSearch}&quot; with status &quot;{statusFilter}
                        &quot;. Adjust search or status.
                      </>
                    ) : trimmedSearch ? (
                      <>
                        Nothing matches &quot;{trimmedSearch}&quot;. Try a different search or clear
                        the filter.
                      </>
                    ) : (
                      <>No projects with status &quot;{statusFilter}&quot;. Try another status.</>
                    )}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2 pt-0">
                {Boolean(trimmedSearch) && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setProjectsSearch("");
                      setTablePagination((p) => ({ ...p, pageIndex: 0 }));
                    }}
                  >
                    Clear search
                  </Button>
                )}
                {statusFilter !== "all" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setStatusFilter("all");
                      setTablePagination((p) => ({ ...p, pageIndex: 0 }));
                    }}
                  >
                    All statuses
                  </Button>
                )}
              </CardContent>
            </Card>
            )}

            {showNoProjects && (
            <Card className="border-dashed border-border/80 bg-muted/20">
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
          </div>
        )}

        {viewMode === "grid" && !showFilteredEmpty && !showNoProjects && (
          <div
            className={cn(
              "grid w-full gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3",
              isFetching && !isPending && "transition-opacity duration-200 ease-out",
              isFetching && !isPending && "opacity-80",
            )}
          >
            {isPending && <ProjectListSkeleton />}
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
        )}

        {showTableList && (
          <div
            className={cn(
              "w-full min-w-0",
              isFetching && !isPending && "opacity-75 transition-opacity duration-200",
            )}
          >
            <DataTable
              columns={tableColumns}
              data={projects}
              totalRowCount={totalItems}
              isLoading={isPending}
              manualPagination
              pageCount={tablePageCount}
              pagination={tablePagination}
              onPaginationChange={onTablePaginationChange}
              pageSizeOptions={[10, 20, 30]}
              getRowId={(row) => row.id}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
