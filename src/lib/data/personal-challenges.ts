/**
 * Personal challenges \u2014 habit-forming streaks the user commits to and
 * checks off in the dashboard worklist.
 *
 * `targets` lists the behaviour slugs this challenge strengthens (matches
 * the `b_*` columns on health_assessments + wealth_assessments). The Plan
 * page uses it to suggest challenges for whichever behaviours scored weakest
 * in the last check-in.
 */

export type ChallengeCadence = 'daily' | 'weekly' | 'monthly';
export type ChallengeCategory = 'health' | 'wealth';

export interface PersonalChallenge {
  slug: string;
  category: ChallengeCategory;
  /** Verbatim from the catalogue, e.g. "Walk 10,000 steps every day for 30 days". */
  name: string;
  /** Short label for compact rows, e.g. "Walk 10,000 steps". */
  short: string;
  cadence: ChallengeCadence;
  durationCount: number;        // 30 days | 8 weeks | 12 months
  durationUnit: 'days' | 'weeks' | 'months';
  /** Behaviour slugs this challenge most directly strengthens. */
  targets: string[];
}

/** Behaviour slugs (matching `b_*` columns minus the prefix). */
// Health:  sleep, smoking, strength, sweat, sugar, salt, spirits, stress
// Wealth:  active_income, passive_income, expenses, discretionary,
//          savings, debt_repayment, retirement, investment

