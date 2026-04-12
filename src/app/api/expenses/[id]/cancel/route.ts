import { auth } from '@clerk/nextjs/server';
import { createSupabaseClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

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

    // Cancel expense (set status to cancelled)
    const { data: expense, error } = await supabase
      .from('expenses')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userData.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    return NextResponse.json(expense);
  } catch (error) {
    console.error('Error cancelling expense:', error);
    return NextResponse.json(
      { error: 'Failed to cancel expense' },
      { status: 500 }
    );
  }
}
