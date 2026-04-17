"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ProjectDocumentation } from "@/api/projects.api";
import { DOCUMENTATION_STATUS_LABELS, DOCUMENTATION_TYPE_LABELS } from "@/lib/documentation-labels";
import { DocumentationDownloadMenu } from "@/components/documentation/documentation-download-menu";

type DocumentationListCardProps = {
  projectId: string;
  doc: ProjectDocumentation;
};

export function DocumentationListCard({ projectId, doc }: DocumentationListCardProps) {
  const detailHref = `/dashboard/projects/${projectId}/documentation/${doc.id}`;

  return (
    <Card className="group flex flex-col overflow-hidden rounded-xl border border-border/60 bg-gradient-to-b from-card to-card/95 shadow-sm transition-shadow duration-200 hover:border-border hover:shadow-md">
      <CardHeader className="space-y-2.5 pb-3">
        <div className="flex flex-wrap items-start gap-2">
          <Badge variant="secondary" className="max-w-full border-transparent font-normal">
            {DOCUMENTATION_TYPE_LABELS[doc.type]}
          </Badge>
          <Badge variant="outline" className="border-border/80 font-normal">
            {DOCUMENTATION_STATUS_LABELS[doc.status]}
          </Badge>
        </div>
        <h3 className="line-clamp-2 text-base leading-snug font-semibold tracking-tight text-foreground/95">
          {doc.title}
        </h3>
      </CardHeader>
      <CardContent className="flex-1 space-y-1.5 pb-3">
        <p className="text-muted-foreground text-xs leading-relaxed">
          Created {new Date(doc.createdAt).toLocaleString()}
        </p>
        <p className="text-muted-foreground text-xs leading-relaxed">Updated {new Date(doc.updatedAt).toLocaleString()}</p>
        <p className="text-muted-foreground/90 text-xs">Version {doc.version}</p>
      </CardContent>
      <CardFooter className="mt-auto flex flex-wrap gap-2 border-t border-border/50 bg-muted/20 pt-3">
        <Button size="sm" asChild className="shadow-none">
          <Link href={detailHref}>
            <Eye className="mr-1 size-4" />
            View detail
          </Link>
        </Button>
        <DocumentationDownloadMenu compact title={doc.title} markdown={doc.content} />
      </CardFooter>
    </Card>
  );
}
