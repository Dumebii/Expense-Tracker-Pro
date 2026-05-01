import { auth } from '@clerk/nextjs/server';
import { createSupabaseServerClient } from '@/lib/supabase';
import { getOrCreateSupabaseUser } from '@/lib/get-user';
import { NextResponse } from 'next/server';

function getNextRenewalDate(dateStr: string, frequency: string): Date | null {
  if (frequency === 'one_time') return null;
  const start = new Date(dateStr + 'T12:00:00Z');
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);
  const next = new Date(start);
  if (frequency === 'monthly') {
    while (next <= now) next.setUTCMonth(next.getUTCMonth() + 1);
  } else if (frequency === 'annually') {
    while (next <= now) next.setUTCFullYear(next.getUTCFullYear() + 1);
  } else {
    return null;
  }
  return next;
}

function daysFromNow(date: Date): number {
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setUTCHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createSupabaseServerClient();
    const userData = await getOrCreateSupabaseUser(userId);
    if (!userData) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { data: expenses } = await supabase
      .from('expenses')
      .select('id, title, amount, currency, category, date, frequency')
      .eq('user_id', userData.id)
      .eq('status', 'active')
      .in('frequency', ['monthly', 'annually']);

    const ALERT_DAYS = 7;
    const upcoming = (expenses || [])
      .map((expense) => {
        const nextRenewal = getNextRenewalDate(expense.date, expense.frequency);
        if (!nextRenewal) return null;
        const days = daysFromNow(nextRenewal);
        if (days < 0 || days > ALERT_DAYS) return null;
        return {
          id: expense.id,
          title: expense.title,
          amount: expense.amount,
          currency: expense.currency,
          category: expense.category,
          frequency: expense.frequency,
          renewalDate: nextRenewal.toISOString(),
          daysUntil: days,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a!.daysUntil - b!.daysUntil);

    return NextResponse.json({ upcoming });
  } catch (error) {
    console.error('Error fetching upcoming renewals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
