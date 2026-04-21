"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { Project } from "@/api/projects.api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function statusBadgeVariant(
  status: Project["status"],
): "default" | "secondary" | "outline" {
  switch (status) {
    case "active":
      return "default";
    case "archived":
      return "secondary";
    case "completed":
      return "outline";
    default:
      return "outline";
  }
}

export function createProjectListColumns(handlers: {
  onEdit: (project: Project) => void;
  onDeleteRequest: (project: Project) => void;
}): ColumnDef<Project>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <Link
          href={`/dashboard/projects/${row.original.id}/overview`}
          className="font-medium text-foreground decoration-transparent underline-offset-4 transition-colors hover:text-primary hover:underline"
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const text = row.original.description?.trim();
        return (
          <span className="text-muted-foreground line-clamp-2 max-w-md text-sm whitespace-normal">
            {text || "—"}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={statusBadgeVariant(row.original.status)} className="capitalize">
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "memberCount",
      header: () => <span className="tabular-nums">Members</span>,
      cell: ({ row }) => (
        <span className="text-muted-foreground tabular-nums text-sm">
          {row.original.memberCount}
        </span>
      ),
    },
    {
      accessorKey: "requirementCount",
      header: () => <span className="tabular-nums">Reqs</span>,
      cell: ({ row }) => (
        <span className="text-muted-foreground tabular-nums text-sm">
          {row.original.requirementCount}
        </span>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: "Updated",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm tabular-nums whitespace-normal">
          {formatDistanceToNow(new Date(row.original.updatedAt), { addSuffix: true })}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const project = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground size-8"
                aria-label={`Open menu for ${project.name}`}
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[10rem]">
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={() => {
                  handlers.onEdit(project);
                }}
              >
                <Pencil className="size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                className="cursor-pointer"
                onSelect={() => {
                  handlers.onDeleteRequest(project);
                }}
              >
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
