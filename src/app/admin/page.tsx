import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { getDashboardSummary } from "@/lib/analytics-service";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const summary = await getDashboardSummary();
  return <AdminDashboard initialSummary={summary} />;
}
