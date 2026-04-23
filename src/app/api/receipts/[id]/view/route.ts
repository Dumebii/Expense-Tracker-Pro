import { auth, currentUser } from '@clerk/nextjs/server';
import { createSupabaseServerClient } from '@/lib/supabase';
import { getOrCreateSupabaseUser } from '@/lib/get-user';
import { generateReceiptHTML } from '@/lib/receipt';
import { NextRequest } from 'next/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new Response('Unauthorized', { status: 401 });

    const { id } = await params;
    const supabase = createSupabaseServerClient();

    const userData = await getOrCreateSupabaseUser(userId);
    if (!userData) return new Response('User not found', { status: 404 });

    const { data: expense } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', id)
      .eq('user_id', userData.id)
      .single();

    if (!expense) return new Response('Expense not found', { status: 404 });

    const clerkUser = await currentUser();
    const receiptNumber = `RCP-${expense.date.replace(/-/g, '')}-${id.slice(0, 6).toUpperCase()}`;

    const html = generateReceiptHTML({
      receiptNumber,
      generatedAt: new Date().toISOString(),
      showPrintBar: true,
      expense: {
        id: expense.id,
        title: expense.title,
        amount: expense.amount,
        currency: expense.currency || 'USD',
        category: expense.category,
        date: expense.date,
        frequency: expense.frequency,
        description: expense.description,
        billed_to_name: expense.billed_to_name ?? null,
        billed_to_email: expense.billed_to_email ?? null,
      },
      user: {
        email: clerkUser?.emailAddresses?.[0]?.emailAddress ?? '',
        firstName: clerkUser?.firstName,
        lastName: clerkUser?.lastName,
      },
    });

    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (error) {
    console.error('Error generating receipt view:', error);
    return new Response('Failed to generate receipt', { status: 500 });
  }
}
