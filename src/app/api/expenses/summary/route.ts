import { auth } from '@clerk/nextjs/server';
import { createSupabaseClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createSupabaseClient();

    // Get user from Supabase
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get active expenses for summary
    const { data: expenses, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userData.id)
      .eq('status', 'active');

    if (error) {
      throw error;
    }

    let totalMonthly = 0;
    let totalAnnually = 0;
    let totalOneTime = 0;
    const categoryMap: Record<string, { total: number; count: number }> = {};

    for (const expense of expenses || []) {
      const amount = Number(expense.amount);
      if (expense.frequency === 'monthly') {
        totalMonthly += amount;
      } else if (expense.frequency === 'annually') {
        totalAnnually += amount;
      } else {
        totalOneTime += amount;
      }

      if (!categoryMap[expense.category]) {
        categoryMap[expense.category] = { total: 0, count: 0 };
      }
      categoryMap[expense.category].total += amount;
      categoryMap[expense.category].count += 1;
    }

    const totalAllAnnualized = totalMonthly * 12 + totalAnnually + totalOneTime;

    // Count active and cancelled
    const { data: allExpenses } = await supabase
      .from('expenses')
      .select('status')
      .eq('user_id', userData.id);

    const activeCount = allExpenses?.filter((e) => e.status === 'active').length || 0;
    const cancelledCount = allExpenses?.filter((e) => e.status === 'cancelled').length || 0;

    return NextResponse.json({
      totalMonthly: Number(totalMonthly.toFixed(2)),
      totalAnnually: Number(totalAnnually.toFixed(2)),
      totalOneTime: Number(totalOneTime.toFixed(2)),
      totalAllAnnualized: Number(totalAllAnnualized.toFixed(2)),
      byCategory: Object.entries(categoryMap).map(([category, data]) => ({
        category,
        total: Number(data.total.toFixed(2)),
        count: data.count,
      })),
      activeCount,
      cancelledCount,
    });
  } catch (error) {
    console.error('Error fetching expense summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expense summary' },
      { status: 500 }
    );
  }
}
