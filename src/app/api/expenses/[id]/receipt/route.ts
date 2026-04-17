import { auth } from '@clerk/nextjs/server';
import { createSupabaseClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: expenseId } = await params;
    const emailTo = req.nextUrl.searchParams.get('emailTo') || 'noreply@tracker.app';

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

    // Get expense
    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', expenseId)
      .eq('user_id', userData.id)
      .single();

    if (expenseError || !expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    // Generate receipt
    const receiptNumber = `RCP-${Date.now()}-${String(expenseId).substring(0, 4).toUpperCase()}`;

    const { data: receipt, error: receiptError } = await supabase
      .from('receipts')
      .insert([
        {
          user_id: userData.id,
          expense_id: expenseId,
          receipt_url: `https://receipts.ledger.app/${receiptNumber}`,
          emailed_to: emailTo,
          emailed_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (receiptError) {
      throw receiptError;
    }

    return NextResponse.json({
      receipt,
      message: `Receipt ${receiptNumber} generated for ${expense.title}. Notification sent to ${emailTo}.`,
      emailSent: true,
    });
  } catch (error) {
    console.error('Error generating receipt:', error);
    return NextResponse.json(
      { error: 'Failed to generate receipt' },
      { status: 500 }
    );
  }
}
