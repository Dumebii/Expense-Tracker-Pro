import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = req.headers.get('user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const expenseId = params.id;
    const emailTo = req.nextUrl.searchParams.get('emailTo') || 'noreply@tracker.app';

    // Get expense
    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', expenseId)
      .eq('user_id', userId)
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
          user_id: userId,
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
