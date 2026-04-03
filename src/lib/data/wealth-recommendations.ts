export interface Recommendation {
  rec: string;
  next: string;
}

// WBRECS: behaviour recommendations indexed by [behaviourIndex][tierScore (1-4)]
export const WBRECS: Record<number, Recommendation>[] = [
  // 0: Active Income
  {
    1: { rec: 'You are flying blind on income. Not knowing your exact take-home makes every other financial decision a guess.', next: 'Find your exact monthly take-home this week.' },
    2: { rec: 'You have a rough sense but no precision. Precision enables good decisions.', next: 'Track your income exactly for one month.' },
    3: { rec: 'You know your income and track it. The next level is actively growing it.', next: 'Identify one income growth opportunity this month.' },
    4: { rec: 'You know, track and actively grow your income. This is the foundation of everything.', next: 'Maintain. Review income growth progress monthly.' },
  },
  // 1: Passive Income
  {
    1: { rec: 'No passive income means your financial freedom depends entirely on your ability to work.', next: 'Identify one potential passive income source this season.' },
    2: { rec: 'You have started building passive income. Inconsistency limits its impact.', next: 'Make your passive income source consistent. Track it monthly.' },
    3: { rec: 'You have passive income and track it. The next level is building multiple streams.', next: 'Identify and begin building a second passive income source.' },
    4: { rec: 'Multiple growing passive income streams is the wealth multiplier. Keep building.', next: 'Maintain and grow. Review passive income monthly.' },
  },
  // 2: Expenses
  {
    1: { rec: 'Not knowing where your money goes means leakage is guaranteed.', next: 'Track all spending for one month. Any method counts.' },
    2: { rec: 'Rough awareness is not enough. Financial clarity requires precision.', next: 'Track total expenses exactly for one month. Categorise everything.' },
    3: { rec: 'You track and know your expenses. The next level is actively reducing them.', next: 'Identify one category to reduce by 10%.' },
    4: { rec: 'You track, know, and actively manage your expenses. This is financial control.', next: 'Maintain. Monthly review \u2014 look for lifestyle creep.' },
  },
  // 3: Discretionary
  {
    1: { rec: 'Uncontrolled discretionary spending is where most wealth quietly disappears.', next: 'Track every non-essential purchase this week.' },
    2: { rec: 'Awareness without action allows overspending to continue.', next: 'Set a weekly discretionary budget. Review it every Sunday.' },
    3: { rec: 'You mostly control discretionary spending. Consistency is the final step.', next: 'Set a firm monthly limit and stick to it for a full season.' },
    4: { rec: 'Controlled discretionary spending is one of the most powerful wealth habits.', next: 'Maintain. Review monthly and protect against lifestyle creep.' },
  },
  // 4: Savings
  {
    1: { rec: 'Not saving means no buffer, no growth, and no financial resilience.', next: 'Save any amount this month. The habit matters more than the amount.' },
    2: { rec: 'Saving when money is left over means savings are last priority. Flip it.', next: 'Set up an automatic transfer on payday. Pay yourself first.' },
    3: { rec: 'You save consistently most months. Making it automatic removes the decision.', next: 'Automate savings on payday. Remove the willpower requirement.' },
    4: { rec: 'Paying yourself first every month is one of the most powerful financial habits.', next: 'Maintain. Increase your savings rate by 1% this season.' },
  },
  // 5: Debt Repayment
  {
    1: { rec: 'Minimum payments only means debt costs you maximum. You need a plan.', next: 'List all debts with interest rates. Focus extra payments on the highest rate first.' },
    2: { rec: 'Occasional extra payments without a plan are inefficient.', next: 'Create a simple debt repayment plan this week.' },
    3: { rec: 'You have a plan and follow it. Consistency and overpaying accelerates freedom.', next: 'Increase monthly repayment by even a small amount.' },
    4: { rec: 'Consistent overpayment on a clear plan is the fastest route to a clean financial position.', next: 'Maintain. Track your total debt monthly.' },
  },
  // 6: Retirement
  {
    1: { rec: 'No retirement contributions means time is working against you.', next: 'Start any pension contribution this month. Time matters more than amount.' },
    2: { rec: 'Contributing but not reviewing means you do not know if it is enough.', next: 'Review your pension pot value and projected retirement income.' },
    3: { rec: 'You contribute and know your pot. The next level is increasing when possible.', next: 'Increase contributions by 1% this season.' },
    4: { rec: 'Consistent contributions with regular review is the gold standard.', next: 'Maintain. Increase contributions with every pay rise.' },
  },
  // 7: Investment
  {
    1: { rec: 'No investments outside pension means your wealth is not working as hard as it could.', next: 'Open an ISA or investment account this month.' },
    2: { rec: 'Occasional investing without a strategy produces inconsistent results.', next: 'Define your investment strategy this month.' },
    3: { rec: 'Monthly investing with a clear strategy is building long-term wealth.', next: 'Diversify across one additional asset class this season.' },
    4: { rec: 'Monthly diversified investing with quarterly review is the wealth building standard.', next: 'Maintain. Review portfolio and rebalance quarterly.' },
  },
];

