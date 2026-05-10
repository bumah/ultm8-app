/**
 * Insert a personal challenge as a `user_events` row.
 *
 * The user picks a challenge from /challenges or the Plan accordion. We
 * deliberately do NOT ask for a time at this point \u2014 the row is created
 * with `event_time = null`. The user then schedules the actual time/day-of-week
 * via the Schedule button on the /dashboard worklist row.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import {
  type PersonalChallenge, challengeEndDate,
} from '@/lib/data/personal-challenges';

export async function takeChallenge(
  supabase: SupabaseClient,
  userId: string,
  challenge: PersonalChallenge,
): Promise<{ id: string } | { error: string }> {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('user_events')
    .insert({
      user_id: userId,
      title: challenge.name,
      notes: null,
      event_date: todayStr,
      event_time: null,
      category: challenge.category,
      recurrence_freq: challenge.cadence,
      recurrence_interval: 1,
      recurrence_end_date: challengeEndDate(challenge),
    })
    .select('id')
    .single();

  if (error) return { error: error.message };
  return { id: (data as { id: string }).id };
}
