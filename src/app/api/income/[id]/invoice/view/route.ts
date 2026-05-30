import { auth, currentUser } from '@clerk/nextjs/server';
import { createSupabaseServerClient } from '@/lib/supabase';
import { getOrCreateSupabaseUser } from '@/lib/get-user';
import { generateInvoiceHTML } from '@/lib/invoice';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new Response('Unauthorized', { status: 401 });

    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    const supabase = createSupabaseServerClient();
    const userData = await getOrCreateSupabaseUser(userId);
    if (!userData) return new Response('User not found', { status: 404 });

    const { data: income } = await supabase
      .from('income')
      .select('*')
      .eq('id', id)
      .eq('user_id', userData.id)
      .single();

    if (!income) return new Response('Income entry not found', { status: 404 });

    const clerkUser = await currentUser();
    const invoiceNumber = `INV-${income.date.replace(/-/g, '')}-${id.slice(0, 6).toUpperCase()}`;

    const html = generateInvoiceHTML({
      invoiceNumber,
      generatedAt: new Date().toISOString(),
      showPrintBar: true,
      income: {
        id: income.id,
        title: income.title,
        amount: income.amount,
        currency: income.currency || 'USD',
        category: income.category,
        date: income.date,
        frequency: income.frequency,
        description: income.description,
      },
      user: {
        email: clerkUser?.emailAddresses?.[0]?.emailAddress ?? '',
        firstName: clerkUser?.firstName,
        lastName: clerkUser?.lastName,
      },
      billedToName: body.billedToName || null,
      billedToEmail: body.billedToEmail || null,
      billedToAddress: body.billedToAddress || null,
      paymentDetails: body.paymentDetails || null,
      paymentTerms: body.paymentTerms || null,
      notes: body.notes || null,
    });

    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 });
  }
}
