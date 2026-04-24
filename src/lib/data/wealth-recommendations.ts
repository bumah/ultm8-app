export interface Recommendation {
  rec: string;
  next: string;
}

// WBRECS: behaviour recommendations indexed by [behaviourIndex][tierScore (1-4)].
// Order matches WBLABELS v2: Income, Spending, Saving, Debt, Investments, Pension, Protection, Tax.
export const WBRECS: Record<number, Recommendation>[] = [
  // 0: Income
  {
    1: { rec: 'You are flying blind on income. Not knowing your exact take-home makes every other financial decision a guess.', next: 'Find your exact monthly take-home this week.' },
    2: { rec: 'You have a rough sense but no precision. Precision enables good decisions.', next: 'Track your income exactly for one month.' },
    3: { rec: 'You know your income and track it. The next level is actively growing it.', next: 'Identify one income growth opportunity this month.' },
    4: { rec: 'You know, track and actively grow your income. This is the foundation of everything.', next: 'Maintain. Review income growth progress monthly.' },
  },
  // 1: Spending
  {
    1: { rec: 'Spending outside any plan is where money quietly disappears. Get a simple budget in place this week.', next: 'Track every spend for 7 days to see the leaks.' },
    2: { rec: 'A rough budget you often exceed is effectively no budget. Tighten it and automate as much as possible.', next: 'Set a weekly cap for discretionary spend and review every Sunday.' },
    3: { rec: 'You follow a budget most of the time. Consistency is the last mile.', next: 'Hit your budget 4 weeks in a row.' },
    4: { rec: 'You rarely go outside your planned budget \u2014 this is the habit that protects everything else.', next: 'Maintain. Review monthly for lifestyle creep.' },
  },
  // 2: Saving
  {
    1: { rec: 'No saving means no buffer, no growth, no resilience. Start with any amount \u2014 the habit matters most.', next: 'Save any amount this month. The habit matters more than the amount.' },
    2: { rec: 'Saving when money is left over means savings are last priority. Flip it.', next: 'Automate a transfer on payday. Pay yourself first.' },
    3: { rec: 'You save consistently most months. Making it automatic removes the decision.', next: 'Automate savings on payday so willpower isn\u2019t required.' },
    4: { rec: 'Paying yourself first every month is one of the most powerful financial habits.', next: 'Maintain. Increase your savings rate by 1% this quarter.' },
  },
  // 3: Debt
  {
    1: { rec: 'Minimum payments only means debt costs you maximum. You need a plan.', next: 'List all debts + interest rates. Focus extra payments on the highest rate first.' },
    2: { rec: 'Occasional extra payments without a plan are inefficient.', next: 'Create a simple debt repayment plan this week.' },
    3: { rec: 'You have a plan and follow it. Overpaying accelerates freedom.', next: 'Increase monthly repayment by even a small amount.' },
    4: { rec: 'Consistent overpayment on a clear plan is the fastest route to a clean financial position.', next: 'Maintain. Track your total debt monthly.' },
  },
  // 4: Investments
  {
    1: { rec: 'No investments outside a workplace pension means your wealth isn\u2019t working as hard as it could.', next: 'Open an ISA or investment account this month.' },
    2: { rec: 'Occasional investing without a strategy produces inconsistent results.', next: 'Define your investment strategy this month.' },
    3: { rec: 'Monthly investing with a clear strategy is building long-term wealth.', next: 'Diversify across one additional asset class this quarter.' },
    4: { rec: 'Monthly diversified investing with quarterly review is the wealth-building standard.', next: 'Maintain. Rebalance quarterly.' },
  },
  // 5: Pension
  {
    1: { rec: 'No pension contributions means time is working against you.', next: 'Start any pension contribution this month. Time matters more than amount.' },
    2: { rec: 'Contributing without reviewing means you don\u2019t know if it\u2019s enough.', next: 'Review your pension pot value and projected retirement income.' },
    3: { rec: 'You contribute and know your pot. The next level is increasing when possible.', next: 'Increase contributions by 1% this quarter.' },
    4: { rec: 'Consistent contributions with regular review is the gold standard.', next: 'Maintain. Increase contributions with every pay rise.' },
  },
  // 6: Protection
  {
    1: { rec: 'No protection means a single bad event can wipe out years of progress. Start with the basics.', next: 'Get a quote for life + income protection this month.' },
    2: { rec: 'Old cover you haven\u2019t reviewed may be inadequate. Review it this quarter.', next: 'Review your existing cover against your current needs.' },
    3: { rec: 'Life and income protection reviewed annually is solid. Consider critical illness and health cover next.', next: 'Add critical illness or health cover this year.' },
    4: { rec: 'Comprehensive, reviewed cover is real financial resilience.', next: 'Maintain. Review annually or after any life change.' },
  },
  // 7: Tax
  {
    1: { rec: 'Not using tax-advantaged accounts leaves money on the table every year.', next: 'Open an ISA or pension this month if you don\u2019t have one.' },
    2: { rec: 'Using one allowance inconsistently loses the compounding benefit. Make it automatic.', next: 'Set up a monthly ISA/pension contribution.' },
    3: { rec: 'Using your ISA or pension allowance most years is strong. Fill both each year when possible.', next: 'Target using your full ISA and pension allowance every tax year.' },
    4: { rec: 'Fully using all allowances every year is elite tax discipline.', next: 'Maintain. Review allowances each April.' },
  },
];

