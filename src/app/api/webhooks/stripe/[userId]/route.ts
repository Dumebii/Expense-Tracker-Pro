import { createSupabaseServerClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// Stripe sends payment data in cents — convert to base currency units.
function fromCents(amount: number) {
  return amount / 100;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const supabase = createSupabaseServerClient();

  // Verify the userId maps to a real user (it's the Supabase UUID, which acts as the URL token)
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .single();

  if (!user) {
    return NextResponse.json({ error: 'Invalid webhook URL' }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const eventType = body.type as string;

  // payment_intent.succeeded — a customer paid you
  if (eventType === 'payment_intent.succeeded') {
    const pi = (body.data as Record<string, unknown>)?.object as Record<string, unknown>;
    if (!pi) return NextResponse.json({ received: true });

    const amount = fromCents((pi.amount_received as number) ?? (pi.amount as number) ?? 0);
    const currency = ((pi.currency as string) ?? 'usd').toUpperCase();
    const description = (pi.description as string) || 'Stripe payment received';
    const date = new Date(((pi.created as number) ?? Date.now() / 1000) * 1000)
      .toISOString()
      .split('T')[0];

    await supabase.from('income').insert({
      user_id: user.id,
      title: description,
      amount,
      category: 'Payment',
      date,
      frequency: 'one_time',
      currency,
      description: `Stripe payment ID: ${pi.id}`,
      status: 'active',
    });
  }

  // checkout.session.completed — covers both one-time and subscription first payments
  if (eventType === 'checkout.session.completed') {
    const session = (body.data as Record<string, unknown>)?.object as Record<string, unknown>;
    if (!session) return NextResponse.json({ received: true });

    const amount = fromCents((session.amount_total as number) ?? 0);
    const currency = ((session.currency as string) ?? 'usd').toUpperCase();
    const description = (session.customer_email as string)
      ? `Stripe checkout — ${session.customer_email}`
      : 'Stripe checkout payment';
    const date = new Date(((session.created as number) ?? Date.now() / 1000) * 1000)
      .toISOString()
      .split('T')[0];

    await supabase.from('income').insert({
      user_id: user.id,
      title: description,
      amount,
      category: 'Payment',
      date,
      frequency: 'one_time',
      currency,
      description: `Stripe session ID: ${session.id}`,
      status: 'active',
    });
  }

  return NextResponse.json({ received: true });
}
