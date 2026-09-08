import { prisma } from "@/lib/prisma";

export async function listExpenses(input: {
  take?: number;
  cursor?: string;
} = {}) {
  const take = Math.min(input.take ?? 50, 100);
  return prisma.expense.findMany({
    where: input.cursor ? { createdAt: { lt: new Date(input.cursor) } } : undefined,
    include: {
      createdBy: {
        select: { id: true, name: true, email: true }
      }
    },
    orderBy: { incurredAt: "desc" },
    take: take + 1
  }).then((expenses) => ({
    items: expenses.slice(0, take),
    nextCursor: expenses.length > take ? expenses[take].createdAt.toISOString() : null
  }));
}

export async function createExpense(input: {
  title: string;
  category: string;
  amount: number;
  incurredAt?: Date;
  notes?: string;
  createdById: string;
}) {
  return prisma.expense.create({
    data: {
      title: input.title,
      category: input.category,
      amount: input.amount,
      incurredAt: input.incurredAt ?? new Date(),
      notes: input.notes,
      createdById: input.createdById
    }
  });
}
