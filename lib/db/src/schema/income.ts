import { pgTable, text, serial, numeric, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const incomeFrequencyEnum = pgEnum("income_frequency", ["monthly", "annually", "one_time"]);
export const incomeStatusEnum = pgEnum("income_status", ["active", "cancelled"]);

export const incomeTable = pgTable("income", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  category: text("category").notNull(),
  frequency: incomeFrequencyEnum("frequency").notNull().default("monthly"),
  status: incomeStatusEnum("status").notNull().default("active"),
  notes: text("notes"),
  receivedDate: text("received_date"),
  renewalDate: text("renewal_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertIncomeSchema = createInsertSchema(incomeTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertIncome = z.infer<typeof insertIncomeSchema>;
export type Income = typeof incomeTable.$inferSelect;
