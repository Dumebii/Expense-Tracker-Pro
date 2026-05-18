import { createSupabaseServerClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const supabase = createSupabaseServerClient();

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

  const eventType = (body.type ?? body.event_type) as string;
  const data = (body.data ?? body) as Record<string, unknown>;

  // payment.succeeded / payment.completed
  if (
    eventType === 'payment.succeeded' ||
    eventType === 'payment.completed' ||
    eventType === 'payment.created'
  ) {
    // Dodo amounts are in the smallest currency unit (cents for USD)
    const rawAmount = (data.amount ?? data.total_amount ?? 0) as number;
    const amount = rawAmount > 1000 ? rawAmount / 100 : rawAmount;
    const currency = ((data.currency as string) ?? 'USD').toUpperCase();
    const description = (data.description as string) || (data.product_name as string) || 'Dodo payment received';
    const createdAt = (data.created_at as string) || (data.payment_date as string) || new Date().toISOString();
    const date = createdAt.split('T')[0];

    await supabase.from('income').insert({
      user_id: user.id,
      title: description,
      amount,
      category: 'Payment',
      date,
      frequency: 'one_time',
      currency,
      description: `Dodo payment ID: ${data.payment_id ?? data.id}`,
      status: 'active',
    });
  }

  // subscription.active / subscription.renewed
  if (
    eventType === 'subscription.active' ||
    eventType === 'subscription.renewed' ||
    eventType === 'subscription.created'
  ) {
    const rawAmount = (data.recurring_amount ?? data.amount ?? 0) as number;
    const amount = rawAmount > 1000 ? rawAmount / 100 : rawAmount;
    const currency = ((data.currency as string) ?? 'USD').toUpperCase();
    const productName = (data.product_name as string) || 'Dodo subscription payment';
    const date = new Date().toISOString().split('T')[0];

    await supabase.from('income').insert({
      user_id: user.id,
      title: productName,
      amount,
      category: 'Subscription',
      date,
      frequency: 'monthly',
      currency,
      description: `Dodo subscription ID: ${data.subscription_id ?? data.id}`,
      status: 'active',
    });
  }

  return NextResponse.json({ received: true });
}
