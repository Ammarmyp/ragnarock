/**
 * Dashboard Page
 * Main dashboard view - imports DashboardLayout for composition
 */

import { DashboardLayout } from "@/layouts/dashboard/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart3, FileText, FolderKanban, Users } from "lucide-react";

export default function DashboardPage() {
  // TODO: Fetch dashboard data using React Query when API is ready
  const stats = [
    {
      title: "Total Projects",
      value: "12",
      description: "+2 from last month",
      icon: FolderKanban,
    },
    {
      title: "Requirements",
      value: "248",
      description: "+34 from last month",
      icon: FileText,
    },
    {
      title: "Team Members",
      value: "8",
      description: "+1 from last month",
      icon: Users,
    },
    {
      title: "Completion Rate",
      value: "87%",
      description: "+5% from last month",
      icon: BarChart3,
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-6">
        {/* Page Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s an overview of your projects and
            requirements.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>
                Your most recently updated projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No projects yet. Start by creating your first project.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Requirements</CardTitle>
              <CardDescription>
                Latest requirement updates from your team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No requirements yet. Add your first requirement to get started.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
