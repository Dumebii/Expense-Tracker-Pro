import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, incomeTable } from "@workspace/db";
import {
  ListIncomeQueryParams,
  CreateIncomeBody,
  GetIncomeEntryParams,
  UpdateIncomeEntryParams,
  UpdateIncomeEntryBody,
  DeleteIncomeEntryParams,
  CancelIncomeEntryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function mapIncome(row: typeof incomeTable.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    amount: Number(row.amount),
    currency: row.currency,
    category: row.category,
    frequency: row.frequency,
    status: row.status,
    notes: row.notes ?? null,
    receivedDate: row.receivedDate ?? null,
    renewalDate: row.renewalDate ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

router.get("/income", async (req, res): Promise<void> => {
  const parsed = ListIncomeQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { category, frequency, status } = parsed.data;

  const conditions = [];
  if (category) conditions.push(eq(incomeTable.category, category));
  if (frequency) conditions.push(eq(incomeTable.frequency, frequency as "monthly" | "annually" | "one_time"));
  if (status) conditions.push(eq(incomeTable.status, status as "active" | "cancelled"));

  const entries = await db
    .select()
    .from(incomeTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(incomeTable.createdAt);

  res.json(entries.map(mapIncome));
});

router.get("/income/summary", async (_req, res): Promise<void> => {
  const entries = await db
    .select()
    .from(incomeTable)
    .where(eq(incomeTable.status, "active"));

  let totalMonthly = 0;
  let totalAnnually = 0;
  let totalOneTime = 0;

  const categoryMap: Record<string, { total: number; count: number }> = {};

  for (const entry of entries) {
    const amount = Number(entry.amount);
    if (entry.frequency === "monthly") {
      totalMonthly += amount;
    } else if (entry.frequency === "annually") {
      totalAnnually += amount;
    } else {
      totalOneTime += amount;
    }

    if (!categoryMap[entry.category]) {
      categoryMap[entry.category] = { total: 0, count: 0 };
    }
    categoryMap[entry.category].total += amount;
    categoryMap[entry.category].count += 1;
  }

  const totalAllAnnualized = totalMonthly * 12 + totalAnnually + totalOneTime;

  const allEntries = await db.select({ status: incomeTable.status }).from(incomeTable);
  const activeCount = allEntries.filter((e) => e.status === "active").length;
  const cancelledCount = allEntries.filter((e) => e.status === "cancelled").length;

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

router.post("/income", async (req, res): Promise<void> => {
  const parsed = CreateIncomeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, amount, currency, category, frequency, notes, receivedDate, renewalDate } = parsed.data;

  const [entry] = await db
    .insert(incomeTable)
    .values({
      name,
      amount: String(amount),
      currency: currency ?? "USD",
      category,
      frequency: frequency as "monthly" | "annually" | "one_time",
      notes: notes ?? null,
      receivedDate: receivedDate ?? null,
      renewalDate: renewalDate ?? null,
    })
    .returning();

  res.status(201).json(mapIncome(entry));
});

router.get("/income/:id", async (req, res): Promise<void> => {
  const params = GetIncomeEntryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [entry] = await db
    .select()
    .from(incomeTable)
    .where(eq(incomeTable.id, params.data.id));

  if (!entry) {
    res.status(404).json({ error: "Income entry not found" });
    return;
  }

  res.json(mapIncome(entry));
});

router.patch("/income/:id", async (req, res): Promise<void> => {
  const params = UpdateIncomeEntryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateIncomeEntryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Partial<typeof incomeTable.$inferInsert> = {};
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
  if (parsed.data.amount !== undefined) updateData.amount = String(parsed.data.amount);
  if (parsed.data.currency !== undefined) updateData.currency = parsed.data.currency;
  if (parsed.data.category !== undefined) updateData.category = parsed.data.category;
  if (parsed.data.frequency !== undefined) updateData.frequency = parsed.data.frequency as "monthly" | "annually" | "one_time";
  if (parsed.data.status !== undefined) updateData.status = parsed.data.status as "active" | "cancelled";
  if (parsed.data.notes !== undefined) updateData.notes = parsed.data.notes ?? null;
  if (parsed.data.receivedDate !== undefined) updateData.receivedDate = parsed.data.receivedDate ?? null;
  if (parsed.data.renewalDate !== undefined) updateData.renewalDate = parsed.data.renewalDate ?? null;
  updateData.updatedAt = new Date();

  const [entry] = await db
    .update(incomeTable)
    .set(updateData)
    .where(eq(incomeTable.id, params.data.id))
    .returning();

  if (!entry) {
    res.status(404).json({ error: "Income entry not found" });
    return;
  }

  res.json(mapIncome(entry));
});

router.delete("/income/:id", async (req, res): Promise<void> => {
  const params = DeleteIncomeEntryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [entry] = await db
    .delete(incomeTable)
    .where(eq(incomeTable.id, params.data.id))
    .returning();

  if (!entry) {
    res.status(404).json({ error: "Income entry not found" });
    return;
  }

  res.sendStatus(204);
});

router.patch("/income/:id/cancel", async (req, res): Promise<void> => {
  const params = CancelIncomeEntryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [entry] = await db
    .update(incomeTable)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(incomeTable.id, params.data.id))
    .returning();

  if (!entry) {
    res.status(404).json({ error: "Income entry not found" });
    return;
  }

  res.json(mapIncome(entry));
});

export default router;
