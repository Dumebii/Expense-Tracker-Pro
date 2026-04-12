import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    });
  }

  // Get body
  const body = await req.text();

  // Create a new Webhook instance with your signing secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt;
  // Verify the webhook
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as any;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400,
    });
  }

  const supabase = createSupabaseServerClient();

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses[0].email_address;
    const name = `${first_name || ''} ${last_name || ''}`.trim();

    try {
      await supabase.from('users').insert([
        {
          clerk_id: id,
          email,
          name: name || null,
        },
      ]);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses[0].email_address;
    const name = `${first_name || ''} ${last_name || ''}`.trim();

    try {
      await supabase
        .from('users')
        .update({
          email,
          name: name || null,
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
