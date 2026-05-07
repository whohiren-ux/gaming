import { createExpenseAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatINR } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminExpensesPage() {
  const expenses = await prisma.expense.findMany({
    include: { createdBy: { select: { name: true, email: true } } },
    orderBy: { incurredAt: "desc" },
    take: 100
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <Card className="xl:sticky xl:top-24 xl:self-start">
        <CardHeader>
          <CardTitle>Add expense</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createExpenseAction} className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input name="title" required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Category</Label>
                <Input name="category" required />
              </div>
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input name="amount" type="number" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input name="incurredAt" type="date" />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea name="notes" />
            </div>
            <Button className="w-full">Save expense</Button>
          </form>
        </CardContent>
      </Card>
      <div className="grid gap-4">
        {expenses.map((expense) => (
          <Card key={expense.id}>
            <CardContent className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
              <div>
                <h3 className="font-bold text-white">{expense.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {expense.category} · {expense.incurredAt.toLocaleDateString()} · {expense.createdBy?.name || expense.createdBy?.email || "System"}
                </p>
              </div>
              <p className="text-xl font-black text-white">{formatINR(expense.amount)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
