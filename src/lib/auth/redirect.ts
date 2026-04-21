const DASHBOARD_HOME = "/dashboard/projects";

export function safeDashboardRedirect(raw: string | null | undefined): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return DASHBOARD_HOME;
  }
  if (!raw.startsWith("/dashboard")) {
    return DASHBOARD_HOME;
  }
  return raw;
}
