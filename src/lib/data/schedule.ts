/**
 * The ULTM8 Schedule \u2014 inspiration list of activities at each cadence.
 * Tap any item to add it to your personal calendar (with the right
 * recurrence pre-filled).
 */

export type ScheduleCadence = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
export type ScheduleCategory = 'health' | 'wealth';

export interface ScheduleItem {
  category: ScheduleCategory;
  name: string;
  cadence: ScheduleCadence;
  // Optional details
  desc?: string;
  defaultTime?: string;     // 'HH:MM'
  defaultDuration?: number; // minutes
}

export const CADENCE_LABELS: Record<ScheduleCadence, string> = {
  daily:     'Daily',
  weekly:    'Weekly',
  monthly:   'Monthly',
  quarterly: 'Quarterly',
  annually:  'Annually',
};

export const CADENCE_ORDER: ScheduleCadence[] = [
  'daily', 'weekly', 'monthly', 'quarterly', 'annually',
];

/** Map our cadence onto user_events.recurrence_freq (the calendar uses
 *  'daily' / 'weekly' / 'monthly' / 'annually'). Quarterly maps to
 *  monthly with interval=3. */
export function cadenceToRecurrence(cadence: ScheduleCadence):
  { freq: 'daily' | 'weekly' | 'monthly' | 'annually'; interval: number } {
  switch (cadence) {
    case 'daily':     return { freq: 'daily',    interval: 1 };
    case 'weekly':    return { freq: 'weekly',   interval: 1 };
    case 'monthly':   return { freq: 'monthly',  interval: 1 };
    case 'quarterly': return { freq: 'monthly',  interval: 3 };
    case 'annually':  return { freq: 'annually', interval: 1 };
  }
}

export const SCHEDULE: ScheduleItem[] = [
  // ── Daily ──
  { category: 'health', name: '10k steps',          cadence: 'daily', desc: 'Hit 10,000 steps every day. Walking, errands, stairs all count.' },
  { category: 'health', name: '10 min stretch',     cadence: 'daily', desc: 'Mobility / stretching block. Hips, hamstrings, shoulders, back.' },
  { category: 'health', name: '15 min reading',     cadence: 'daily', desc: 'Read something that builds your mind \u2014 not your feed.' },
  { category: 'health', name: '5 min meditation',   cadence: 'daily', desc: 'Sit, breathe, notice. Box breathing or guided session.' },

  // ── Weekly ──
  { category: 'health', name: '3 strength sessions', cadence: 'weekly', desc: 'Three resistance sessions covering all major muscle groups.' },
  { category: 'health', name: '150 min cardio',      cadence: 'weekly', desc: 'Aerobic work split across the week. Anything that elevates HR.' },
  { category: 'health', name: '1 long walk',         cadence: 'weekly', desc: '60+ minute walk \u2014 outdoors if possible.' },
  { category: 'health', name: 'Health check-in',     cadence: 'weekly', desc: '8 behaviour questions, ~1 minute. Updates your octagon.' },
  { category: 'wealth', name: 'Review weekly spend', cadence: 'weekly', desc: 'Scan transactions, flag anything off-plan.' },
  { category: 'health', name: 'Meal prep block',     cadence: 'weekly', desc: '60\u201390 minutes of batching meals for the week.' },
  { category: 'health', name: 'BP measurement',      cadence: 'weekly', desc: 'Same time, same arm, after 5 minutes resting.' },
  { category: 'health', name: 'Weigh-in',            cadence: 'weekly', desc: 'Same morning each week, after waking.' },

  // ── Monthly ──
  { category: 'wealth', name: 'Wealth check-in',     cadence: 'monthly', desc: '8 behaviour questions covering income, spending, saving and the rest.' },
  { category: 'health', name: 'Waist measurement',   cadence: 'monthly', desc: 'Around the belly button, relaxed.' },
  { category: 'wealth', name: 'Savings transfer',    cadence: 'monthly', desc: 'Pay yourself first. Move savings before spending.' },
  { category: 'wealth', name: 'Budget audit',        cadence: 'monthly', desc: 'Categorise the month. Look for surprises and creep.' },
  { category: 'health', name: 'One longer challenge', cadence: 'monthly', desc: 'A 10k run, hike, or longer training session beyond your weekly routine.' },

  // ── Quarterly ──
  { category: 'wealth', name: 'Net worth calculation', cadence: 'quarterly', desc: 'Total assets minus total liabilities. Track the trajectory.' },
  { category: 'wealth', name: 'Investment review',     cadence: 'quarterly', desc: 'Check allocation, rebalance if needed.' },

  // ── Annually ──
  { category: 'health', name: 'Full health screening',   cadence: 'annually', desc: 'GP check, blood panel, BP, weight, waist.' },
  { category: 'wealth', name: 'Pension review',          cadence: 'annually', desc: 'Pot value, contribution rate, projected income.' },
  { category: 'wealth', name: 'Will + protection review', cadence: 'annually', desc: 'Life cover, income protection, will, beneficiaries.' },
  { category: 'wealth', name: 'Tax review',              cadence: 'annually', desc: 'ISA, pension, capital gains and other allowances.' },
  { category: 'health', name: 'Wellness trip',           cadence: 'annually', desc: 'Block a week of intentional rest, training and reset.' },
];
