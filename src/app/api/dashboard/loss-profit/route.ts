import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('currency')
      .eq('user_id', userId)
      .single();

    const currency = prefs?.currency || 'USD';

    const { data: expenses } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');

    const { data: income } = await supabase
      .from('income')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');

    const totalIncome = (income || []).reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = (expenses || []).reduce((sum, item) => sum + item.amount, 0);
    const netP_L = totalIncome - totalExpenses;

    // Group by category
    const incomeByCategory = (income || []).reduce((acc: Record<string, number>, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {});

    const expenseByCategory = (expenses || []).reduce((acc: Record<string, number>, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {});

    const byCategory = [
      ...Object.entries(incomeByCategory).map(([name, value]) => ({ name, value, type: 'income' })),
      ...Object.entries(expenseByCategory).map(([name, value]) => ({ name, value, type: 'expense' })),
    ];

    return NextResponse.json({
      totalIncome,
      totalExpenses,
      netP_L,
      byCategory,
      currency,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
