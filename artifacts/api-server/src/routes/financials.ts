import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, expensesTable, incomeTable } from "@workspace/db";
import { GetFinancialOverviewQueryParams, GetAccountStatementQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/financials/overview", async (req, res): Promise<void> => {
  const parsed = GetFinancialOverviewQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const expenses = await db
    .select()
    .from(expensesTable)
    .where(eq(expensesTable.status, "active"));

  const incomeEntries = await db
    .select()
    .from(incomeTable)
    .where(eq(incomeTable.status, "active"));

  let monthlyExpenses = 0;
  let annualExpenses = 0;
  let oneTimeExpenses = 0;
  const expCategoryMap: Record<string, { total: number; count: number }> = {};

  for (const e of expenses) {
    const amt = Number(e.amount);
    if (e.frequency === "monthly") monthlyExpenses += amt;
    else if (e.frequency === "annually") annualExpenses += amt;
    else oneTimeExpenses += amt;

    if (!expCategoryMap[e.category]) expCategoryMap[e.category] = { total: 0, count: 0 };
    expCategoryMap[e.category].total += amt;
    expCategoryMap[e.category].count += 1;
  }

  let monthlyIncome = 0;
  let annualIncome = 0;
  let oneTimeIncome = 0;
  const incCategoryMap: Record<string, { total: number; count: number }> = {};

  for (const i of incomeEntries) {
    const amt = Number(i.amount);
    if (i.frequency === "monthly") monthlyIncome += amt;
    else if (i.frequency === "annually") annualIncome += amt;
    else oneTimeIncome += amt;

    if (!incCategoryMap[i.category]) incCategoryMap[i.category] = { total: 0, count: 0 };
    incCategoryMap[i.category].total += amt;
    incCategoryMap[i.category].count += 1;
  }

  const annualizedExpenses = monthlyExpenses * 12 + annualExpenses + oneTimeExpenses;
  const annualizedIncome = monthlyIncome * 12 + annualIncome + oneTimeIncome;
  const annualizedNetPL = annualizedIncome - annualizedExpenses;

  const totalIncome = monthlyIncome + annualIncome + oneTimeIncome;
  const totalExpenses = monthlyExpenses + annualExpenses + oneTimeExpenses;
  const netPL = totalIncome - totalExpenses;

  const mIncome = monthlyIncome + annualIncome / 12;
  const mExpenses = monthlyExpenses + annualExpenses / 12;
  const mNetPL = mIncome - mExpenses;

  res.json({
    totalIncome: Number(totalIncome.toFixed(2)),
    totalExpenses: Number(totalExpenses.toFixed(2)),
    netPL: Number(netPL.toFixed(2)),
    isInRed: netPL < 0,
    annualizedIncome: Number(annualizedIncome.toFixed(2)),
    annualizedExpenses: Number(annualizedExpenses.toFixed(2)),
    annualizedNetPL: Number(annualizedNetPL.toFixed(2)),
    monthlyIncome: Number(mIncome.toFixed(2)),
    monthlyExpenses: Number(mExpenses.toFixed(2)),
    monthlyNetPL: Number(mNetPL.toFixed(2)),
    incomeByCategory: Object.entries(incCategoryMap).map(([category, data]) => ({
      category,
      total: Number(data.total.toFixed(2)),
      count: data.count,
    })),
    expensesByCategory: Object.entries(expCategoryMap).map(([category, data]) => ({
      category,
      total: Number(data.total.toFixed(2)),
      count: data.count,
    })),
  });
});

router.get("/financials/statement", async (req, res): Promise<void> => {
  const parsed = GetAccountStatementQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const expenses = await db.select().from(expensesTable).orderBy(expensesTable.createdAt);
  const incomeEntries = await db.select().from(incomeTable).orderBy(incomeTable.createdAt);

  const entries = [
    ...expenses.map((e) => ({
      id: e.id,
      type: "expense" as const,
      name: e.name,
      amount: Number(e.amount),
      currency: e.currency,
      category: e.category,
      frequency: e.frequency,
      status: e.status,
      date: e.purchaseDate ?? null,
      createdAt: e.createdAt.toISOString(),
    })),
    ...incomeEntries.map((i) => ({
      id: i.id,
      type: "income" as const,
      name: i.name,
      amount: Number(i.amount),
      currency: i.currency,
      category: i.category,
      frequency: i.frequency,
      status: i.status,
      date: i.receivedDate ?? null,
      createdAt: i.createdAt.toISOString(),
    })),
  ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const totalIncome = incomeEntries
    .filter((i) => i.status === "active")
    .reduce((sum, i) => sum + Number(i.amount), 0);
  const totalExpenses = expenses
    .filter((e) => e.status === "active")
    .reduce((sum, e) => sum + Number(e.amount), 0);

  res.json({
    from: parsed.data.from ?? null,
    to: parsed.data.to ?? null,
    generatedAt: new Date().toISOString(),
    entries,
    totalIncome: Number(totalIncome.toFixed(2)),
    totalExpenses: Number(totalExpenses.toFixed(2)),
    netPL: Number((totalIncome - totalExpenses).toFixed(2)),
  });
});

export default router;
