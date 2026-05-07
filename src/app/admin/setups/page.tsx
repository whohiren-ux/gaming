import { SetupManager } from "@/components/admin/setup-manager";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminSetupsPage() {
  const setups = await prisma.setup.findMany({
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }]
  });

  return (
    <SetupManager
      initialSetups={setups.map((setup) => ({
        ...setup,
        hourlyPrice: Number(setup.hourlyPrice)
      }))}
    />
  );
}