// WHRECS: indicator recommendations indexed by [indicatorIndex][0-7 where 0=best, 7=worst]
// Note: array index 0 = score 8 (best), index 7 = score 1 (worst)
export const WHRECS: Recommendation[][] = [
  // 0: Net Worth
  [
    { rec: 'Optimal. Net worth is 10x+ annual income.', next: 'Maintain. Review net worth quarterly.' },
    { rec: 'Excellent. 5-10x annual income.', next: 'Target 10x annual income.' },
    { rec: 'Strong. 2-5x annual income.', next: 'Target 5x annual income.' },
    { rec: 'Getting there. 1-2x annual income.', next: 'Target 2x annual income.' },
    { rec: 'Building. 0.5-1x annual income.', next: 'Target 1x annual income.' },
    { rec: 'Early stage. Under 0.5x annual income.', next: 'Target 0.5x annual income.' },
    { rec: 'Starting out. Under 0.25x annual income.', next: 'Target 0.25x annual income.' },
    { rec: 'Net worth is negative. This is your starting point.', next: 'Target zero net worth first.' },
  ],
  // 1: Debt Level
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
  // 2: Savings Capacity
  [
    { rec: 'Saving 50%+ of income is exceptional.', next: 'Maintain. Protect against lifestyle creep.' },
    { rec: '31-50% savings rate is excellent.', next: 'Target 50%.' },
    { rec: '21-30% savings rate. Above average.', next: 'Target 31%.' },
    { rec: '16-20% savings rate. Solid.', next: 'Target 21%.' },
    { rec: '11-15% savings rate. Good habit.', next: 'Target 16%.' },
    { rec: '6-10% savings rate. A start.', next: 'Target 11%. Automate on payday.' },
    { rec: '1-5% savings rate. The habit exists but needs to grow.', next: 'Target 6%.' },
    { rec: 'Not saving. Most urgent financial priority.', next: 'Save any amount this month.' },
  ],
  // 3: Emergency Fund
  [
    { rec: '2+ years covered. Exceptional financial resilience.', next: 'Maintain. Invest anything above 2 years.' },
    { rec: '13-24 months covered. Strong buffer.', next: 'Target 24 months.' },
    { rec: '7-12 months covered. Above the minimum.', next: 'Target 13 months.' },
    { rec: '4-6 months covered. At or above the standard.', next: 'Target 7 months.' },
    { rec: '3 months covered. At the minimum recommended level.', next: 'Target 4-6 months.' },
    { rec: '2 months covered. Getting close to the minimum.', next: 'Target 3 months.' },
    { rec: 'Less than 1 month covered. One unexpected event could cause serious stress.', next: 'Target 1 month as first milestone.' },
    { rec: 'No emergency fund. Most urgent financial priority.', next: 'Save 1 month of expenses before any other goal.' },
  ],
  // 4: Retirement Pot
  [
    { rec: 'Retirement pot is exceptional for your age.', next: 'Maintain contributions. Review annually.' },
    { rec: 'Retirement pot is strong for your age.', next: 'Increase contributions with every pay rise.' },
    { rec: 'Retirement pot is solid.', next: 'Review projected income. Increase if below target.' },
    { rec: 'Retirement pot is developing. Time is still on your side.', next: 'Increase contributions by 1-2% this season.' },
    { rec: 'Retirement pot needs attention.', next: 'Increase contributions. Even 1% more makes a big difference.' },
    { rec: 'Retirement pot is below target for your age.', next: 'Consider increasing contributions significantly.' },
    { rec: 'Retirement pot is well below target. Urgent action needed.', next: 'Speak to a financial adviser.' },
    { rec: 'No retirement savings. Start immediately.', next: 'Start any pension contribution this month.' },
  ],
  // 5: FI Ratio
  [
    { rec: 'FI Ratio 2.0+. Super comfortable.', next: 'Maintain. Grow passive income if desired.' },
    { rec: 'FI Ratio 1.0-1.99. Financially independent.', next: 'Target 2.0.' },
    { rec: 'FI Ratio 0.51-0.99. Over halfway to financial independence.', next: 'Target 1.0.' },
    { rec: 'FI Ratio 0.26-0.50. Passive income covers a meaningful portion.', next: 'Target 0.51.' },
    { rec: 'FI Ratio 0.11-0.25. A start.', next: 'Target 0.26.' },
    { rec: 'FI Ratio 0.06-0.10. Minimal but exists.', next: 'Target 0.11. Invest consistently.' },
    { rec: 'FI Ratio 0.01-0.05. Just starting.', next: 'Target 0.06. Reinvest all returns.' },
    { rec: 'No passive income. Freedom depends entirely on your ability to work.', next: 'Start building one passive income source this season.' },
  ],
  // 6: Lifestyle Creep
  [
    { rec: 'Under 5% on discretionary. Exceptional discipline.', next: 'Maintain. Protect against lifestyle inflation.' },
    { rec: '5-10% on discretionary. Very controlled.', next: 'Maintain. Review monthly.' },
    { rec: '10-15% on discretionary. Good control.', next: 'Target under 10%.' },
    { rec: '15-20% on discretionary. Room to reduce.', next: 'Target 15%.' },
    { rec: '20-25% on discretionary. Significant portion on non-essentials.', next: 'Target 20%.' },
    { rec: '25-30% on discretionary. Limiting savings significantly.', next: 'Target 25%.' },
    { rec: '30-40% on discretionary. A major wealth barrier.', next: 'Conduct a full spending audit this week.' },
    { rec: '40%+ on discretionary. Lifestyle creep is your biggest challenge.', next: 'Spending audit immediately. Cut ruthlessly.' },
  ],
  // 7: Credit Score
  [
    { rec: 'Perfect credit score. Maintain by paying on time.', next: 'Maintain. Never miss a payment.' },
    { rec: 'Exceptional credit score.', next: 'Keep utilisation below 30%.' },
    { rec: 'Excellent credit score.', next: 'Target exceptional. Reduce utilisation.' },
    { rec: 'Very good credit score.', next: 'Target excellent. Pay on time consistently.' },
    { rec: 'Good credit score.', next: 'Target very good. Check report for errors.' },
    { rec: 'Fair credit score. Improvement achievable.', next: 'Pay every bill on time for 6 months.' },
    { rec: 'Poor credit score. Limiting your options.', next: 'Pay on time. Reduce balances. Check report.' },
    { rec: 'Very poor credit score. Urgent attention needed.', next: 'Check credit report. Set up payment reminders now.' },
  ],
];
