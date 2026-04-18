"use client";

import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { ProjectMember, ProjectTask, TaskStatus } from "@/api/projects.api";
import { TaskPriorityIconAccent } from "@/lib/task-priority-icons";
import {
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_ORDER,
  TASK_STATUS_LABELS,
  TASK_STATUS_ORDER,
} from "@/lib/task-labels";
import { TaskStatusIconAccent } from "@/lib/task-status-icons";
import { cn } from "@/lib/utils";

const triggerClassName = cn(
  "border-border/55 bg-muted/20 hover:bg-muted/40 text-foreground/95 inline-flex h-7 max-w-[8.5rem] shrink-0 items-center gap-1 rounded-md border px-1.5 text-[11px] font-medium shadow-xs transition-[background-color,box-shadow,color]",
  "focus-visible:ring-border/70 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
  "disabled:pointer-events-none disabled:opacity-45",
);

const menuSurfaceClass = cn(
  "border-border/55 bg-popover text-popover-foreground w-[min(17rem,calc(100vw-2rem))] overflow-hidden rounded-lg border p-0 shadow-lg",
  "ring-foreground/8 ring-1",
);

function stopDrag(e: React.SyntheticEvent) {
  e.stopPropagation();
}

export function TaskListStatusMenu({
  value,
  disabled,
  onCommit,
}: {
  value: TaskStatus;
  disabled?: boolean;
  onCommit: (status: TaskStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return TASK_STATUS_ORDER;
    return TASK_STATUS_ORDER.filter((st) => TASK_STATUS_LABELS[st].toLowerCase().includes(s));
  }, [q]);

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setQ("");
      }}
    >
      <div onPointerDown={stopDrag}>
        <PopoverTrigger asChild>
          <button type="button" disabled={disabled} className={triggerClassName} aria-label="Change status">
            <TaskStatusIconAccent status={value} className="size-3" />
            <span className="max-w-[5.5rem] truncate">{TASK_STATUS_LABELS[value]}</span>
          </button>
        </PopoverTrigger>
      </div>
      <PopoverContent
        align="start"
        sideOffset={6}
        className={menuSurfaceClass}
        onPointerDown={stopDrag}
      >
        <div className="border-border/50 border-b px-2 py-2">
          <div className="relative">
            <Search
              className="text-muted-foreground pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 opacity-80"
              aria-hidden
            />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search"
              className="border-border/60 bg-muted/25 h-8 rounded-md pl-8 text-xs"
              autoComplete="off"
            />
          </div>
        </div>
        <div className="max-h-[min(280px,45vh)] overflow-y-auto p-1">
          {filtered.map((st) => {
            const selected = st === value;
            return (
              <button
                key={st}
                type="button"
                className={cn(
                  "hover:bg-muted/45 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-medium transition-colors",
                  selected && "bg-muted/35",
                )}
                onClick={() => {
                  if (st !== value) onCommit(st);
                  setOpen(false);
                  setQ("");
                }}
              >
                <TaskStatusIconAccent status={st} />
                <span className="min-w-0 flex-1 truncate">{TASK_STATUS_LABELS[st]}</span>
                {selected ? <Check className="text-muted-foreground size-3.5 shrink-0" aria-hidden /> : null}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function TaskListPriorityMenu({
  value,
  disabled,
  onCommit,
}: {
  value: ProjectTask["priority"];
  disabled?: boolean;
  onCommit: (priority: ProjectTask["priority"]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [...TASK_PRIORITY_ORDER];
    return TASK_PRIORITY_ORDER.filter((p) => TASK_PRIORITY_LABELS[p].toLowerCase().includes(s));
  }, [q]);

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setQ("");
      }}
    >
      <div onPointerDown={stopDrag}>
        <PopoverTrigger asChild>
          <button type="button" disabled={disabled} className={cn(triggerClassName, "max-w-[6.5rem]")} aria-label="Change priority">
            <TaskPriorityIconAccent priority={value} className="size-3" />
            <span className="max-w-[4rem] truncate">{TASK_PRIORITY_LABELS[value]}</span>
          </button>
        </PopoverTrigger>
      </div>
      <PopoverContent
        align="start"
        sideOffset={6}
        className={menuSurfaceClass}
        onPointerDown={stopDrag}
      >
        <div className="border-border/50 border-b px-2 py-2">
          <div className="relative">
            <Search
              className="text-muted-foreground pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 opacity-80"
              aria-hidden
            />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search"
              className="border-border/60 bg-muted/25 h-8 rounded-md pl-8 text-xs"
              autoComplete="off"
            />
          </div>
        </div>
        <div className="max-h-[min(220px,40vh)] overflow-y-auto p-1">
          {filtered.map((p) => {
            const selected = p === value;
            return (
              <button
                key={p}
                type="button"
                className={cn(
                  "hover:bg-muted/45 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-medium transition-colors",
                  selected && "bg-muted/35",
                )}
                onClick={() => {
                  if (p !== value) onCommit(p);
                  setOpen(false);
                  setQ("");
                }}
              >
                <TaskPriorityIconAccent priority={p} />
                <span className="min-w-0 flex-1 truncate">{TASK_PRIORITY_LABELS[p]}</span>
                {selected ? <Check className="text-muted-foreground size-3.5 shrink-0" aria-hidden /> : null}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function memberLabel(m: ProjectMember) {
  return m.user?.name?.trim() || m.user?.email || m.userId;
}

export function TaskListAssigneeMenu({
  assigneeId,
  assignee,
  members,
  disabled,
  onCommit,
}: {
  assigneeId: string | null | undefined;
  assignee: ProjectTask["assignee"];
  members: ProjectMember[];
  disabled?: boolean;
  onCommit: (userId: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    const list = members.filter((m) => {
      if (!s) return true;
      const label = memberLabel(m).toLowerCase();
      const email = m.user?.email?.toLowerCase() ?? "";
      return label.includes(s) || email.includes(s);
    });
    return list;
  }, [members, q]);

  const currentLabel = assignee?.name?.trim() || assignee?.email || "Assign";

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setQ("");
      }}
    >
      <div onPointerDown={stopDrag}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            className={cn(
              "border-border/55 bg-muted/20 hover:bg-muted/40 h-7 w-7 shrink-0 rounded-md border p-0 shadow-xs",
              "focus-visible:ring-border/70 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            )}
            aria-label="Change assignee"
            title={currentLabel}
          >
            <Avatar className="border-border/50 size-6 border">
              {assignee?.image ? <AvatarImage src={assignee.image} alt="" /> : null}
              <AvatarFallback className="text-[9px] font-medium">{currentLabel.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </Button>
        </PopoverTrigger>
      </div>
      <PopoverContent
        align="end"
        sideOffset={6}
        className={menuSurfaceClass}
        onPointerDown={stopDrag}
      >
        <div className="border-border/50 border-b px-2 py-2">
          <div className="relative">
            <Search
              className="text-muted-foreground pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 opacity-80"
              aria-hidden
            />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search"
              className="border-border/60 bg-muted/25 h-8 rounded-md pl-8 text-xs"
              autoComplete="off"
            />
          </div>
        </div>
        <div className="max-h-[min(280px,45vh)] overflow-y-auto p-1">
          <button
            type="button"
            className={cn(
              "hover:bg-muted/45 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-medium transition-colors",
              !assigneeId && "bg-muted/35",
            )}
            onClick={() => {
              if (assigneeId) onCommit(null);
              setOpen(false);
              setQ("");
            }}
          >
            <span className="text-muted-foreground inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-dashed text-[10px]">
              —
            </span>
            <span className="min-w-0 flex-1 truncate">Unassigned</span>
            {!assigneeId ? <Check className="text-muted-foreground size-3.5 shrink-0" aria-hidden /> : null}
          </button>
          {filtered.map((m) => {
            const selected = m.userId === assigneeId;
            const label = memberLabel(m);
            return (
              <button
                key={m.id}
                type="button"
                className={cn(
                  "hover:bg-muted/45 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-medium transition-colors",
                  selected && "bg-muted/35",
                )}
                onClick={() => {
                  if (m.userId !== assigneeId) onCommit(m.userId);
                  setOpen(false);
                  setQ("");
                }}
              >
                <Avatar className="border-border/50 size-6 shrink-0 border">
                  {m.user?.image ? <AvatarImage src={m.user.image} alt="" /> : null}
                  <AvatarFallback className="text-[9px]">{label.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="min-w-0 flex-1 truncate">{label}</span>
                {selected ? <Check className="text-muted-foreground size-3.5 shrink-0" aria-hidden /> : null}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
