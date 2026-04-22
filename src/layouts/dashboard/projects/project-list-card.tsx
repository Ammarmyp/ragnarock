"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { FolderKanban, Info, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import type { Project } from "@/api/projects.api";
import { cn } from "@/utils/cn";

type ProjectListCardProps = {
  project: Project;
  onEdit: (project: Project) => void;
  onDeleteRequest: (project: Project) => void;
};

const statusCopy: Record<Project["status"], string> = {
  active: "Project is active",
  archived: "Project is archived",
  completed: "Project is completed",
};

function formatCreatedAt(iso: string): string | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return null;
  }
  return formatDistanceToNow(d, { addSuffix: true });
}

export function ProjectListCard({ project, onEdit, onDeleteRequest }: ProjectListCardProps) {
  const createdLabel = formatCreatedAt(project.createdAt);
  return (
    <Card
      className={cn(
        "group overflow-hidden rounded-xl border-border/60 bg-card/90 shadow-sm ring-1 ring-black/5 transition-[border-color,box-shadow] dark:ring-white/10",
        "hover:border-border/90 hover:shadow-md",
      )}
    >
      <CardHeader className="space-y-0 pb-3">
        <div className="flex flex-row items-start gap-3">
          <div className="bg-muted/60 flex size-10 shrink-0 items-center justify-center rounded-lg ring-1 ring-border/40">
            <FolderKanban className="text-muted-foreground size-[18px]" />
          </div>
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-base font-semibold leading-snug tracking-tight">
                {project.name}
              </CardTitle>
              <div className="shrink-0 -mr-1 -mt-0.5" onClick={(e) => e.stopPropagation()}>
                <Menubar className="h-auto border-0 bg-transparent p-0 shadow-none">
                  <MenubarMenu>
                    <MenubarTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        className="text-muted-foreground hover:text-foreground size-8"
                        aria-label={`Actions for ${project.name}`}
                      >
                        <MoreVertical className="size-4" />
                      </Button>
                    </MenubarTrigger>
                    <MenubarContent align="end" className="min-w-[10.5rem]">
                      <MenubarItem
                        className="cursor-pointer"
                        onSelect={() => {
                          onEdit(project);
                        }}
                      >
                        <Pencil className="size-4" />
                        Edit project
                      </MenubarItem>
                      <MenubarItem
                        variant="destructive"
                        className="cursor-pointer"
                        onSelect={() => {
                          onDeleteRequest(project);
                        }}
                      >
                        <Trash2 className="size-4" />
                        Delete project
                      </MenubarItem>
                    </MenubarContent>
                  </MenubarMenu>
                </Menubar>
              </div>
            </div>
            <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
              {project.description?.trim() ? project.description : "No description yet"}
            </p>
            {createdLabel ? (
              <p className="text-muted-foreground/85 pt-0.5 text-[11px] leading-none">
                Created {createdLabel}
              </p>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 border-t border-border/50 pt-3 sm:flex-row sm:items-center sm:justify-between sm:pt-3.5">
        <div className="text-muted-foreground flex min-w-0 flex-1 items-center gap-2 rounded-md bg-muted/35 px-2.5 py-1.5 text-xs ring-1 ring-border/30">
          <Info className="text-muted-foreground/80 size-3.5 shrink-0" aria-hidden />
          <span className="truncate">{statusCopy[project.status]}</span>
        </div>
        <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
          <span className="text-muted-foreground text-[11px] tabular-nums whitespace-nowrap">
            {project.memberCount} member{project.memberCount === 1 ? "" : "s"} ·{" "}
            {project.requirementCount} req
            {project.requirementCount === 1 ? "" : "s"}
          </span>
          <Button asChild size="sm" className="shrink-0 font-medium">
            <Link href={`/dashboard/projects/${project.id}/overview`}>Open</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
