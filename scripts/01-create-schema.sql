-- Ledger - Clean Database Setup (Drop and Recreate)
-- Run this entire script in your Supabase SQL Editor

-- Drop all tables if they exist (this will clear everything)
DROP TABLE IF EXISTS ai_messages CASCADE;
DROP TABLE IF EXISTS ai_conversations CASCADE;
DROP TABLE IF EXISTS account_statements CASCADE;
DROP TABLE IF EXISTS receipts CASCADE;
DROP TABLE IF EXISTS income CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Create user_preferences table
CREATE TABLE user_preferences (
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
CREATE TABLE expenses (
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
CREATE TABLE income (
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
CREATE TABLE receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expense_id UUID REFERENCES expenses(id) ON DELETE SET NULL,
  receipt_url TEXT,
  generated_at TIMESTAMP DEFAULT NOW(),
  emailed_to TEXT,
  emailed_at TIMESTAMP
);

-- 6. Create account_statements table
CREATE TABLE account_statements (
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
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 8. Create ai_messages table
CREATE TABLE ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 9. Create indexes for better performance
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_status ON expenses(status);
CREATE INDEX idx_expenses_frequency ON expenses(frequency);

CREATE INDEX idx_income_user_id ON income(user_id);
CREATE INDEX idx_income_date ON income(date);
CREATE INDEX idx_income_category ON income(category);
CREATE INDEX idx_income_status ON income(status);
CREATE INDEX idx_income_frequency ON income(frequency);

CREATE INDEX idx_receipts_user_id ON receipts(user_id);
CREATE INDEX idx_receipts_expense_id ON receipts(expense_id);

CREATE INDEX idx_account_statements_user_id ON account_statements(user_id);

CREATE INDEX idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX idx_ai_messages_conversation_id ON ai_messages(conversation_id);

-- 10. Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE income ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

-- 11. Create RLS Policies for users
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid()::text = clerk_id);

-- 12. Create RLS Policies for user_preferences
CREATE POLICY "Users can view preferences" ON user_preferences
  FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

CREATE POLICY "Users can update preferences" ON user_preferences
  FOR UPDATE USING (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

CREATE POLICY "Users can insert preferences" ON user_preferences
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

-- 13. Create RLS Policies for expenses
CREATE POLICY "Users can view expenses" ON expenses
  FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

CREATE POLICY "Users can insert expenses" ON expenses
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

CREATE POLICY "Users can update expenses" ON expenses
  FOR UPDATE USING (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

CREATE POLICY "Users can delete expenses" ON expenses
  FOR DELETE USING (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

-- 14. Create RLS Policies for income
CREATE POLICY "Users can view income" ON income
  FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

CREATE POLICY "Users can insert income" ON income
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

CREATE POLICY "Users can update income" ON income
  FOR UPDATE USING (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

CREATE POLICY "Users can delete income" ON income
  FOR DELETE USING (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

-- 15. Create RLS Policies for receipts
CREATE POLICY "Users can view receipts" ON receipts
  FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

CREATE POLICY "Users can insert receipts" ON receipts
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

-- 16. Create RLS Policies for account_statements
CREATE POLICY "Users can view statements" ON account_statements
  FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

-- 17. Create RLS Policies for ai_conversations
CREATE POLICY "Users can view conversations" ON ai_conversations
  FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

CREATE POLICY "Users can insert conversations" ON ai_conversations
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

CREATE POLICY "Users can update conversations" ON ai_conversations
  FOR UPDATE USING (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

-- 18. Create RLS Policies for ai_messages
CREATE POLICY "Users can view messages" ON ai_messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM ai_conversations 
      WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
    )
  );

CREATE POLICY "Users can insert messages" ON ai_messages
  FOR INSERT WITH CHECK (
    conversation_id IN (
      SELECT id FROM ai_conversations 
      WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
    )
  );
