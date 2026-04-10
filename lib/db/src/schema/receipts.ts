import { pgTable, text, serial, numeric, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { expensesTable } from "./expenses";

export const receiptsTable = pgTable("receipts", {
  id: serial("id").primaryKey(),
  expenseId: integer("expense_id").notNull().references(() => expensesTable.id),
  receiptNumber: text("receipt_number").notNull(),
  emailedTo: text("emailed_to").notNull(),
  expenseName: text("expense_name").notNull(),
  expenseAmount: numeric("expense_amount", { precision: 12, scale: 2 }).notNull(),
  expenseCategory: text("expense_category").notNull(),
  expenseFrequency: text("expense_frequency").notNull(),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
});

export const insertReceiptSchema = createInsertSchema(receiptsTable).omit({ id: true, generatedAt: true });
export type InsertReceipt = z.infer<typeof insertReceiptSchema>;
export type Receipt = typeof receiptsTable.$inferSelect;
