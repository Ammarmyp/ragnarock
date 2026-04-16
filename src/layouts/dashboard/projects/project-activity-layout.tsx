"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjectActivity } from "@/hooks/use-projects";

export function ProjectActivityLayout({ projectId }: { projectId: string }) {
  const { data, isLoading } = useProjectActivity(projectId, { page: 1, limit: 50 });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading && <p className="text-sm text-muted-foreground">Loading activity...</p>}
        {data?.data.map((item) => (
          <div key={item.id} className="rounded-md border p-3">
            <p className="font-medium">{item.action}</p>
            <p className="text-xs text-muted-foreground">
              {item.entityType} {item.entityId ? `#${item.entityId}` : ""}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
