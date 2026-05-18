import { auth } from '@clerk/nextjs/server';
import { createSupabaseServerClient } from '@/lib/supabase';
import { getOrCreateSupabaseUser } from '@/lib/get-user';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createSupabaseServerClient();

    const userData = await getOrCreateSupabaseUser(userId);
    if (!userData) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { data } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userData.id)
      .single();

    return NextResponse.json({ ...(data || {}), webhookId: userData.id });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createSupabaseServerClient();

    const userData = await getOrCreateSupabaseUser(userId);
    if (!userData) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await request.json();

    const { data, error } = await supabase
      .from('user_preferences')
      .upsert(
        {
          user_id: userData.id,
          receipt_email: body.receiptEmail || null,
          currency: body.currency || 'USD',
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
