import { updateUserRoleAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 200
  });

  return (
    <div className="grid gap-4">
      {users.map((user) => (
        <Card key={user.id}>
          <CardContent className="grid gap-4 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h3 className="font-bold text-white">{user.name || user.email || user.phone || "Customer"}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{user.email} · {user.phone} · {user.role}</p>
            </div>
            <form action={updateUserRoleAction} className="flex gap-2">
              <input type="hidden" name="userId" value={user.id} />
              <select name="role" defaultValue={user.role} className="rounded-md border border-input bg-ink-950 px-3 text-sm">
                <option value="CUSTOMER">CUSTOMER</option>
                <option value="STAFF">STAFF</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              <Button variant="outline">Update</Button>
            </form>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
