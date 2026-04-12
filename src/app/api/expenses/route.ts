import { auth } from '@clerk/nextjs/server';
import { createSupabaseClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // Get filter params
    const category = req.nextUrl.searchParams.get('category');
    const frequency = req.nextUrl.searchParams.get('frequency');
    const status = req.nextUrl.searchParams.get('status');

    let query = supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userData.id);

    if (category) query = query.eq('category', category);
    if (frequency) query = query.eq('frequency', frequency);
    if (status) query = query.eq('status', status);

    const { data: expenses, error } = await query.order('date', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      title, 
      amount, 
      category, 
      date, 
      description,
      frequency = 'one_time',
      currency = 'USD',
      status = 'active',
      renewalDate,
      purchaseDate,
      notes
    } = body;

    if (!title || !amount || !category || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

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

    // Insert expense
    const { data: expense, error } = await supabase
      .from('expenses')
      .insert([
        {
          user_id: userData.id,
          title,
          amount: parseFloat(amount),
          category,
          date,
          description: description || null,
          frequency,
          currency,
          status,
          renewal_date: renewalDate || null,
          purchase_date: purchaseDate || null,
          notes: notes || null,
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}
