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

  const eventName = (body.meta as Record<string, unknown>)?.event_name as string;
  const attributes = ((body.data as Record<string, unknown>)?.attributes ?? {}) as Record<string, unknown>;

  // order_created — one-time purchase
  if (eventName === 'order_created') {
    // LemonSqueezy total is in cents
    const amount = ((attributes.total as number) ?? 0) / 100;
    const currency = ((attributes.currency as string) ?? 'USD').toUpperCase();
    const customerName = (attributes.user_name as string) || (attributes.user_email as string) || 'customer';
    const productName = (attributes.first_order_item as Record<string, unknown>)?.product_name as string;
    const title = productName ? `${productName} — ${customerName}` : `LemonSqueezy order from ${customerName}`;
    const date = ((attributes.created_at as string) ?? new Date().toISOString()).split('T')[0];

    await supabase.from('income').insert({
      user_id: user.id,
      title,
      amount,
      category: 'Payment',
      date,
      frequency: 'one_time',
      currency,
      description: `LemonSqueezy order ID: ${attributes.identifier}`,
      status: 'active',
    });
  }

  // subscription_payment_success — recurring charge paid
  if (eventName === 'subscription_payment_success') {
    const amount = ((attributes.total as number) ?? 0) / 100;
    const currency = ((attributes.currency as string) ?? 'USD').toUpperCase();
    const date = ((attributes.created_at as string) ?? new Date().toISOString()).split('T')[0];

    await supabase.from('income').insert({
      user_id: user.id,
      title: 'LemonSqueezy subscription renewal',
      amount,
      category: 'Subscription',
      date,
      frequency: 'monthly',
      currency,
      description: `LemonSqueezy subscription ID: ${attributes.subscription_id}`,
      status: 'active',
    });
  }

  return NextResponse.json({ received: true });
}