export const PERSONAL_CHALLENGES: PersonalChallenge[] = [
  // ── HEALTH \u00b7 DAILY (30 days) ──
  { slug: 'walk-10k',       category: 'health', name: 'Walk 10,000 steps every day for 30 days',     short: 'Walk 10,000 steps',       cadence: 'daily', durationCount: 30, durationUnit: 'days', targets: ['sweat'] },
  { slug: 'exercise-30',    category: 'health', name: '30 mins exercise every day for 30 days',      short: '30 mins exercise',        cadence: 'daily', durationCount: 30, durationUnit: 'days', targets: ['sweat'] },
  { slug: 'run-5k',         category: 'health', name: 'Run 5K every day for 30 days',                 short: 'Run 5K',                  cadence: 'daily', durationCount: 30, durationUnit: 'days', targets: ['sweat'] },
  { slug: 'pushups-100',    category: 'health', name: '100 push-ups every day for 30 days',           short: '100 push-ups',            cadence: 'daily', durationCount: 30, durationUnit: 'days', targets: ['strength'] },
  { slug: 'stretch-15',     category: 'health', name: '15-minute stretching every day for 30 days',   short: '15-min stretching',       cadence: 'daily', durationCount: 30, durationUnit: 'days', targets: ['stress', 'sleep'] },
  { slug: 'water-2l',       category: 'health', name: 'Drink 2L water every day for 30 days',         short: 'Drink 2L water',          cadence: 'daily', durationCount: 30, durationUnit: 'days', targets: ['sugar'] },
  { slug: 'protein-meals',  category: 'health', name: 'Eat protein with every meal for 30 days',      short: 'Protein every meal',      cadence: 'daily', durationCount: 30, durationUnit: 'days', targets: ['strength', 'sugar'] },
  { slug: 'bed-by-10',      category: 'health', name: 'In bed by 10pm every night for 30 days',       short: 'In bed by 10pm',          cadence: 'daily', durationCount: 30, durationUnit: 'days', targets: ['sleep'] },
  { slug: 'read-20',        category: 'health', name: 'Read 20 minutes before bed every night for 30 days', short: 'Read 20 min before bed', cadence: 'daily', durationCount: 30, durationUnit: 'days', targets: ['sleep', 'stress'] },
  { slug: 'meditate-10',    category: 'health', name: 'Meditate 10 minutes every morning for 30 days', short: '10-min meditation',     cadence: 'daily', durationCount: 30, durationUnit: 'days', targets: ['stress'] },
  { slug: 'cold-shower',    category: 'health', name: 'Cold shower every morning for 30 days',        short: 'Cold shower',             cadence: 'daily', durationCount: 30, durationUnit: 'days', targets: ['stress'] },
  { slug: 'journal-5',      category: 'health', name: 'Journal 5 minutes every morning for 30 days',  short: '5-min journal',           cadence: 'daily', durationCount: 30, durationUnit: 'days', targets: ['stress'] },
  { slug: 'bp-morning',     category: 'health', name: 'Take your blood pressure every morning for 30 days', short: 'BP every morning',  cadence: 'daily', durationCount: 30, durationUnit: 'days', targets: ['salt'] },
  { slug: 'no-phone-8pm',   category: 'health', name: 'No phone or devices after 8pm every night for 30 days', short: 'No phone after 8pm', cadence: 'daily', durationCount: 30, durationUnit: 'days', targets: ['sleep', 'stress'] },
  { slug: 'sleep-7',        category: 'health', name: 'Get 7+ hours of sleep every night for 30 days', short: '7+ hours sleep',         cadence: 'daily', durationCount: 30, durationUnit: 'days', targets: ['sleep'] },

  // ── HEALTH \u00b7 WEEKLY (8 weeks) ──
  { slug: 'strength-3x',    category: 'health', name: '3 strength training sessions every week for 8 weeks', short: '3 strength sessions', cadence: 'weekly', durationCount: 8, durationUnit: 'weeks', targets: ['strength'] },
  { slug: 'lose-0.5kg',     category: 'health', name: 'Lose 0.5kg every week for 8 weeks',                  short: 'Lose 0.5kg',          cadence: 'weekly', durationCount: 8, durationUnit: 'weeks', targets: ['sugar', 'sweat'] },
  { slug: 'long-walks-2',   category: 'health', name: '2 long walks (60+ min) every week for 8 weeks',      short: '2 long walks',        cadence: 'weekly', durationCount: 8, durationUnit: 'weeks', targets: ['sweat'] },
  { slug: 'long-run-10k',   category: 'health', name: '1 long run (10K+) every week for 8 weeks',           short: '1 long run (10K+)',   cadence: 'weekly', durationCount: 8, durationUnit: 'weeks', targets: ['sweat'] },
  { slug: 'fish-3x',        category: 'health', name: 'Eat fish or omega-3 source 3 times every week for 8 weeks', short: 'Fish 3\u00d7 / week', cadence: 'weekly', durationCount: 8, durationUnit: 'weeks', targets: ['sugar'] },

  // ── HEALTH \u00b7 MONTHLY (12 months) ──
  { slug: 'run-100km-mo',   category: 'health', name: 'Run 100km every month for 12 months',                short: 'Run 100km',           cadence: 'monthly', durationCount: 12, durationUnit: 'months', targets: ['sweat'] },
  { slug: 'steps-300k-mo',  category: 'health', name: 'Hit 300,000 steps every month for 12 months',         short: '300,000 steps',       cadence: 'monthly', durationCount: 12, durationUnit: 'months', targets: ['sweat'] },
  { slug: 'swim-8x-mo',     category: 'health', name: 'Complete 8 swimming sessions every month for 12 months', short: '8 swim sessions',  cadence: 'monthly', durationCount: 12, durationUnit: 'months', targets: ['sweat'] },
  { slug: 'new-class-mo',   category: 'health', name: 'Try 1 new fitness class every month for 12 months',   short: 'New fitness class',   cadence: 'monthly', durationCount: 12, durationUnit: 'months', targets: ['sweat', 'strength'] },

  // ── WEALTH \u00b7 DAILY (30 days) ──
  { slug: 'log-expenses',   category: 'wealth', name: 'Log every expense every day for 30 days',             short: 'Log every expense',   cadence: 'daily', durationCount: 30, durationUnit: 'days', targets: ['expenses', 'discretionary'] },
  { slug: 'finance-news',   category: 'wealth', name: 'Read 10 minutes of finance news every day for 30 days', short: '10-min finance news', cadence: 'daily', durationCount: 30, durationUnit: 'days', targets: ['investment'] },

  // ── WEALTH \u00b7 WEEKLY (8 weeks) ──
  { slug: 'review-finances', category: 'wealth', name: 'Review your finances every weekend for 8 weeks',     short: 'Review finances',     cadence: 'weekly', durationCount: 8, durationUnit: 'weeks', targets: ['expenses', 'savings'] },

  // ── WEALTH \u00b7 MONTHLY (12 months) ──
  { slug: 'save-20pct',     category: 'wealth', name: 'Save 20% of every paycheck for 12 months',            short: 'Save 20% of paycheck', cadence: 'monthly', durationCount: 12, durationUnit: 'months', targets: ['savings'] },
  { slug: 'invest-monthly', category: 'wealth', name: 'Invest every month for 12 months',                    short: 'Invest monthly',      cadence: 'monthly', durationCount: 12, durationUnit: 'months', targets: ['investment'] },
  { slug: 'pay-cards-full', category: 'wealth', name: 'Pay credit cards in full every month for 12 months',  short: 'Pay cards in full',   cadence: 'monthly', durationCount: 12, durationUnit: 'months', targets: ['debt_repayment'] },
  { slug: 'track-net-worth', category: 'wealth', name: 'Track net worth every month for 12 months',          short: 'Track net worth',     cadence: 'monthly', durationCount: 12, durationUnit: 'months', targets: ['active_income', 'savings'] },
];

export function challengeBySlug(slug: string): PersonalChallenge | undefined {
  return PERSONAL_CHALLENGES.find(c => c.slug === slug);
}

/** Suggest challenges that target a given behaviour. */
export function challengesForBehaviour(behaviourSlug: string, limit = 3): PersonalChallenge[] {
  return PERSONAL_CHALLENGES.filter(c => c.targets.includes(behaviourSlug)).slice(0, limit);
}

/** Convert a challenge\u2019s window into an end-date ISO string from a given start. */
export function challengeEndDate(c: PersonalChallenge, start: Date = new Date()): string {
  const d = new Date(start);
  d.setHours(0, 0, 0, 0);
  if (c.durationUnit === 'days')   d.setDate(d.getDate() + c.durationCount);
  if (c.durationUnit === 'weeks')  d.setDate(d.getDate() + c.durationCount * 7);
  if (c.durationUnit === 'months') d.setMonth(d.getMonth() + c.durationCount);
  return d.toISOString().split('T')[0];
}
