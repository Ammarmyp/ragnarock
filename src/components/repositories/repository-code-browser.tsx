"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, FileIcon, FolderIcon, FolderOpenIcon, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { browseRepository, getFriendlyRepositoryError, type RepositoryBrowseResponse } from "@/api/repositories.api";
import { useProjectRepositoryDetail, useRepositoryFile } from "@/hooks/use-repositories";
import { toast } from "@/lib/toast";
import { cn } from "@/utils/cn";
import {
  Sidebar,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CodeBlock } from "@/components/repositories/code-block";

type RepositoryCodeBrowserProps = {
  projectId: string;
  repositoryId: string;
};

type TreeNode = {
  type: "dir" | "file";
  name: string;
  path: string;
  sha: string;
  size: number | null;
};

function guessLanguageFromPath(path: string) {
  const name = path.split("/").pop() ?? path;
  const parts = name.split(".");
  if (parts.length < 2) return "";
  const ext = parts.pop()!.toLowerCase();
  switch (ext) {
    case "ts":
      return "ts";
    case "tsx":
      return "tsx";
    case "js":
      return "js";
    case "jsx":
      return "jsx";
    case "json":
      return "json";
    case "md":
    case "mdx":
      return "md";
    case "yml":
    case "yaml":
      return "yaml";
    case "css":
      return "css";
    case "scss":
      return "scss";
    case "html":
      return "html";
    case "py":
      return "python";
    case "go":
      return "go";
    case "java":
      return "java";
    case "rb":
      return "ruby";
    case "rs":
      return "rust";
    case "sh":
      return "bash";
    default:
      return ext;
  }
}

function TreeItem({
  node,
  level,
  activeFile,
  openPaths,
  onToggleDir,
  onSelectFile,
  getChildren,
  isLoading,
}: {
  node: TreeNode;
  level: number;
  activeFile: string | null;
  openPaths: Set<string>;
  onToggleDir: (path: string) => void;
  onSelectFile: (path: string) => void;
  getChildren: (path: string) => TreeNode[] | undefined;
  isLoading: (path: string) => boolean;
}) {
  if (node.type === "file") {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          isActive={node.path === activeFile}
          onClick={() => onSelectFile(node.path)}
          className="rounded-none gap-2"
          style={{ paddingLeft: `${0.75 + level * 1.25}rem` } as React.CSSProperties}
        >
          <FileIcon className="size-4" />
          <span className="min-w-0 flex-1 truncate">{node.name}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  const isOpen = openPaths.has(node.path);
  const children = getChildren(node.path);

  return (
    <SidebarMenuItem>
      <Collapsible className="group/collapsible" open={isOpen} onOpenChange={() => onToggleDir(node.path)}>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            className="rounded-none gap-2"
            style={{ paddingLeft: `${0.75 + level * 1.25}rem` } as React.CSSProperties}
          >
            <FolderIcon className="[[data-state=open]>&]:hidden" />
            <FolderOpenIcon className="[[data-state=closed]>&]:hidden" />
            <span className="min-w-0 flex-1 truncate">{node.name}</span>
            {isLoading(node.path) ? <Loader2 className="size-3.5 animate-spin" /> : null}
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub className="m-0 w-full translate-x-0 border-none p-0">
            {children ? (
              children.length ? (
                children.map((c) => (
                  <TreeItem
                    key={c.sha}
                    node={c}
                    level={level + 1}
                    activeFile={activeFile}
                    openPaths={openPaths}
                    onToggleDir={onToggleDir}
                    onSelectFile={onSelectFile}
                    getChildren={getChildren}
                    isLoading={isLoading}
                  />
                ))
              ) : (
                <div className="text-muted-foreground px-3 py-2 text-xs" style={{ paddingLeft: `${1.75 + (level + 1) * 1.25}rem` }}>
                  Empty
                </div>
              )
            ) : isLoading(node.path) ? (
              <div className="px-2 py-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SidebarMenuSkeleton key={i} showIcon />
                ))}
              </div>
            ) : null}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
}

