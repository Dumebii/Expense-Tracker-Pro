import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { fromDate, toDate } = body;

    const { data: expenses } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .gte('date', fromDate)
      .lte('date', toDate);

    const { data: income } = await supabase
      .from('income')
      .select('*')
      .eq('user_id', userId)
      .gte('date', fromDate)
      .lte('date', toDate);

    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('currency')
      .eq('user_id', userId)
      .single();

    const currency = prefs?.currency || 'USD';

    const totalIncome = (income || []).reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = (expenses || []).reduce((sum, item) => sum + item.amount, 0);
    const netP_L = totalIncome - totalExpenses;

    const { data: statement } = await supabase
      .from('account_statements')
      .insert({
        user_id: userId,
        from_date: fromDate,
        to_date: toDate,
        total_income: totalIncome,
        total_expenses: totalExpenses,
        net_pl: netP_L,
      })
      .select()
      .single();

    return NextResponse.json({
      ...statement,
      currency,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
