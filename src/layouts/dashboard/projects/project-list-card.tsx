"use client";

import Link from "next/link";
import { FolderKanban, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

export function ProjectListCard({ project, onEdit, onDeleteRequest }: ProjectListCardProps) {
  return (
    <Card
      className={cn(
        "group border-border/80 bg-card shadow-sm transition-[border-color,box-shadow]",
        "hover:border-border hover:shadow-md",
      )}
    >
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
            <Menubar className="h-auto border-0 bg-transparent p-0 shadow-none">
              <MenubarMenu>
                <MenubarTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="text-muted-foreground hover:text-foreground size-8 shrink-0"
                    aria-label={`Actions for ${project.name}`}
                  >
                    <MoreVertical className="size-4" />
                  </Button>
                </MenubarTrigger>
                <MenubarContent align="start" className="min-w-[10.5rem]">
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
          <span className="text-muted-foreground rounded-full border border-border/60 bg-muted/30 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide">
            {project.status}
          </span>
        </div>
        <div className="flex items-start gap-3">
          <div className="bg-muted/80 flex size-9 shrink-0 items-center justify-center rounded-md">
            <FolderKanban className="text-muted-foreground size-4" />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <CardTitle className="text-lg leading-snug">{project.name}</CardTitle>
            <CardDescription className="line-clamp-2">
              {project.description?.trim() ? project.description : "No description"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex items-center justify-between border-t border-border/60 pt-4">
        <div className="text-muted-foreground flex flex-col gap-0.5 text-xs">
          <span>
            {project.memberCount} member{project.memberCount === 1 ? "" : "s"}
          </span>
          <span>
            {project.requirementCount} requirement
            {project.requirementCount === 1 ? "" : "s"}
          </span>
        </div>
        <Button asChild size="sm" className="shrink-0">
          <Link href={`/dashboard/projects/${project.id}/overview`}>Open</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