export function RepositoryCodeBrowser({ projectId, repositoryId }: RepositoryCodeBrowserProps) {
  const qc = useQueryClient();
  const detailQuery = useProjectRepositoryDetail(projectId, repositoryId);
  const defaultBranch = detailQuery.data?.defaultBranch;
  const defaultRef = detailQuery.data?.defaultBranch ?? "main";

  const [ref, setRef] = useState<string>(defaultRef);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [explorerCollapsed, setExplorerCollapsed] = useState(false);

  const [expanded, setExpanded] = useState<Set<string>>(() => new Set([""])); // "" is root
  const [childrenByPath, setChildrenByPath] = useState<Record<string, TreeNode[]>>({});
  const [loadingPaths, setLoadingPaths] = useState<Set<string>>(() => new Set());
  const [treeError, setTreeError] = useState<unknown>(null);

  // Keep ref synced once we know the real default branch.
  useEffect(() => {
    if (!defaultBranch) return;
    setRef((prev) => (prev === "main" ? defaultBranch : prev));
  }, [defaultBranch]);

  const fileQuery = useRepositoryFile(
    projectId,
    repositoryId,
    selectedFilePath ? { path: selectedFilePath, ref } : { path: "", ref },
    { enabled: Boolean(selectedFilePath), retry: false },
  );

  const loadChildren = async (path: string) => {
    if (childrenByPath[path]) return;
    if (loadingPaths.has(path)) return;
    setTreeError(null);
    setLoadingPaths((prev) => new Set(prev).add(path));
    try {
      const data = await qc.fetchQuery({
        queryKey: ["repositories", "browse", projectId, repositoryId, { path, ref }],
        queryFn: () => browseRepository(projectId, repositoryId, { path, ref }),
        staleTime: 60_000,
      });
      const items = (data as RepositoryBrowseResponse).items as unknown as TreeNode[];
      setChildrenByPath((prev) => ({ ...prev, [path]: items }));
    } catch (e) {
      setTreeError(e);
    } finally {
      setLoadingPaths((prev) => {
        const next = new Set(prev);
        next.delete(path);
        return next;
      });
    }
  };

  // Load root on mount/ref change.
  useEffect(() => {
    setChildrenByPath({});
    setExpanded(new Set([""]));
    setSelectedFilePath(null);
    void loadChildren("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, repositoryId, ref]);

  const visibleNodes = useMemo(() => {
    return childrenByPath[""] ?? [];
  }, [childrenByPath]);

  const toggleDir = (path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
    void loadChildren(path);
  };

  return (
    <div className="flex h-full w-full min-h-0 min-w-0 flex-row gap-3 overflow-hidden">
      <Card
        className="h-full min-h-0 overflow-hidden"
        style={{ width: explorerCollapsed ? "3.25rem" : "22rem" }}
      >
        <CardContent className="flex h-full min-h-0 flex-1 flex-col p-0">
          <SidebarProvider className="flex h-full min-h-0 flex-col overflow-hidden">
            <Sidebar collapsible="none" className="flex h-full min-h-0 w-full flex-col overflow-hidden">
              <SidebarGroupLabel className={cn(
                "h-12 rounded-none border-b px-3 text-sm flex items-center gap-2",
                explorerCollapsed ? "justify-center" : "justify-between",
              )}>
                {explorerCollapsed ? null : <span>Files</span>}
                <div className={cn("flex items-center gap-2", explorerCollapsed ? "flex-col" : "")}>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={explorerCollapsed ? "px-2" : ""}
                    onClick={() => setExplorerCollapsed((v) => !v)}
                    aria-label={explorerCollapsed ? "Expand explorer" : "Collapse explorer"}
                    title={explorerCollapsed ? "Expand explorer" : "Collapse explorer"}
                  >
                    {explorerCollapsed ? "»" : "«"}
                  </Button>
                  {explorerCollapsed ? null : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={detailQuery.isPending}
                      onClick={() => {
                        setExpanded(new Set([""]));
                        setChildrenByPath({});
                        setSelectedFilePath(null);
                        void loadChildren("");
                      }}
                    >
                      Root
                    </Button>
                  )}
                </div>
              </SidebarGroupLabel>
              {explorerCollapsed ? null : (
                <SidebarGroup className="min-h-0 flex-1 p-0">
                  <SidebarGroupContent className="min-h-0 flex-1 overflow-y-auto">
                    {treeError ? (
                      <div className="p-3 text-sm">
                        <p className="text-destructive">{getFriendlyRepositoryError(treeError)}</p>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="mt-2"
                          onClick={() => void loadChildren("")}
                        >
                          Retry
                        </Button>
                      </div>
                    ) : (
                      <SidebarMenu className="translate-x-0 gap-1.5 py-2">
                        {!childrenByPath[""] && loadingPaths.has("") ? (
                          Array.from({ length: 10 }).map((_, i) => <SidebarMenuSkeleton key={i} showIcon />)
                        ) : visibleNodes.length ? (
                          visibleNodes.map((node) => (
                            <TreeItem
                              key={node.sha}
                              node={node}
                              level={0}
                              activeFile={selectedFilePath}
                              openPaths={expanded}
                              onToggleDir={toggleDir}
                              onSelectFile={(p) => setSelectedFilePath(p)}
                              getChildren={(p) => childrenByPath[p]}
                              isLoading={(p) => loadingPaths.has(p)}
                            />
                          ))
                        ) : (
                          <div className="text-muted-foreground px-4 py-2 text-sm">Empty</div>
                        )}
                      </SidebarMenu>
                    )}
                  </SidebarGroupContent>
                </SidebarGroup>
              )}
            </Sidebar>
          </SidebarProvider>
        </CardContent>
      </Card>

      <Card className="h-full min-h-0 min-w-0 flex-1 overflow-hidden">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0 pb-3">
          <div className="min-w-0">
            <CardTitle className="truncate text-base">
              {selectedFilePath ? selectedFilePath : "Select a file to preview"}
            </CardTitle>
            <p className="text-muted-foreground text-xs">Ref: {ref}</p>
          </div>
          {selectedFilePath ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1"
              disabled={!fileQuery.data?.content}
              onClick={() => {
                void (async () => {
                  try {
                    await navigator.clipboard.writeText(fileQuery.data?.content ?? "");
                    toast.success("Copied to clipboard");
                  } catch {
                    toast.error("Could not copy");
                  }
                })();
              }}
            >
              {fileQuery.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Copy className="size-3.5" />}
              {fileQuery.isPending ? "Loading…" : "Copy"}
            </Button>
          ) : null}
        </CardHeader>
        <Separator />
        <CardContent className="relative flex h-full min-h-0 flex-1 flex-col p-0">
          {selectedFilePath ? (
            fileQuery.isPending ? (
              <div className="space-y-2 p-3">
                {Array.from({ length: 18 }).map((_, i) => (
                  <Skeleton key={i} className={cn("h-3.5", i % 5 === 0 ? "w-[70%]" : "w-full")} />
                ))}
              </div>
            ) : fileQuery.isError ? (
              <div className="p-3 text-sm">
                <p className="text-destructive">{getFriendlyRepositoryError(fileQuery.error)}</p>
                <Button type="button" size="sm" variant="outline" className="mt-2" onClick={() => void fileQuery.refetch()}>
                  Retry
                </Button>
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                {fileQuery.data?.truncated ? (
                  <div className="border-border/60 bg-muted/20 border-b px-3 py-2 text-xs text-muted-foreground">
                    File truncated for preview.
                  </div>
                ) : null}
                <div className="min-h-0 min-w-0 flex-1 overflow-auto">
                  <CodeBlock
                    code={fileQuery.data?.content ?? ""}
                    lang={guessLanguageFromPath(selectedFilePath) || "text"}
                  />
                </div>
              </div>
            )
          ) : (
            <div className="text-muted-foreground flex min-h-0 flex-1 items-center justify-center p-6 text-sm">
              Pick a file on the left to view its contents.
            </div>
          )}
          {(loadingPaths.size > 0 || fileQuery.isPending) && selectedFilePath ? (
            <div className="text-muted-foreground pointer-events-none absolute right-6 top-6 hidden items-center gap-2 text-xs lg:flex">
              <Loader2 className="size-3.5 animate-spin" />
              Loading…
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

