import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('currency')
      .eq('user_id', userId)
      .single();

    const currency = prefs?.currency || 'USD';

    const { data: income } = await supabase
      .from('income')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    return NextResponse.json({
      income: income || [],
      currency,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const { data: incomeItem, error } = await supabase
      .from('income')
      .insert({
        user_id: userId,
        title: body.title,
        amount: body.amount,
        category: body.category,
        date: body.date,
        frequency: body.frequency,
        description: body.description,
        currency: 'USD',
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(incomeItem, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
