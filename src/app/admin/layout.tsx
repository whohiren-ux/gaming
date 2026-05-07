import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { isAdminRole } from "@/lib/access-control";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!isAdminRole(session?.user?.role)) {
    redirect("/login?callbackUrl=/admin");
  }

  return <AdminShell>{children}</AdminShell>;
}
