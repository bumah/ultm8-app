/**
 * Global fitness challenge series users can sign up for.
 * Curated, editorial. ULTM8 has no commercial relationship with any of these.
 */

export type ChallengeCategory = 'functional' | 'obstacle' | 'triathlon';

export interface Challenge {
  slug: string;                  // e.g. 'hyrox'
  name: string;                  // e.g. 'Hyrox'
  url: string;
  description: string;
  category: ChallengeCategory;
  format: string;                // short shape, e.g. "8 km running + 8 functional stations"
  cadence: string;               // e.g. 'Multiple events per season, worldwide'
  // Sample upcoming dates (illustrative). Real-world calendar would pull
  // these from each event's site; keeping the shape so the calendar view
  // sorts something sensible until/if a feed is wired in.
  upcoming: { city: string; date: string }[];   // ISO YYYY-MM-DD
}

export const CHALLENGE_CATEGORY_LABELS: Record<ChallengeCategory, string> = {
  functional: 'Functional fitness',
  obstacle:   'Obstacle racing',
  triathlon:  'Triathlon',
};

export const CHALLENGES: Challenge[] = [
  {
    slug: 'hyrox',
    name: 'Hyrox',
    url: 'https://hyrox.com',
    description: 'Eight 1km runs alternated with eight functional fitness stations \u2014 wall balls, sled push, sled pull, burpee broad jumps, rowing, ski erg, sandbag lunges, farmers carry. Singles, doubles, mixed pairs and relays.',
    category: 'functional',
    format: '8\u00d71km run + 8 stations',
    cadence: 'Season runs Aug\u2013May, 50+ events worldwide',
    upcoming: [
      { city: 'London',     date: '2026-09-19' },
      { city: 'Manchester', date: '2026-10-17' },
      { city: 'New York',   date: '2026-11-07' },
      { city: 'Hong Kong',  date: '2026-11-15' },
      { city: 'Berlin',     date: '2026-12-12' },
    ],
  },
  {
    slug: 'spartan',
    name: 'Spartan Race',
    url: 'https://spartan.com',
    description: 'Obstacle course racing across three core distances \u2014 Sprint (5km / 20 obstacles), Super (10km / 25), and Beast (21km / 30). Plus the Ultra (50km) and Trail series.',
    category: 'obstacle',
    format: 'Sprint 5km \u00b7 Super 10km \u00b7 Beast 21km',
    cadence: 'Year-round, 250+ events worldwide',
    upcoming: [
      { city: 'London',      date: '2026-06-13' },
      { city: 'Edinburgh',   date: '2026-07-25' },
      { city: 'New Jersey',  date: '2026-08-22' },
      { city: 'Lake Tahoe',  date: '2026-09-26' },
      { city: 'Abu Dhabi',   date: '2026-12-05' },
    ],
  },
  {
    slug: 'tough-mudder',
    name: 'Tough Mudder',
    url: 'https://toughmudder.com',
    description: 'Team-first mud and obstacle events \u2014 5km, 10km and 15km distances with 10\u201325 obstacles each. Built around camaraderie rather than racing; no individual finish times for the classic event.',
    category: 'obstacle',
    format: '5 / 10 / 15 km mud + obstacles',
    cadence: 'Apr\u2013Oct, UK / US / Europe',
    upcoming: [
      { city: 'London South', date: '2026-05-23' },
      { city: 'Yorkshire',    date: '2026-06-20' },
      { city: 'Midlands',     date: '2026-07-18' },
      { city: 'Berlin',       date: '2026-08-15' },
      { city: 'New England',  date: '2026-09-19' },
    ],
  },
  {
    slug: 'ironman',
    name: 'Ironman',
    url: 'https://www.ironman.com',
    description: 'Long-distance triathlon at full and half distances \u2014 Ironman (3.8km swim, 180km bike, 42.2km run) and Ironman 70.3 (1.9 / 90 / 21.1). Qualifying pathway leads to the World Championship in Kona / Nice.',
    category: 'triathlon',
    format: 'Full 226km \u00b7 70.3 113km',
    cadence: 'Year-round, 200+ events worldwide',
    upcoming: [
      { city: 'Lanzarote',     date: '2026-05-23' },
      { city: 'Hamburg',       date: '2026-06-07' },
      { city: 'Frankfurt',     date: '2026-06-28' },
      { city: 'Bolton (UK)',   date: '2026-07-19' },
      { city: 'Kona (World Champs)', date: '2026-10-10' },
    ],
  },
];

/** All upcoming events, flattened + sorted ascending by date. */
export function getUpcomingEvents(today: Date = new Date()) {
  const todayIso = today.toISOString().split('T')[0];
  const flat: { challenge: Challenge; city: string; date: string }[] = [];
  for (const c of CHALLENGES) {
    for (const u of c.upcoming) {
      if (u.date >= todayIso) flat.push({ challenge: c, ...u });
    }
  }
  flat.sort((a, b) => a.date.localeCompare(b.date));
  return flat;
}
