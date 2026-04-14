-- Ledger - Complete Database Schema
-- Run this entire script in your Supabase SQL Editor

-- 1. Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  currency TEXT DEFAULT 'USD',
  receipt_email TEXT,
  display_currency TEXT DEFAULT 'USD',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 3. Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  frequency TEXT DEFAULT 'one_time',
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'active',
  renewal_date DATE,
  purchase_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Create income table
CREATE TABLE IF NOT EXISTS income (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  frequency TEXT DEFAULT 'one_time',
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'active',
  renewal_date DATE,
  source_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Create receipts table
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expense_id UUID REFERENCES expenses(id) ON DELETE SET NULL,
  receipt_url TEXT,
  generated_at TIMESTAMP DEFAULT NOW(),
  emailed_to TEXT,
  emailed_at TIMESTAMP
);

-- 6. Create account_statements table
CREATE TABLE IF NOT EXISTS account_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  statement_date TIMESTAMP DEFAULT NOW(),
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  total_income DECIMAL(12, 2),
  total_expenses DECIMAL(12, 2),
  net_pl DECIMAL(12, 2),
  statement_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 7. Create ai_conversations table
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 8. Create ai_messages table
CREATE TABLE IF NOT EXISTS ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 9. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_frequency ON expenses(frequency);

CREATE INDEX IF NOT EXISTS idx_income_user_id ON income(user_id);
CREATE INDEX IF NOT EXISTS idx_income_date ON income(date);
CREATE INDEX IF NOT EXISTS idx_income_category ON income(category);
CREATE INDEX IF NOT EXISTS idx_income_status ON income(status);
CREATE INDEX IF NOT EXISTS idx_income_frequency ON income(frequency);

CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_expense_id ON receipts(expense_id);

CREATE INDEX IF NOT EXISTS idx_account_statements_user_id ON account_statements(user_id);

CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON ai_messages(conversation_id);
