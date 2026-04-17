import { Webhook } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(req: Request) {
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: No svix headers', {
      status: 400,
    });
  }

  const body = await req.text();

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt;
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as any;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error: Invalid signature', {
      status: 400,
    });
  }

  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses?.[0]?.email_address || '';
    const firstName = first_name || '';
    const lastName = last_name || '';

    try {
      await supabase.from('users').insert([
        {
          clerk_id: id,
          email,
          first_name: firstName || null,
          last_name: lastName || null,
        },
      ]);

      await supabase.from('user_preferences').insert([
        {
          user_id: (
            await supabase
              .from('users')
              .select('id')
              .eq('clerk_id', id)
              .single()
          ).data?.id,
          currency: 'USD',
        },
      ]);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses?.[0]?.email_address || '';
    const firstName = first_name || '';
    const lastName = last_name || '';

    try {
      await supabase
        .from('users')
        .update({
          email,
          first_name: firstName || null,
          last_name: lastName || null,
        })
        .eq('clerk_id', id);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    try {
      await supabase.from('users').delete().eq('clerk_id', id);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  }

  return NextResponse.json({ success: true });
}
