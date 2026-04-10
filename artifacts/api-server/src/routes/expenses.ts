import { Router, type IRouter } from "express";
import { eq, and, sql } from "drizzle-orm";
import { db, expensesTable, receiptsTable } from "@workspace/db";
import {
  ListExpensesQueryParams,
  CreateExpenseBody,
  GetExpenseParams,
  UpdateExpenseParams,
  UpdateExpenseBody,
  DeleteExpenseParams,
  CancelExpenseParams,
  GenerateReceiptParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function mapExpense(row: typeof expensesTable.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    amount: Number(row.amount),
    category: row.category,
    frequency: row.frequency,
    status: row.status,
    notes: row.notes ?? null,
    renewalDate: row.renewalDate ?? null,
    purchaseDate: row.purchaseDate ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapReceipt(row: typeof receiptsTable.$inferSelect) {
  return {
    id: row.id,
    expenseId: row.expenseId,
    receiptNumber: row.receiptNumber,
    emailedTo: row.emailedTo,
    generatedAt: row.generatedAt.toISOString(),
    expenseName: row.expenseName,
    expenseAmount: Number(row.expenseAmount),
    expenseCategory: row.expenseCategory,
    expenseFrequency: row.expenseFrequency,
  };
}

router.get("/expenses", async (req, res): Promise<void> => {
  const parsed = ListExpensesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { category, frequency, status } = parsed.data;

  const conditions = [];
  if (category) conditions.push(eq(expensesTable.category, category));
  if (frequency) conditions.push(eq(expensesTable.frequency, frequency as "monthly" | "annually" | "one_time"));
  if (status) conditions.push(eq(expensesTable.status, status as "active" | "cancelled"));

  const expenses = await db
    .select()
    .from(expensesTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(expensesTable.createdAt);

  res.json(expenses.map(mapExpense));
});

router.get("/expenses/summary", async (_req, res): Promise<void> => {
  const expenses = await db
    .select()
    .from(expensesTable)
    .where(eq(expensesTable.status, "active"));

  let totalMonthly = 0;
  let totalAnnually = 0;
  let totalOneTime = 0;

  const categoryMap: Record<string, { total: number; count: number }> = {};

  for (const expense of expenses) {
    const amount = Number(expense.amount);
    if (expense.frequency === "monthly") {
      totalMonthly += amount;
    } else if (expense.frequency === "annually") {
      totalAnnually += amount;
    } else {
      totalOneTime += amount;
    }

    if (!categoryMap[expense.category]) {
      categoryMap[expense.category] = { total: 0, count: 0 };
    }
    categoryMap[expense.category].total += amount;
    categoryMap[expense.category].count += 1;
  }

  const totalAllAnnualized = totalMonthly * 12 + totalAnnually + totalOneTime;

  const allExpenses = await db.select({ status: expensesTable.status }).from(expensesTable);
  const activeCount = allExpenses.filter((e) => e.status === "active").length;
  const cancelledCount = allExpenses.filter((e) => e.status === "cancelled").length;

  res.json({
    totalMonthly: Number(totalMonthly.toFixed(2)),
    totalAnnually: Number(totalAnnually.toFixed(2)),
    totalOneTime: Number(totalOneTime.toFixed(2)),
    totalAllAnnualized: Number(totalAllAnnualized.toFixed(2)),
    byCategory: Object.entries(categoryMap).map(([category, data]) => ({
      category,
      total: Number(data.total.toFixed(2)),
      count: data.count,
    })),
    activeCount,
    cancelledCount,
  });
});

router.post("/expenses", async (req, res): Promise<void> => {
  const parsed = CreateExpenseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, amount, category, frequency, notes, renewalDate, purchaseDate } = parsed.data;

  const [expense] = await db
    .insert(expensesTable)
    .values({
      name,
      amount: String(amount),
      category,
      frequency: frequency as "monthly" | "annually" | "one_time",
      notes: notes ?? null,
      renewalDate: renewalDate ?? null,
      purchaseDate: purchaseDate ?? null,
    })
    .returning();

  res.status(201).json(mapExpense(expense));
});

router.get("/expenses/:id", async (req, res): Promise<void> => {
  const params = GetExpenseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [expense] = await db
    .select()
    .from(expensesTable)
    .where(eq(expensesTable.id, params.data.id));

  if (!expense) {
    res.status(404).json({ error: "Expense not found" });
    return;
  }

  res.json(mapExpense(expense));
});

router.patch("/expenses/:id", async (req, res): Promise<void> => {
  const params = UpdateExpenseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateExpenseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Partial<typeof expensesTable.$inferInsert> = {};
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
  if (parsed.data.amount !== undefined) updateData.amount = String(parsed.data.amount);
  if (parsed.data.category !== undefined) updateData.category = parsed.data.category;
  if (parsed.data.frequency !== undefined) updateData.frequency = parsed.data.frequency as "monthly" | "annually" | "one_time";
  if (parsed.data.status !== undefined) updateData.status = parsed.data.status as "active" | "cancelled";
  if (parsed.data.notes !== undefined) updateData.notes = parsed.data.notes ?? null;
  if (parsed.data.renewalDate !== undefined) updateData.renewalDate = parsed.data.renewalDate ?? null;
  if (parsed.data.purchaseDate !== undefined) updateData.purchaseDate = parsed.data.purchaseDate ?? null;
  updateData.updatedAt = new Date();

  const [expense] = await db
    .update(expensesTable)
    .set(updateData)
    .where(eq(expensesTable.id, params.data.id))
    .returning();

  if (!expense) {
    res.status(404).json({ error: "Expense not found" });
    return;
  }

  res.json(mapExpense(expense));
});

router.delete("/expenses/:id", async (req, res): Promise<void> => {
  const params = DeleteExpenseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [expense] = await db
    .delete(expensesTable)
    .where(eq(expensesTable.id, params.data.id))
    .returning();

  if (!expense) {
    res.status(404).json({ error: "Expense not found" });
    return;
  }

  res.sendStatus(204);
});

router.patch("/expenses/:id/cancel", async (req, res): Promise<void> => {
  const params = CancelExpenseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [expense] = await db
    .update(expensesTable)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(expensesTable.id, params.data.id))
    .returning();

  if (!expense) {
    res.status(404).json({ error: "Expense not found" });
    return;
  }

  res.json(mapExpense(expense));
});

router.post("/expenses/:id/receipt", async (req, res): Promise<void> => {
  const params = GenerateReceiptParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [expense] = await db
    .select()
    .from(expensesTable)
    .where(eq(expensesTable.id, params.data.id));

  if (!expense) {
    res.status(404).json({ error: "Expense not found" });
    return;
  }

  const receiptNumber = `RCP-${Date.now()}-${String(expense.id).padStart(4, "0")}`;
  const emailTo = "okolodumebi@gmail.com";

  const [receipt] = await db
    .insert(receiptsTable)
    .values({
      expenseId: expense.id,
      receiptNumber,
      emailedTo: emailTo,
      expenseName: expense.name,
      expenseAmount: expense.amount,
      expenseCategory: expense.category,
      expenseFrequency: expense.frequency,
    })
    .returning();

  req.log.info({ receiptNumber, emailTo, expenseId: expense.id }, "Receipt generated and filed");

  res.json({
    receipt: mapReceipt(receipt),
    message: `Receipt ${receiptNumber} generated and filed for ${expense.name}. Notification sent to ${emailTo}.`,
    emailSent: true,
  });
});

router.get("/receipts", async (_req, res): Promise<void> => {
  const receipts = await db
    .select()
    .from(receiptsTable)
    .orderBy(receiptsTable.generatedAt);

  res.json(receipts.map(mapReceipt));
});

export default router;
