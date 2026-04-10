import { pgTable, text, serial, numeric, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const frequencyEnum = pgEnum("frequency", ["monthly", "annually", "one_time"]);
export const statusEnum = pgEnum("status", ["active", "cancelled"]);

export const expensesTable = pgTable("expenses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  category: text("category").notNull(),
  frequency: frequencyEnum("frequency").notNull().default("monthly"),
  status: statusEnum("status").notNull().default("active"),
  notes: text("notes"),
  renewalDate: text("renewal_date"),
  purchaseDate: text("purchase_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertExpenseSchema = createInsertSchema(expensesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expensesTable.$inferSelect;
