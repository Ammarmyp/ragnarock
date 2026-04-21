import { redirect } from "next/navigation";

/**
 * Legacy `/dashboard` entry — the app home is the project list.
 */
export default function DashboardPage() {
  redirect("/dashboard/projects");
}
