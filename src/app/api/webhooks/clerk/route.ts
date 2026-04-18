import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(req: Request) {
  try {
    const headerPayload = headers();
    const svix_id = headerPayload.get('svix-id');
    const svix_timestamp = headerPayload.get('svix-timestamp');
    const svix_signature = headerPayload.get('svix-signature');

    // Verify that we have the required Svix headers
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response('Error: Missing svix headers', {
        status: 400,
      });
    }

    const body = await req.json();
    const eventType = body.type;
    const eventData = body.data;

    if (eventType === 'user.created') {
      const { id, email_addresses, first_name, last_name } = eventData;
      const email = email_addresses?.[0]?.email_address || '';
      const firstName = first_name || '';
      const lastName = last_name || '';

      try {
        // Create user in Supabase
        const { data: user, error: userError } = await supabase
          .from('users')
          .insert([
            {
              clerk_id: id,
              email,
              first_name: firstName || null,
              last_name: lastName || null,
            },
          ])
          .select()
          .single();

        if (userError) throw userError;

        // Create user preferences
        await supabase.from('user_preferences').insert([
          {
            user_id: user.id,
            currency: 'USD',
          },
        ]);
      } catch (error) {
        console.error('Error creating user:', error);
      }
    }

    if (eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name } = eventData;
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
      const { id } = eventData;

      try {
        await supabase.from('users').delete().eq('clerk_id', id);
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Webhook handler failed', {
      status: 500,
    });
  }
}
