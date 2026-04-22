import { auth } from '@clerk/nextjs/server';
import { createSupabaseClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createSupabaseClient();

    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (!userData) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('currency')
      .eq('user_id', userData.id)
      .single();

    const currency = prefs?.currency || 'USD';

    const { data: expenses } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userData.id)
      .order('date', { ascending: false });

    return NextResponse.json({ expenses: expenses || [], currency });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createSupabaseClient();

    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (!userData) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await request.json();

    const { data: expense, error } = await supabase
      .from('expenses')
      .insert({
        user_id: userData.id,
        title: body.title,
        amount: body.amount,
        category: body.category,
        date: body.date,
        frequency: body.frequency,
        description: body.description,
        currency: body.currency || 'USD',
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
