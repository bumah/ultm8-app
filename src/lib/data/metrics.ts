/**
 * The science behind every behaviour + indicator ULTM8 tracks.
 * Verbatim from /Users/bumah/Downloads/ultm8 challenge-2/v2/science.html.
 *
 * 32 metrics in total: 8 health behaviours + 8 health indicators
 * + 8 wealth behaviours + 8 wealth indicators.
 */

export type MetricSection =
  | 'health-behaviour'
  | 'health-indicator'
  | 'wealth-behaviour'
  | 'wealth-indicator';

export interface Metric {
  section: MetricSection;
  name: string;
  oneLiner: string;
  what: string;
  why: string;
  lever: string;
}

export const METRIC_SECTION_LABELS: Record<MetricSection, string> = {
  'health-behaviour': 'Health behaviours',
  'health-indicator': 'Health indicators',
  'wealth-behaviour': 'Wealth behaviours',
  'wealth-indicator': 'Wealth indicators',
};

export const METRICS: Metric[] = [
  // ── HEALTH BEHAVIOURS ──
  {
    section: 'health-behaviour',
    name: 'Sleep',
    oneLiner: 'The foundation of recovery.',
    what: 'Sleep is the body\u2019s nightly recovery and consolidation period \u2014 when memory forms, hormones reset, the brain clears waste, and tissue repairs.',
    why: 'Chronic poor sleep raises mortality risk and accelerates cognitive decline. It undermines every other health behaviour: willpower drops, food choices worsen, exercise capacity falls, and stress rises.',
    lever: 'Sleep 7\u20139 hours every night, on a consistent schedule.',
  },
  {
    section: 'health-behaviour',
    name: 'Smoking',
    oneLiner: 'The single biggest preventable risk.',
    what: 'Regular use of tobacco or nicotine \u2014 cigarettes, vaping, cigars, pipes.',
    why: 'Smoking is the single largest preventable cause of premature death globally, raising risk of heart disease, stroke, lung cancer and over a dozen other cancers. Quitting at any age extends life \u2014 the earlier the better, but it is never too late.',
    lever: 'Quitting is the single highest-return health move you can make.',
  },
  {
    section: 'health-behaviour',
    name: 'Strength',
    oneLiner: 'Muscle predicts how well you age.',
    what: 'Any activity that loads your muscles \u2014 resistance bands, body weight, weights, machines \u2014 to maintain and build muscle mass and bone density.',
    why: 'Muscle mass is one of the strongest predictors of how well you age. Losing strength after 40 \u2014 sarcopenia \u2014 leads to falls, fractures, loss of independence, and metabolic decline.',
    lever: 'Train each major muscle group at least twice a week.',
  },
  {
    section: 'health-behaviour',
    name: 'Sweat',
    oneLiner: 'Cardio extends healthspan.',
    what: 'Aerobic exercise \u2014 anything that raises your heart rate and breathing for sustained periods. Walking briskly, running, cycling, swimming, dancing, climbing stairs.',
    why: 'Cardiovascular fitness is one of the strongest predictors of all-cause mortality. Inactivity is one of the leading global health risks.',
    lever: 'Get at least 150 minutes of moderate cardio every week.',
  },
  {
    section: 'health-behaviour',
    name: 'Sugar',
    oneLiner: 'Drives inflammation and disease.',
    what: 'Sugar in the diet \u2014 both added sugars and refined carbohydrates that act like sugar in the body. Sweets, sugary drinks, white bread, pastries, ultra-processed foods.',
    why: 'Excess sugar drives chronic inflammation, weight gain, insulin resistance, and type 2 diabetes. It accelerates cellular ageing and is linked to heart disease, dementia, and several cancers.',
    lever: 'Cut sugary drinks and ultra-processed foods first \u2014 biggest impact, smallest effort.',
  },
  {
    section: 'health-behaviour',
    name: 'Salt',
    oneLiner: 'Raises blood pressure silently.',
    what: 'Sodium intake from food and drink. Most comes from processed foods, restaurant meals, bread, sauces, and snacks \u2014 not the salt shaker.',
    why: 'High sodium raises blood pressure in most people, often without symptoms. Over time, elevated blood pressure damages arteries, heart, kidneys, and brain.',
    lever: 'Cook more meals at home and watch sodium in everything else.',
  },
  {
    section: 'health-behaviour',
    name: 'Spirits',
    oneLiner: 'Alcohol disrupts everything.',
    what: 'Alcohol consumption \u2014 beer, wine, spirits, cocktails. Volume, frequency, and pattern all matter.',
    why: 'Even moderate alcohol disrupts sleep, raises blood pressure, increases cancer risk, harms the liver, and adds empty calories. The "moderate is healthy" narrative has weakened significantly under newer research.',
    lever: 'The less alcohol, the better \u2014 start with several alcohol-free days each week.',
  },
  {
    section: 'health-behaviour',
    name: 'Stress',
    oneLiner: 'Accelerates physical and mental decline.',
    what: 'Chronic stress \u2014 the persistent activation of the body\u2019s stress response when pressure outlasts recovery.',
    why: 'Sustained stress raises cortisol, drives inflammation, raises blood pressure, disrupts sleep, weakens immunity, and accelerates ageing at the cellular level.',
    lever: 'Build a daily recovery practice and protect your time for rest.',
  },

  // ── HEALTH INDICATORS ──
  {
    section: 'health-indicator',
    name: 'Blood Pressure',
    oneLiner: 'The cardiovascular scoreboard.',
    what: 'The pressure of blood against artery walls \u2014 systolic over diastolic.',
    why: 'High blood pressure is a leading cause of heart attacks, strokes, and kidney disease. It usually has no symptoms, which is why most adults with it lack good control.',
    lever: 'Get checked yearly; lower it through salt, weight, exercise, and (if needed) medication.',
  },
  {
    section: 'health-indicator',
    name: 'Weight',
    oneLiner: 'A baseline of body composition.',
    what: 'Total body weight, often expressed alongside BMI. Best tracked alongside waist size and body fat for a fuller picture.',
    why: 'Sustained weight gain \u2014 particularly around the abdomen \u2014 drives metabolic disease, joint problems, and increases risk of multiple cancers.',
    lever: 'Track the trend, not the daily number \u2014 and pair it with waist for a fuller picture.',
  },
  {
    section: 'health-indicator',
    name: 'Waist',
    oneLiner: 'A predictor of metabolic disease.',
    what: 'Waist circumference, measured at the narrowest part of the torso, just above the belly button.',
    why: 'Waist size is a direct predictor of visceral fat \u2014 the metabolically active fat that drives insulin resistance, type 2 diabetes, heart disease, and several cancers.',
    lever: 'Aim for a waist under half your height as a general benchmark.',
  },
  {
    section: 'health-indicator',
    name: 'Resting Heart Rate',
    oneLiner: 'Lower reflects fitter.',
    what: 'Your heart rate when completely at rest \u2014 best measured first thing in the morning before getting out of bed.',
    why: 'A lower resting heart rate generally reflects better cardiovascular fitness and is associated with longer life expectancy.',
    lever: 'Build aerobic fitness and improve sleep \u2014 a lower resting rate follows.',
  },
  {
    section: 'health-indicator',
    name: 'Body Fat %',
    oneLiner: 'What weight cannot tell you.',
    what: 'The percentage of body weight that is fat versus muscle, bone, water, and organs.',
    why: 'Body fat percentage gives a clearer picture than weight alone. Too much \u2014 especially visceral \u2014 drives chronic disease. Too little compromises hormones, bones, and immunity.',
    lever: 'Combine strength training with adequate protein, and track composition over time.',
  },
  {
    section: 'health-indicator',
    name: 'Sleep Quality',
    oneLiner: 'How restorative your sleep is.',
    what: 'How well you sleep, not just how long. How quickly you fall asleep, how often you wake, how deep it feels, how rested you are in the morning.',
    why: 'Sleep quality determines whether your sleep actually does its job. Poor quality sleep, even at the right duration, leads to the same long-term consequences as too little.',
    lever: 'Address what disrupts your sleep \u2014 alcohol, screens, environment \u2014 before chasing duration.',
  },
  {
    section: 'health-indicator',
    name: 'Blood Sugar',
    oneLiner: 'Your response to food and movement.',
    what: 'The level of glucose in your blood. Measured fasting, after meals, or as HbA1c \u2014 a three-month average.',
    why: 'Persistently elevated blood sugar damages blood vessels, nerves, kidneys, and eyes \u2014 and predicts type 2 diabetes long before it is diagnosed. Pre-diabetes is reversible.',
    lever: 'Eat protein and fibre with meals, move after eating, and check HbA1c regularly.',
  },
  {
    section: 'health-indicator',
    name: 'Wellbeing Score',
    oneLiner: 'How you feel this week.',
    what: 'A self-reported 1\u201310 score capturing how you feel \u2014 emotionally, physically, mentally \u2014 this week. Subjective. Tracked over time.',
    why: 'Subjective wellbeing is one of the strongest predictors of long-term health outcomes. Low scores predict higher disease and premature death.',
    lever: 'Score honestly each week and protect what consistently raises it.',
  },

  // ── WEALTH BEHAVIOURS ──
  {
    section: 'wealth-behaviour',
    name: 'Income',
    oneLiner: 'The foundation of everything.',
    what: 'Your ability to earn \u2014 through employment, business, freelance, or investments.',
    why: 'Income sets the ceiling on what you can save, invest, and protect. A higher income earlier means more years of compounding. Income alone does not build wealth, but without it nothing else works.',
    lever: 'Invest in skills and negotiations that grow your earning power over time.',
  },
  {
    section: 'wealth-behaviour',
    name: 'Spending',
    oneLiner: 'Control what goes out.',
    what: 'How you spend your income \u2014 what stays in your account versus what leaves it. Includes lifestyle inflation as income grows.',
    why: 'Lifestyle inflation is the single biggest reason high earners stay financially fragile. Controlling spending is the lever most within your power.',
    lever: 'Track what you spend, and resist lifestyle inflation as your income grows.',
  },
  {
    section: 'wealth-behaviour',
    name: 'Saving',
    oneLiner: 'Build your future, payment by payment.',
    what: 'The portion of income you set aside rather than spend. Emergency funds, short-term savings, and contributions to long-term investment accounts.',
    why: 'Saving creates options. People who save consistently \u2014 even small amounts \u2014 outperform those who save irregularly in larger sums. The habit matters more than the rate.',
    lever: 'Automate it on payday \u2014 save before you spend, not after.',
  },
  {
    section: 'wealth-behaviour',
    name: 'Debt',
    oneLiner: 'High-interest costs you daily.',
    what: 'Money you owe \u2014 credit cards, loans, overdrafts, mortgages. Some debt is productive; most consumer debt is destructive.',
    why: 'High-interest debt is one of the fastest ways to fall behind. Every payment is dragged down by compounding interest, slowing every other goal.',
    lever: 'Attack high-interest debt first while paying minimums on the rest.',
  },
  {
    section: 'wealth-behaviour',
    name: 'Investments',
    oneLiner: 'Make money work without you.',
    what: 'Money put into assets that grow over time \u2014 shares, funds, bonds, property, businesses.',
    why: 'Investments compound. Money invested early grows for decades, often becoming the majority of long-term wealth even if regular contributions stop.',
    lever: 'Start now with diversified, low-cost funds \u2014 time matters more than timing.',
  },
  {
    section: 'wealth-behaviour',
    name: 'Pension',
    oneLiner: 'Where time works hardest.',
    what: 'Long-term retirement contributions through workplace or personal pension plans, often with employer matching and tax advantages.',
    why: 'Contributions made in your 20s and 30s have decades to compound \u2014 often growing 8\u201310\u00d7 by retirement. Late starters need to contribute much more to catch up.',
    lever: 'Contribute enough to get any employer match, and increase as your income rises.',
  },
  {
    section: 'wealth-behaviour',
    name: 'Protection',
    oneLiner: 'Guard the plan against shocks.',
    what: 'Insurance and emergency reserves that protect your finances from major shocks \u2014 illness, disability, death, redundancy.',
    why: 'Most financial plans fail not because of poor returns but because of a single uninsured event. Protection is unglamorous and essential.',
    lever: 'Build a 3\u20136 month emergency fund and cover the risks that could derail you.',
  },
  {
    section: 'wealth-behaviour',
    name: 'Tax',
    oneLiner: 'Optimise what you keep.',
    what: 'How much of your income, gains, and wealth you legally keep after tax. Includes income tax, capital gains, and estate planning.',
    why: 'Most people pay more tax than they need to by not using available allowances and reliefs. Pension contributions, tax-advantaged accounts, and basic estate planning save tens of thousands over a lifetime.',
    lever: 'Use every legal allowance and tax-advantaged account available to you.',
  },

  // ── WEALTH INDICATORS ──
  {
    section: 'wealth-indicator',
    name: 'Net Income',
    oneLiner: 'What actually lands in your account.',
    what: 'Your take-home pay \u2014 income after tax, national insurance, pension contributions, and other deductions.',
    why: 'Net income is the real budget you live on. Many people anchor on gross and overestimate their position.',
    lever: 'Know your monthly take-home pay to the pound \u2014 it\u2019s your real budget.',
  },
  {
    section: 'wealth-indicator',
    name: 'Discretionary Spend',
    oneLiner: 'Non-essential as a share of income.',
    what: 'Spending on non-essentials \u2014 eating out, entertainment, holidays, gadgets, subscriptions \u2014 as a percentage of income.',
    why: 'Discretionary spending is where lifestyle inflation hides. As income rises, savings rates often do not actually improve.',
    lever: 'Track non-essential spending as a share of income to keep lifestyle creep visible.',
  },
  {
    section: 'wealth-indicator',
    name: 'Emergency Fund',
    oneLiner: 'Months you could survive without income.',
    what: 'Accessible cash held to cover unexpected costs or income loss. Measured in months of essential expenses.',
    why: 'An emergency fund prevents short-term shocks from becoming long-term disasters. Without one, an unexpected expense becomes high-interest debt.',
    lever: 'Aim for 3\u20136 months of essential expenses in a separate, accessible account.',
  },
  {
    section: 'wealth-indicator',
    name: 'Debt Level',
    oneLiner: 'High-interest, outstanding.',
    what: 'High-interest debt that does not build an asset \u2014 credit cards, store cards, overdrafts, payday loans.',
    why: 'Bad debt is the opposite of compound investing \u2014 it compounds against you. Eliminating it is a guaranteed return equal to the interest rate.',
    lever: 'Pay it down aggressively \u2014 the interest rate is your guaranteed return.',
  },
  {
    section: 'wealth-indicator',
    name: 'Net Worth',
    oneLiner: 'Total assets minus total liabilities.',
    what: 'Everything you own minus everything you owe. The single best summary of your financial position.',
    why: 'Net worth is the scoreboard. It cuts through income and spending to show what you actually have. Most people do not know their net worth \u2014 most should.',
    lever: 'Calculate it quarterly \u2014 it\u2019s the single best summary of your position.',
  },
  {
    section: 'wealth-indicator',
    name: 'Pension Fund',
    oneLiner: 'Your retirement pot today.',
    what: 'The total value of all your retirement accounts \u2014 workplace, personal, retirement investments.',
    why: 'Your pension fund determines whether you can retire on your terms. People often discover too late that it is far below what they will need.',
    lever: 'Total all your pots once a year and project where they are heading.',
  },
  {
    section: 'wealth-indicator',
    name: 'FI Ratio',
    oneLiner: 'Passive income vs monthly expenses.',
    what: 'Financial Independence Ratio \u2014 monthly passive income divided by monthly essential expenses. 1.0 means investments could fully cover costs.',
    why: 'The FI Ratio is the single most useful number for understanding how close you are to financial freedom. At 1.0, work becomes optional.',
    lever: 'Watch it rise over years \u2014 the ratio of passive income to expenses is the long-game scoreboard.',
  },
  {
    section: 'wealth-indicator',
    name: 'Passive Income',
    oneLiner: 'Income that does not require your time.',
    what: 'Money earned without active work \u2014 dividends, interest, rental income, royalties.',
    why: 'Passive income is the engine of financial freedom. Your time is finite; passive income compounds independently of it.',
    lever: 'Build it slowly through investments and reinvested dividends \u2014 patience compounds.',
  },
];
