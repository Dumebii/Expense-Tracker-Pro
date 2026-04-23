/**
 * getOrCreateSupabaseUser
 *
 * Looks up the Supabase user row for the given Clerk user ID.
 * If no row exists yet (e.g. the Clerk webhook hasn't fired), it
 * creates one just-in-time using currentUser() from Clerk.
 *
 * Always uses the service-role client so RLS never blocks the lookup
 * or the insert.
 */

import { currentUser } from '@clerk/nextjs/server';
import { createSupabaseServerClient } from './supabase';

export async function getOrCreateSupabaseUser(
  clerkUserId: string
): Promise<{ id: string } | null> {
  const supabase = createSupabaseServerClient();

  // 1. Try to find an existing row
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', clerkUserId)
    .single();

  if (existing) return existing;

  // 2. Row not found — fetch Clerk user details and create it now
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? '';

  const { data: newUser, error } = await supabase
    .from('users')
    .insert({
      clerk_id: clerkUserId,
      email,
      first_name: clerkUser.firstName ?? null,
      last_name: clerkUser.lastName ?? null,
    })
    .select('id')
    .single();

  if (error || !newUser) {
    console.error('getOrCreateSupabaseUser: insert failed', error);
    return null;
  }

  // 3. Seed default preferences (ignore if already present)
  await supabase
    .from('user_preferences')
    .upsert({ user_id: newUser.id, currency: 'USD' }, { onConflict: 'user_id' });

  return newUser;
}
