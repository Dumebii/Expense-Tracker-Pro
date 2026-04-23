import { auth } from '@clerk/nextjs/server';
import { createSupabaseServerClient } from '@/lib/supabase';
import { getOrCreateSupabaseUser } from '@/lib/get-user';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createSupabaseServerClient();

    const userData = await getOrCreateSupabaseUser(userId);
    if (!userData) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await request.json();
    const { fromDate, toDate } = body;

    const { data: expenses } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userData.id)
      .gte('date', fromDate)
      .lte('date', toDate);

    const { data: income } = await supabase
      .from('income')
      .select('*')
      .eq('user_id', userData.id)
      .gte('date', fromDate)
      .lte('date', toDate);

    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('currency')
      .eq('user_id', userData.id)
      .single();

    const currency = prefs?.currency || 'USD';

    const totalIncome = (income || []).reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = (expenses || []).reduce((sum, item) => sum + item.amount, 0);
    const netP_L = totalIncome - totalExpenses;

    const { data: statement } = await supabase
      .from('account_statements')
      .insert({
        user_id: userData.id,
        from_date: fromDate,
        to_date: toDate,
        total_income: totalIncome,
        total_expenses: totalExpenses,
        net_pl: netP_L,
      })
      .select()
      .single();

    return NextResponse.json({ ...statement, currency });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
