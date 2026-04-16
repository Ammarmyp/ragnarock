"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjectOverview } from "@/hooks/use-projects";

export function ProjectOverviewLayout({ projectId }: { projectId: string }) {
  const { data, isLoading } = useProjectOverview(projectId);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading overview...</p>;
  }

  const project = (data?.project ?? {}) as Record<string, unknown>;
  const recentTasks = ((data?.recentTasks ?? []) as unknown[]).length;
  const recentRequirements = ((data?.recentRequirements ?? []) as unknown[]).length;
  const recentDocs = ((data?.recentDocs ?? []) as unknown[]).length;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent className="capitalize">{String(project.status ?? "unknown")}</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Recent Tasks</CardTitle>
        </CardHeader>
        <CardContent>{recentTasks}</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Recent Requirements</CardTitle>
        </CardHeader>
        <CardContent>{recentRequirements}</CardContent>
      </Card>
      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle>Recent Docs Updated</CardTitle>
        </CardHeader>
        <CardContent>{recentDocs}</CardContent>
      </Card>
    </div>
  );
}
