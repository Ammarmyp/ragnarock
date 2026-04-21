export function safeDashboardRedirect(raw: string | null | undefined): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/dashboard";
  }
  if (!raw.startsWith("/dashboard")) {
    return "/dashboard";
  }
  return raw;
}