// WHRECS: indicator recommendations indexed by [indicatorIndex][0-7 where 0=score 8 (best), 7=worst].
// Order matches WHLABELS v2: Net Income, Discretionary Spend, Emergency Fund, Debt Level, Net Worth, Pension Fund, FI Ratio, Passive Income.
export const WHRECS: Recommendation[][] = [
  // 0: Net Income
  [
    { rec: 'High net income. Your earnings ceiling is strong \u2014 focus on deploying it well.', next: 'Maintain. Direct surplus to investments.' },
    { rec: 'Very strong net income.', next: 'Aim to invest 25%+ of each month.' },
    { rec: 'Strong net income. Good base for building wealth.', next: 'Automate savings + investments on payday.' },
    { rec: 'Solid take-home. Focus on growing savings rate.', next: 'Target saving 20% of net income.' },
    { rec: 'Moderate. Focus on income growth as much as spending control.', next: 'Identify one income growth lever this year.' },
    { rec: 'Modest. Prioritise skills or a side income to raise take-home.', next: 'Identify one earning skill to develop this year.' },
    { rec: 'Low. Cost control and income growth need equal attention.', next: 'Audit spending + start a side income.' },
    { rec: 'Very low. Both income and expenses need urgent attention.', next: 'Seek help \u2014 career, benefits, or debt advice.' },
  ],
  // 1: Discretionary Spend
  [
    { rec: 'Under 5% of income on discretionary. Exceptional discipline.', next: 'Maintain. Protect against lifestyle inflation.' },
    { rec: '5\u201310% discretionary. Very controlled.', next: 'Maintain. Review monthly.' },
    { rec: '10\u201315% discretionary. Good control.', next: 'Target under 10%.' },
    { rec: '15\u201320% discretionary. Room to reduce.', next: 'Target 15%.' },
    { rec: '20\u201325% discretionary. A material chunk going to non-essentials.', next: 'Target 20%.' },
    { rec: '25\u201330% discretionary. Limiting savings significantly.', next: 'Target 25%.' },
    { rec: '30\u201340% discretionary. A major wealth barrier.', next: 'Run a full spending audit this week.' },
    { rec: '40%+ discretionary. Lifestyle creep is your biggest challenge.', next: 'Spending audit now. Cut ruthlessly.' },
  ],
  // 2: Emergency Fund
  [
    { rec: '2+ years covered. Exceptional resilience.', next: 'Maintain. Invest anything above 2 years.' },
    { rec: '13\u201324 months covered. Strong buffer.', next: 'Target 24 months.' },
    { rec: '7\u201312 months covered. Above the minimum.', next: 'Target 13 months.' },
    { rec: '4\u20136 months covered. At or above the standard.', next: 'Target 7 months.' },
    { rec: '3 months covered. At the minimum recommended level.', next: 'Target 4\u20136 months.' },
    { rec: '2 months covered. Getting close to the minimum.', next: 'Target 3 months.' },
    { rec: 'Less than 1 month covered. One unexpected event could cause serious stress.', next: 'Target 1 month as first milestone.' },
    { rec: 'No emergency fund. Most urgent financial priority.', next: 'Save 1 month of expenses before any other goal.' },
  ],
  // 3: Debt Level
  [
    { rec: 'Debt-free. One of the most powerful financial positions.', next: 'Maintain. Stay debt-free.' },
    { rec: 'Minimal debt. Almost there.', next: 'Target zero debt.' },
    { rec: 'Low debt. Good progress.', next: 'Target under 0.25x annual income.' },
    { rec: 'Manageable debt. A repayment plan is working.', next: 'Prioritise highest interest debt first.' },
    { rec: 'Moderate debt. A clear plan is essential.', next: 'Target 1x annual income.' },
    { rec: 'Significant debt. Needs focused attention.', next: 'Consider consolidation to reduce interest.' },
    { rec: 'High debt. Limiting your progress significantly.', next: 'Seek financial advice if needed.' },
    { rec: 'Very high debt. Needs urgent attention.', next: 'Speak to a debt adviser immediately.' },
  ],
  // 4: Net Worth
  [
    { rec: 'Optimal. Net worth is 10x+ annual income.', next: 'Maintain. Review net worth quarterly.' },
    { rec: 'Excellent. 5\u201310x annual income.', next: 'Target 10x annual income.' },
    { rec: 'Strong. 2\u20135x annual income.', next: 'Target 5x annual income.' },
    { rec: 'Getting there. 1\u20132x annual income.', next: 'Target 2x annual income.' },
    { rec: 'Building. 0.5\u20131x annual income.', next: 'Target 1x annual income.' },
    { rec: 'Early stage. Under 0.5x annual income.', next: 'Target 0.5x annual income.' },
    { rec: 'Starting out. Under 0.25x annual income.', next: 'Target 0.25x annual income.' },
    { rec: 'Net worth is negative. This is your starting point.', next: 'Target zero net worth first.' },
  ],
  // 5: Pension Fund
  [
    { rec: 'Exceptional pension pot for your age.', next: 'Maintain contributions. Review annually.' },
    { rec: 'Strong pension pot for your age.', next: 'Increase contributions with every pay rise.' },
    { rec: 'Solid pension pot.', next: 'Review projected income. Increase if below target.' },
    { rec: 'Developing pension pot. Time is still on your side.', next: 'Increase contributions by 1\u20132% this quarter.' },
    { rec: 'Pension pot needs attention.', next: 'Increase contributions. Even 1% more makes a big difference.' },
    { rec: 'Pension pot is below target for your age.', next: 'Consider increasing contributions significantly.' },
    { rec: 'Pension pot is well below target. Urgent action needed.', next: 'Speak to a financial adviser.' },
    { rec: 'No pension savings. Start immediately.', next: 'Start any pension contribution this month.' },
  ],
  // 6: FI Ratio
  [
    { rec: 'FI Ratio 2.0+. Super comfortable.', next: 'Maintain. Grow passive income if desired.' },
    { rec: 'FI Ratio 1.0\u20131.99. Financially independent.', next: 'Target 2.0.' },
    { rec: 'FI Ratio 0.51\u20130.99. Over halfway to financial independence.', next: 'Target 1.0.' },
    { rec: 'FI Ratio 0.26\u20130.50. Passive income covers a meaningful portion.', next: 'Target 0.51.' },
    { rec: 'FI Ratio 0.11\u20130.25. A start.', next: 'Target 0.26.' },
    { rec: 'FI Ratio 0.06\u20130.10. Minimal but exists.', next: 'Target 0.11. Invest consistently.' },
    { rec: 'FI Ratio 0.01\u20130.05. Just starting.', next: 'Target 0.06. Reinvest all returns.' },
    { rec: 'No passive income. Freedom depends entirely on your ability to work.', next: 'Start building one passive income source this quarter.' },
  ],
  // 7: Passive Income
  [
    { rec: 'Substantial passive income. You have real optionality.', next: 'Maintain. Diversify across 3+ streams.' },
    { rec: 'Strong passive income. Build further diversity.', next: 'Add a second or third stream this year.' },
    { rec: 'Meaningful passive income. Keep compounding it.', next: 'Reinvest all returns back into assets.' },
    { rec: 'Growing passive income. A good foundation.', next: 'Increase monthly investments to accelerate.' },
    { rec: 'Modest passive income. The habit exists.', next: 'Raise contributions and track monthly.' },
    { rec: 'Small passive income. Keep going.', next: 'Focus on one primary source until consistent.' },
    { rec: 'Minimal passive income. Just starting out.', next: 'Pick one vehicle (ISA, dividend fund) and automate.' },
    { rec: 'No passive income. Your freedom depends entirely on work.', next: 'Start building one passive stream this quarter.' },
  ],
];
