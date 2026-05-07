/**
 * Resources surfaced in the More tab.
 * Verbatim from /Users/bumah/Downloads/ultm8 challenge-2/v2/resources.html.
 */

export type ResourceType = 'app' | 'wearable' | 'hardware' | 'programme' | 'guide' | 'book';
export type ResourceRegion = 'global' | 'uk' | 'us' | 'hk';

export interface Resource {
  name: string;
  url: string;
  desc: string;
  type: ResourceType;
  regions: ResourceRegion[];   // empty array = global
  category?: string;            // optional grouping label, e.g. "Sleep", "Nutrition"
}

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  app: 'Apps',
  wearable: 'Wearables',
  hardware: 'Hardware',
  programme: 'Programmes',
  guide: 'Guides',
  book: 'Books',
};

export const RESOURCES: Resource[] = [
  // ── Apps ──
  { name: 'Sleep Cycle',     url: 'https://www.sleepcycle.com', desc: 'Tracks sleep stages, strong free tier.', type: 'app', regions: ['global'], category: 'Sleep' },
  { name: 'Strong',          url: 'https://www.strong.app', desc: 'Simple workout tracker for logging sets and reps.', type: 'app', regions: ['global'], category: 'Strength' },
  { name: 'Fitbod',          url: 'https://www.fitbod.me', desc: 'AI-driven workout planner that adapts to equipment and progress.', type: 'app', regions: ['global'], category: 'Strength' },
  { name: 'Apple Fitness+',  url: 'https://www.apple.com/apple-fitness-plus/', desc: 'Subscription workout library for cardio, strength, mindfulness, yoga.', type: 'app', regions: ['global'], category: 'Strength / Cardio' },
  { name: 'Peloton',         url: 'https://www.onepeloton.com', desc: 'Live and on-demand cardio, strength, stretching classes.', type: 'app', regions: ['global'], category: 'Cardio' },
  { name: 'Strava',          url: 'https://www.strava.com', desc: 'Cardio tracking and social platform for runners and cyclists.', type: 'app', regions: ['global'], category: 'Cardio' },
  { name: 'Garmin Connect',  url: 'https://connect.garmin.com', desc: 'Companion app for Garmin watches, strong for endurance.', type: 'app', regions: ['global'], category: 'Cardio' },
  { name: 'Nike Run Club',   url: 'https://www.nike.com/nrc-app', desc: 'Free running app with guided runs and training plans.', type: 'app', regions: ['global'], category: 'Cardio' },
  { name: 'AllTrails',       url: 'https://www.alltrails.com', desc: 'Hiking and outdoor app with strong global trail coverage.', type: 'app', regions: ['global'], category: 'Cardio' },
  { name: 'Yuka',            url: 'https://yuka.io', desc: 'Scan food packaging to see sugar, additives, processing.', type: 'app', regions: ['global'], category: 'Nutrition' },
  { name: 'MyFitnessPal',    url: 'https://www.myfitnesspal.com', desc: 'Popular calorie and macro tracker with large food database.', type: 'app', regions: ['global'], category: 'Nutrition' },
  { name: 'Cronometer',      url: 'https://cronometer.com', desc: 'Detailed nutrient tracker for sugar, sodium, micronutrients.', type: 'app', regions: ['global'], category: 'Nutrition' },
  { name: 'Sunnyside',       url: 'https://www.sunnyside.co', desc: 'Mindful drinking app focused on moderation.', type: 'app', regions: ['global'], category: 'Spirits' },
  { name: 'Try Dry',         url: 'https://alcoholchange.org.uk/help-and-support/try-dry-the-app', desc: 'Free app from Alcohol Change UK to track drink-free days.', type: 'app', regions: ['uk'], category: 'Spirits' },
  { name: 'Headspace',       url: 'https://www.headspace.com', desc: 'Guided meditation, sleep, stress-management.', type: 'app', regions: ['global'], category: 'Stress' },
  { name: 'Calm',            url: 'https://www.calm.com', desc: 'Meditation, sleep stories, breathing exercises.', type: 'app', regions: ['global'], category: 'Stress' },
  { name: 'Insight Timer',   url: 'https://insighttimer.com', desc: 'Free meditation app with thousands of guided sessions.', type: 'app', regions: ['global'], category: 'Stress' },
  { name: 'Hello Heart',     url: 'https://www.helloheart.com', desc: 'App and connected BP cuff with personalised insights.', type: 'app', regions: ['us', 'uk'], category: 'Blood Pressure' },
  { name: 'Daylio',          url: 'https://daylio.net', desc: 'Lightweight mood and habit tracker.', type: 'app', regions: ['global'], category: 'Wellbeing' },
  { name: 'How We Feel',     url: 'https://howwefeel.org', desc: 'Free emotion-tracking app built by scientists.', type: 'app', regions: ['global'], category: 'Wellbeing' },
  { name: 'Stoic',           url: 'https://www.getstoic.com', desc: 'Journaling app with prompts grounded in stoic philosophy.', type: 'app', regions: ['global'], category: 'Wellbeing' },
  { name: 'Apple Health',    url: 'https://www.apple.com/ios/health/', desc: 'Built-in iPhone hub for tracking sleep, activity, vital signs.', type: 'app', regions: ['global'], category: 'General' },

  // ── Wearables ──
  { name: 'Oura Ring',  url: 'https://ouraring.com', desc: 'Ring wearable that tracks sleep stages, recovery, readiness.', type: 'wearable', regions: ['global'] },
  { name: 'Whoop',      url: 'https://www.whoop.com', desc: 'Strap-based wearable focused on recovery, strain, sleep.', type: 'wearable', regions: ['global'] },
  { name: 'Fitbit',     url: 'https://www.fitbit.com', desc: 'Accessible wearable and app with strong daily activity tracking.', type: 'wearable', regions: ['global'] },
  { name: 'Apple Watch',url: 'https://www.apple.com/apple-watch/', desc: 'Continuous heart rate, ECG, fitness tracking on iOS.', type: 'wearable', regions: ['global'] },
  { name: 'Garmin',     url: 'https://www.garmin.com', desc: 'Endurance-focused watches with strong RHR and HRV tracking.', type: 'wearable', regions: ['global'] },
  { name: 'Polar',      url: 'https://www.polar.com', desc: 'Heart rate-first watches with high-accuracy sensors.', type: 'wearable', regions: ['global'] },

  // ── Hardware ──
  { name: 'Eight Sleep',          url: 'https://www.eightsleep.com', desc: 'Smart mattress cover that controls temperature and tracks sleep.', type: 'hardware', regions: ['global'], category: 'Sleep' },
  { name: 'Omron',                url: 'https://omronhealthcare.com', desc: 'Clinically validated home blood pressure monitors.', type: 'hardware', regions: ['global'], category: 'Blood Pressure' },
  { name: 'Withings BPM Connect', url: 'https://www.withings.com/us/en/bpm-connect', desc: 'Cellular blood pressure monitor that syncs to phone.', type: 'hardware', regions: ['global'], category: 'Blood Pressure' },
  { name: 'Aktiia',               url: 'https://aktiia.com', desc: 'Wrist-worn 24/7 cuffless blood pressure monitoring.', type: 'hardware', regions: ['global'], category: 'Blood Pressure' },
  { name: 'Withings Body+',       url: 'https://www.withings.com/uk/en/body-plus', desc: 'Smart scale tracking weight, body fat, BMI.', type: 'hardware', regions: ['global'], category: 'Weight / Body Fat' },
  { name: 'Garmin Index',         url: 'https://www.garmin.com/en-US/p/530464', desc: 'Smart scale with weight, BMI, body fat.', type: 'hardware', regions: ['global'], category: 'Weight / Body Fat' },
  { name: 'Renpho',               url: 'https://www.renpho.com', desc: 'Affordable Bluetooth smart scale with body composition tracking.', type: 'hardware', regions: ['global'], category: 'Weight / Body Fat' },
  { name: 'MyoTape',              url: 'https://www.myotape.com', desc: 'Self-retracting body measurement tape for accurate waist readings.', type: 'hardware', regions: ['global'], category: 'Waist' },
  { name: 'Lingo',                url: 'https://www.hellolingo.com', desc: 'Abbott\u2019s continuous glucose monitor for non-diabetics.', type: 'hardware', regions: ['uk', 'us'], category: 'Blood Sugar' },
  { name: 'Stelo',                url: 'https://www.stelo.com', desc: 'Dexcom\u2019s continuous glucose monitor for adults not on insulin.', type: 'hardware', regions: ['us'], category: 'Blood Sugar' },

  // ── Programmes ──
  { name: 'NHS Stop Smoking Service', url: 'https://www.nhs.uk/better-health/quit-smoking/', desc: 'Free UK service offering local advisers, NRT, prescriptions.', type: 'programme', regions: ['uk'], category: 'Smoking' },
  { name: 'Allen Carr\u2019s Easyway', url: 'https://www.allencarr.com', desc: 'Long-running stop-smoking method with books, programmes, support.', type: 'programme', regions: ['global'], category: 'Smoking' },
  { name: 'ZOE',                       url: 'https://zoe.com', desc: 'Personalised nutrition programme with home tests and food scoring.', type: 'programme', regions: ['uk', 'us'], category: 'Nutrition' },
  { name: 'BetterHelp',                url: 'https://www.betterhelp.com', desc: 'Online therapy platform connecting users to licensed therapists.', type: 'programme', regions: ['global'], category: 'Stress' },
  { name: 'Pension Wise',              url: 'https://www.moneyhelper.org.uk/en/pensions-and-retirement/pension-wise', desc: 'Free, impartial UK government guidance for over-50s on pension options.', type: 'programme', regions: ['uk'], category: 'Pension' },

  // ── Guides ──
  { name: 'The Sleep Foundation',  url: 'https://www.sleepfoundation.org', desc: 'Independent reference site with research-backed sleep guidance.', type: 'guide', regions: ['global'], category: 'Sleep' },
  { name: 'NIH DASH Eating Plan',  url: 'https://www.nhlbi.nih.gov/education/dash-eating-plan', desc: 'Original DASH protocol from US NIH, proven to lower blood pressure.', type: 'guide', regions: ['us'], category: 'Nutrition' },
  { name: 'DASH Diet (Mayo Clinic)', url: 'https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/in-depth/dash-diet/art-20048456', desc: 'Mayo Clinic\u2019s accessible DASH guidance and meal planning.', type: 'guide', regions: ['us'], category: 'Nutrition' },
  { name: 'British Dietetic Association — DASH', url: 'https://www.bda.uk.com', desc: 'UK dietetic association overview of DASH eating pattern.', type: 'guide', regions: ['uk'], category: 'Nutrition' },
  { name: 'British Heart Foundation', url: 'https://www.bhf.org.uk', desc: 'UK charity with research-backed BP and heart-health guidance.', type: 'guide', regions: ['uk'], category: 'Blood Pressure' },
  { name: 'Blood Pressure UK',     url: 'https://www.bloodpressureuk.org', desc: 'UK charity dedicated to BP awareness and patient support.', type: 'guide', regions: ['uk'], category: 'Blood Pressure' },
  { name: 'NHS High Blood Pressure', url: 'https://www.nhs.uk/conditions/high-blood-pressure-hypertension/', desc: 'Official NHS guidance on hypertension diagnosis and treatment.', type: 'guide', regions: ['uk'], category: 'Blood Pressure' },
  { name: 'Stroke Association',    url: 'https://www.stroke.org.uk', desc: 'UK charity covering stroke prevention, BP management, recovery.', type: 'guide', regions: ['uk'], category: 'Blood Pressure' },
  { name: 'American Heart Association', url: 'https://www.heart.org', desc: 'US national authority on heart health and cardiovascular prevention.', type: 'guide', regions: ['us'], category: 'Blood Pressure' },
  { name: 'CDC Blood Pressure',    url: 'https://www.cdc.gov/bloodpressure/', desc: 'US CDC resource on hypertension prevention and management.', type: 'guide', regions: ['us'], category: 'Blood Pressure' },
  { name: 'Million Hearts',        url: 'https://millionhearts.hhs.gov', desc: 'US national initiative to prevent heart attacks and strokes.', type: 'guide', regions: ['us'], category: 'Blood Pressure' },
  { name: 'NIH NHLBI',             url: 'https://www.nhlbi.nih.gov', desc: 'US government health institute publishing cardiovascular guidance.', type: 'guide', regions: ['us'], category: 'Blood Pressure' },
  { name: 'Hong Kong Heart Foundation', url: 'https://www.hkhf.org', desc: 'HK charity focused on heart health and cardiovascular prevention.', type: 'guide', regions: ['hk'], category: 'Blood Pressure' },
  { name: 'NHS Waist Guidance',    url: 'https://www.nhs.uk/live-well/healthy-weight/', desc: 'Official UK NHS guidance on waist measurement and health targets.', type: 'guide', regions: ['uk'], category: 'Waist / Weight' },
  { name: 'MoneyHelper',           url: 'https://www.moneyhelper.org.uk', desc: 'UK government-backed money guidance on pensions, saving, debt, tax.', type: 'guide', regions: ['uk'], category: 'Wealth' },
  { name: 'MoneyHelper Pension Tracing', url: 'https://www.moneyhelper.org.uk/en/pensions-and-retirement/pension-problems/find-a-lost-pension', desc: 'Free UK service to find lost pension pots.', type: 'guide', regions: ['uk'], category: 'Pension' },
  { name: 'HMRC',                  url: 'https://www.gov.uk/government/organisations/hm-revenue-customs', desc: 'UK tax authority, allowances, calculators, self-assessment.', type: 'guide', regions: ['uk'], category: 'Tax' },
  { name: 'GOV.UK Pensions',       url: 'https://www.gov.uk/browse/working/state-pension', desc: 'Official UK guidance on State, workplace, personal pensions.', type: 'guide', regions: ['uk'], category: 'Pension' },
  { name: 'World Economic Forum — Retirement', url: 'https://www.weforum.org/agenda/archive/retirement/', desc: 'International research on the global retirement savings gap.', type: 'guide', regions: ['global'], category: 'Pension' },
  { name: 'OECD Pensions at a Glance', url: 'https://www.oecd.org/pensions/pensionsataglance.htm', desc: 'Cross-country research on pension systems and retirement security.', type: 'guide', regions: ['global'], category: 'Pension' },
  { name: 'IFEC',                  url: 'https://www.ifec.org.hk', desc: 'HK\u2019s government-backed financial literacy authority.', type: 'guide', regions: ['hk'], category: 'Wealth' },
  { name: 'The Chin Family',       url: 'https://www.thechinfamily.hk', desc: 'IFEC\u2019s consumer-facing money education brand.', type: 'guide', regions: ['hk'], category: 'Wealth' },
  { name: 'MPFA',                  url: 'https://www.mpfa.org.hk', desc: 'HK\u2019s Mandatory Provident Fund Authority, pension regulation.', type: 'guide', regions: ['hk'], category: 'Pension' },
  { name: 'Inland Revenue Department (HK)', url: 'https://www.ird.gov.hk', desc: 'HK\u2019s tax authority, allowances, filing, tax guidance.', type: 'guide', regions: ['hk'], category: 'Tax' },
  { name: 'eMPF Platform',         url: 'https://www.empf.org.hk', desc: 'HK\u2019s unified MPF platform for managing all pension accounts.', type: 'guide', regions: ['hk'], category: 'Pension' },
  { name: 'Department of Health (HK)', url: 'https://www.dh.gov.hk', desc: 'HK government health portal on BP, diet, lifestyle, screening.', type: 'guide', regions: ['hk'], category: 'General' },
  { name: 'Centre for Health Protection (HK)', url: 'https://www.chp.gov.hk', desc: 'HK government public health agency with prevention-focused resources.', type: 'guide', regions: ['hk'], category: 'General' },

  // ── Books ──
  { name: 'The Psychology of Money', url: 'https://www.morganhousel.com/books/', desc: 'Morgan Housel on the behaviour and mindset behind money decisions.', type: 'book', regions: ['global'] },
  { name: 'Your Money or Your Life', url: 'https://yourmoneyoryourlife.com', desc: 'Vicki Robin and Joe Dominguez on rethinking your relationship with money.', type: 'book', regions: ['global'] },
  { name: 'The Simple Path to Wealth', url: 'https://jlcollinsnh.com/book/', desc: 'JL Collins\u2019 guide to low-cost, long-term index investing.', type: 'book', regions: ['global'] },
  { name: 'Die With Zero', url: 'https://www.diewithzerobook.com', desc: 'Bill Perkins on optimising for life experiences across decades.', type: 'book', regions: ['global'] },
  { name: 'The Bogleheads\u2019 Guide to Retirement Planning', url: 'https://www.bogleheads.org/wiki/Bogleheads%27_books_(general_overview)', desc: 'Practical retirement planning grounded in low-cost investing.', type: 'book', regions: ['global'] },
  { name: 'The Millionaire Next Door', url: 'https://www.thomasjstanley.com/books/', desc: 'Stanley & Danko on the everyday habits of self-made millionaires.', type: 'book', regions: ['global'] },
  { name: 'The Total Money Makeover', url: 'https://www.ramseysolutions.com/store/books/the-total-money-makeover', desc: 'Dave Ramsey\u2019s debt-elimination and financial-discipline framework.', type: 'book', regions: ['global'] },
];
