import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, conversations as conversationsTable, messages as messagesTable, expensesTable, incomeTable } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";
import {
  CreateOpenaiConversationBody,
  GetOpenaiConversationParams,
  DeleteOpenaiConversationParams,
  ListOpenaiMessagesParams,
  SendOpenaiMessageParams,
  SendOpenaiMessageBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

function mapConversation(row: typeof conversationsTable.$inferSelect) {
  return {
    id: row.id,
    title: row.title,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapMessage(row: typeof messagesTable.$inferSelect) {
  return {
    id: row.id,
    conversationId: row.conversationId,
    role: row.role,
    content: row.content,
    createdAt: row.createdAt.toISOString(),
  };
}

async function buildFinancialContext(): Promise<string> {
  const [expenses, incomeEntries] = await Promise.all([
    db.select().from(expensesTable).where(eq(expensesTable.status, "active")),
    db.select().from(incomeTable).where(eq(incomeTable.status, "active")),
  ]);

  const totalMonthlyExpenses = expenses
    .filter((e) => e.frequency === "monthly")
    .reduce((s, e) => s + Number(e.amount), 0);
  const totalAnnualExpenses = expenses
    .filter((e) => e.frequency === "annually")
    .reduce((s, e) => s + Number(e.amount), 0);
  const totalMonthlyIncome = incomeEntries
    .filter((i) => i.frequency === "monthly")
    .reduce((s, i) => s + Number(i.amount), 0);
  const totalAnnualIncome = incomeEntries
    .filter((i) => i.frequency === "annually")
    .reduce((s, i) => s + Number(i.amount), 0);

  const annualizedExpenses = totalMonthlyExpenses * 12 + totalAnnualExpenses;
  const annualizedIncome = totalMonthlyIncome * 12 + totalAnnualIncome;
  const netPL = annualizedIncome - annualizedExpenses;

  const expenseList = expenses
    .slice(0, 20)
    .map((e) => `- ${e.name} (${e.category}): ${e.currency} ${Number(e.amount).toFixed(2)}/${e.frequency}`)
    .join("\n");

  const incomeList = incomeEntries
    .slice(0, 20)
    .map((i) => `- ${i.name} (${i.category}): ${i.currency} ${Number(i.amount).toFixed(2)}/${i.frequency}`)
    .join("\n");

  return `Current Financial Snapshot:
Monthly Expenses: ${totalMonthlyExpenses.toFixed(2)}
Annual Expenses: ${totalAnnualExpenses.toFixed(2)}
Annualized Total Expenses: ${annualizedExpenses.toFixed(2)}
Monthly Income: ${totalMonthlyIncome.toFixed(2)}
Annual Income: ${totalAnnualIncome.toFixed(2)}
Annualized Total Income: ${annualizedIncome.toFixed(2)}
Net P&L (annualized): ${netPL.toFixed(2)} (${netPL >= 0 ? "PROFITABLE" : "IN THE RED"})

Active Expenses:
${expenseList || "None recorded"}

Active Income Sources:
${incomeList || "None recorded"}`;
}

router.get("/openai/conversations", async (_req, res): Promise<void> => {
  const convs = await db
    .select()
    .from(conversationsTable)
    .orderBy(asc(conversationsTable.updatedAt));

  res.json(convs.map(mapConversation));
});

router.post("/openai/conversations", async (req, res): Promise<void> => {
  const parsed = CreateOpenaiConversationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [conv] = await db
    .insert(conversationsTable)
    .values({ title: parsed.data.title })
    .returning();

  res.status(201).json(mapConversation(conv));
});

router.get("/openai/conversations/:id", async (req, res): Promise<void> => {
  const params = GetOpenaiConversationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [conv] = await db
    .select()
    .from(conversationsTable)
    .where(eq(conversationsTable.id, params.data.id));

  if (!conv) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  const msgs = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, params.data.id))
    .orderBy(asc(messagesTable.createdAt));

  res.json({ ...mapConversation(conv), messages: msgs.map(mapMessage) });
});

router.delete("/openai/conversations/:id", async (req, res): Promise<void> => {
  const params = DeleteOpenaiConversationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db
    .delete(messagesTable)
    .where(eq(messagesTable.conversationId, params.data.id));

  const [conv] = await db
    .delete(conversationsTable)
    .where(eq(conversationsTable.id, params.data.id))
    .returning();

  if (!conv) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  res.sendStatus(204);
});

router.get("/openai/conversations/:id/messages", async (req, res): Promise<void> => {
  const params = ListOpenaiMessagesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const msgs = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, params.data.id))
    .orderBy(asc(messagesTable.createdAt));

  res.json(msgs.map(mapMessage));
});

router.post("/openai/conversations/:id/messages", async (req, res): Promise<void> => {
  const params = SendOpenaiMessageParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = SendOpenaiMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [conv] = await db
    .select()
    .from(conversationsTable)
    .where(eq(conversationsTable.id, params.data.id));

  if (!conv) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  await db.insert(messagesTable).values({
    conversationId: params.data.id,
    role: "user",
    content: parsed.data.content,
  });

  const history = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, params.data.id))
    .orderBy(asc(messagesTable.createdAt));

  const financialContext = await buildFinancialContext();

  const systemPrompt = `You are an expert financial advisor and CFO consultant. You are helping a founder understand and manage their company's finances. You have access to their current financial data.

${financialContext}

Provide practical, actionable financial advice. Be concise but insightful. Point out risks, opportunities, and recommendations based on the actual data you have. If the user is in the red (expenses exceed income), prioritize helping them understand why and what to do. Format numbers clearly with currency symbols. Be direct and professional.`;

  const chatMessages = [
    { role: "system" as const, content: systemPrompt },
    ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
  ];

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let fullResponse = "";

  const stream = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 8192,
    messages: chatMessages,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      fullResponse += content;
      res.write(`data: ${JSON.stringify({ content })}\n\n`);
    }
  }

  await db.insert(messagesTable).values({
    conversationId: params.data.id,
    role: "assistant",
    content: fullResponse,
  });

  await db
    .update(conversationsTable)
    .set({ updatedAt: new Date() })
    .where(eq(conversationsTable.id, params.data.id));

  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();
});

export default router;
