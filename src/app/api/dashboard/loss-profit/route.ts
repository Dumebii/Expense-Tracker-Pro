import { auth } from '@clerk/nextjs/server';
import { createSupabaseClient } from '@/lib/supabase';
import { getExchangeRates, convertAmount } from '@/lib/currency';
import { NextResponse } from 'next/server';

export async function GET() {
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

    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('currency')
      .eq('user_id', userData.id)
      .single();

    const displayCurrency = prefs?.currency || 'USD';

    const [{ data: expenses }, { data: income }, rates] = await Promise.all([
      supabase.from('expenses').select('*').eq('user_id', userData.id).eq('status', 'active'),
      supabase.from('income').select('*').eq('user_id', userData.id).eq('status', 'active'),
      getExchangeRates(),
    ]);

    const totalIncome = (income || []).reduce((sum, item) => {
      return sum + convertAmount(item.amount, item.currency || 'USD', displayCurrency, rates);
    }, 0);

    const totalExpenses = (expenses || []).reduce((sum, item) => {
      return sum + convertAmount(item.amount, item.currency || 'USD', displayCurrency, rates);
    }, 0);

    const netP_L = totalIncome - totalExpenses;

    // Group by category — amounts already converted to display currency
    const incomeByCategory = (income || []).reduce((acc: Record<string, number>, item) => {
      const converted = convertAmount(item.amount, item.currency || 'USD', displayCurrency, rates);
      acc[item.category] = (acc[item.category] || 0) + converted;
      return acc;
    }, {});

    const expenseByCategory = (expenses || []).reduce((acc: Record<string, number>, item) => {
      const converted = convertAmount(item.amount, item.currency || 'USD', displayCurrency, rates);
      acc[item.category] = (acc[item.category] || 0) + converted;
      return acc;
    }, {});

    const byCategory = [
      ...Object.entries(incomeByCategory).map(([name, value]) => ({ name, value, type: 'income' })),
      ...Object.entries(expenseByCategory).map(([name, value]) => ({ name, value, type: 'expense' })),
    ];

    return NextResponse.json({ totalIncome, totalExpenses, netP_L, byCategory, currency: displayCurrency });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
