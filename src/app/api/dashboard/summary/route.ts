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

    // Get user preferences for currency
    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('currency')
      .eq('user_id', userId)
      .single();

    const currency = prefs?.currency || 'USD';

    // Get all expenses
    const { data: expenses } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');

    // Get all income
    const { data: income } = await supabase
      .from('income')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');

    // Calculate totals
    const totalIncome = (income || []).reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = (expenses || []).reduce((sum, item) => sum + item.amount, 0);
    const netP_L = totalIncome - totalExpenses;
    const annualizedNet = netP_L * 12;

    // Get recent transactions
    const recentIncome = (income || [])
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    const recentExpenses = (expenses || [])
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    return NextResponse.json({
      totalIncome,
      totalExpenses,
      netP_L,
      annualizedNet,
      recentIncome,
      recentExpenses,
      currency,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
