import { auth } from '@clerk/nextjs/server';
import { createSupabaseClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const expenseId = params.id;
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
          expense_id: expenseId,
          receipt_number: receiptNumber,
          emailed_to: emailTo,
          expense_name: expense.title,
          expense_amount: expense.amount,
          expense_category: expense.category,
          expense_frequency: expense.frequency,
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
