import { auth } from '@clerk/nextjs/server';
import { createSupabaseClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createSupabaseClient();

    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (!userData) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await request.json();
    const { message } = body;

    const { data: expenses } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userData.id)
      .limit(10);

    const { data: income } = await supabase
      .from('income')
      .select('*')
      .eq('user_id', userData.id)
      .limit(10);

    const response = generateFinancialAdvice(message, income || [], expenses || []);

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { response: 'I encountered an error processing your request. Please try again.' },
      { status: 200 }
    );
  }
}

interface Transaction {
  amount: number;
  category?: string;
}

function generateFinancialAdvice(
  message: string,
  income: Transaction[],
  expenses: Transaction[]
): string {
  const lowerMessage = message.toLowerCase();

  const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netP_L = totalIncome - totalExpenses;

  if (lowerMessage.includes('income') || lowerMessage.includes('earn')) {
    return `Based on your data, your total income is $${totalIncome.toFixed(2)}. To increase your income, consider diversifying your revenue streams or looking for higher-paying opportunities.`;
  }

  if (lowerMessage.includes('expense') || lowerMessage.includes('spend')) {
    return `Your total expenses are $${totalExpenses.toFixed(2)}. To reduce expenses, try budgeting each category and identifying areas where you can cut costs without affecting your quality of life.`;
  }

  if (lowerMessage.includes('profit') || lowerMessage.includes('loss') || lowerMessage.includes('p&l')) {
    return `Your net P&L is $${netP_L.toFixed(2)}. ${
      netP_L > 0
        ? 'Great! You are currently profitable. Focus on maintaining this positive trend.'
        : 'You are currently running at a loss. Consider increasing income or reducing expenses.'
    }`;
  }

  if (lowerMessage.includes('budget')) {
    return 'A good budget should allocate your income across essential expenses (50%), savings (30%), and discretionary spending (20%). Adjust these percentages based on your personal situation.';
  }

  if (lowerMessage.includes('save') || lowerMessage.includes('saving')) {
    return 'An emergency fund of 3-6 months of expenses is recommended. Also consider automating your savings by setting up transfers on payday.';
  }

  return 'I can help you with financial advice! Ask me about your income, expenses, savings, budgeting, or any other financial questions. You can also ask me to analyze your specific financial data.';
}
