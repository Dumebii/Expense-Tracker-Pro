import { auth } from '@clerk/nextjs/server';
import { createSupabaseServerClient } from '@/lib/supabase';
import { getOrCreateSupabaseUser } from '@/lib/get-user';
import { getExchangeRates, convertAmount } from '@/lib/currency';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createSupabaseServerClient();

    const userData = await getOrCreateSupabaseUser(userId);
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
    const annualizedNet = netP_L * 12;

    const recentIncome = (income || [])
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map((item) => ({
        ...item,
        convertedAmount: convertAmount(item.amount, item.currency || 'USD', displayCurrency, rates),
      }));

    const recentExpenses = (expenses || [])
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map((item) => ({
        ...item,
        convertedAmount: convertAmount(item.amount, item.currency || 'USD', displayCurrency, rates),
      }));

    return NextResponse.json({
      totalIncome,
      totalExpenses,
      netP_L,
      annualizedNet,
      recentIncome,
      recentExpenses,
      currency: displayCurrency,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
