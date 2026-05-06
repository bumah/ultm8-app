// Verbatim from data.js — wealth behaviour recommendations indexed by [behaviourIndex][score].
// Score keys are -1, 0, 1, 2.

export interface Recommendation {
  rec: string;
  next?: string;
}

export const WBRECS: Record<number, Recommendation>[] = [
  // 0: Active Income
  {
    [-1]: { rec: 'You are flying blind on income. Not knowing your exact take-home makes every other financial decision a guess.' },
    0:    { rec: 'You have a rough sense but no precision. Precision enables good decisions.' },
    1:    { rec: 'You know your income and track it. The next level is actively growing it.' },
    2:    { rec: 'You know, track and actively grow your income. This is the foundation of everything.' },
  },
  // 1: Passive Income
  {
    [-1]: { rec: 'No passive income means your financial freedom depends entirely on your ability to work.' },
    0:    { rec: 'You have started building passive income. Inconsistency limits its impact.' },
    1:    { rec: 'You have passive income and track it. The next level is building multiple streams.' },
    2:    { rec: 'Multiple growing passive income streams is the wealth multiplier. Keep building.' },
  },
  // 2: Expenses
  {
    [-1]: { rec: 'Not knowing where your money goes means leakage is guaranteed.' },
    0:    { rec: 'Rough awareness is not enough. Financial clarity requires precision.' },
    1:    { rec: 'You track and know your expenses. The next level is actively reducing them.' },
    2:    { rec: 'You track, know, and actively manage your expenses. This is financial control.' },
  },
  // 3: Discretionary
  {
    [-1]: { rec: 'Uncontrolled discretionary spending is where most wealth quietly disappears.' },
    0:    { rec: 'Awareness without action allows overspending to continue.' },
    1:    { rec: 'You mostly control discretionary spending. Consistency is the final step.' },
    2:    { rec: 'Controlled discretionary spending is one of the most powerful wealth habits.' },
  },
  // 4: Savings
  {
    [-1]: { rec: 'Not saving means no buffer, no growth, and no financial resilience.' },
    0:    { rec: 'Saving when money is left over means savings are last priority. Flip it.' },
    1:    { rec: 'You save consistently most months. Making it automatic removes the decision.' },
    2:    { rec: 'Paying yourself first every month is one of the most powerful financial habits.' },
  },
  // 5: Debt Repayment
  {
    [-1]: { rec: 'Minimum payments only means debt costs you maximum. You need a plan.' },
    0:    { rec: 'Occasional extra payments without a plan are inefficient.' },
    1:    { rec: 'You have a plan and follow it. Consistency and overpaying accelerates freedom.' },
    2:    { rec: 'Consistent overpayment on a clear plan is the fastest route to a clean financial position.' },
  },
  // 6: Retirement
  {
    [-1]: { rec: 'No retirement contributions means time is working against you.' },
    0:    { rec: 'Contributing but not reviewing means you do not know if it is enough.' },
    1:    { rec: 'You contribute and know your pot. The next level is increasing when possible.' },
    2:    { rec: 'Consistent contributions with regular review is the gold standard.' },
  },
  // 7: Investment
  {
    [-1]: { rec: 'No investments outside pension means your wealth is not working as hard as it could.' },
    0:    { rec: 'Occasional investing without a strategy produces inconsistent results.' },
    1:    { rec: 'Monthly investing with a clear strategy is building long-term wealth.' },
    2:    { rec: 'Monthly diversified investing with quarterly review is the wealth building standard.' },
  },
];

// Indicator recommendations indexed by [indicatorIndex][score]. Scores are -1/0/1/2.
// Order matches WHLABELS: Net Income, Discretionary Spend, Emergency Fund, Debt Level,
// Net Worth, Pension Fund, Passive Income, FI Ratio.
export const WHRECS: Record<number, Recommendation>[] = [
  // 0: Net Income
  {
    [-1]: { rec: 'A net income that doesn\u2019t cover the basics needs urgent attention. Earning capacity comes before optimisation.' },
    0:    { rec: 'You don\u2019t know your exact take-home. Find out \u2014 it\u2019s the simplest financial number to know precisely.' },
    1:    { rec: 'Income just covers needs. Build a small buffer first, then look at growing earnings.' },
    2:    { rec: 'Comfortable surplus is exactly what enables saving, investing, and freedom. Direct the surplus deliberately.' },
  },
  // 1: Discretionary Spend
  {
    [-1]: { rec: 'High, regretful discretionary spending is where wealth leaks. A simple weekly cap will move this fast.' },
    0:    { rec: 'You don\u2019t track discretionary spend. Track every non-essential for one week to see where it goes.' },
    1:    { rec: 'Moderate spending is fine if it matches your plan. Keep checking it against your savings rate.' },
    2:    { rec: 'Tight discretionary control is one of the most powerful long-term wealth habits.' },
  },
  // 2: Emergency Fund
  {
    [-1]: { rec: 'Less than a month of expenses means a single bad event becomes a crisis. Building this is the urgent first goal.' },
    0:    { rec: 'You\u2019re unsure of your buffer. Confirm liquid cash equivalent in months of expenses today.' },
    1:    { rec: '1\u20133 months is a start \u2014 keep building toward 3+ months as your floor.' },
    2:    { rec: '3+ months is solid resilience. Keep it liquid and protected; invest anything above 6 months.' },
  },
  // 3: Debt Level
  {
    [-1]: { rec: 'High debt is the headwind on every other metric. Focus on the highest-rate debt first.' },
    0:    { rec: 'You\u2019re unsure of your debt picture. List balances and rates so you can attack it.' },
    1:    { rec: 'Manageable debt on a plan is fine. Stay disciplined and overpay where possible.' },
    2:    { rec: 'Debt-free or near it is one of the strongest financial positions. Keep it that way.' },
  },
  // 4: Net Worth
  {
    [-1]: { rec: 'Negative net worth is your starting point. Tackle high-rate debt and start building any positive net worth.' },
    0:    { rec: 'You don\u2019t track net worth. Calculate assets minus liabilities once a quarter to see direction of travel.' },
    1:    { rec: 'Close to zero. The next milestone is consistently positive and growing.' },
    2:    { rec: 'Positive and growing is the headline. Keep accelerating with savings and investments.' },
  },
  // 5: Pension Fund
  {
    [-1]: { rec: 'Nothing or almost nothing for retirement means time is working against you. Start any contribution this month.' },
    0:    { rec: 'You don\u2019t know where your pension stands. Log into the provider and check today.' },
    1:    { rec: 'Behind for your age but contributing. Increase by 1% with every pay rise to catch up.' },
    2:    { rec: 'On track or ahead is exactly where you want to be. Maintain and protect your contributions.' },
  },
  // 6: Passive Income
  {
    [-1]: { rec: 'No passive income means freedom depends entirely on your ability to work. Build one stream this quarter.' },
    0:    { rec: 'You\u2019re unsure of your passive income. Total it monthly to see the picture.' },
    1:    { rec: 'A small or starting stream is the right shape. Compound it through reinvestment.' },
    2:    { rec: 'Meaningful or multiple streams is the wealth multiplier. Keep diversifying.' },
  },
  // 7: FI Ratio
  {
    [-1]: { rec: 'Zero passive coverage of expenses means full dependence on income. Start the smallest stream possible.' },
    0:    { rec: 'You don\u2019t know your FI ratio. Calculate passive / monthly expenses today.' },
    1:    { rec: '1\u201349% covered is a real start. Keep growing the numerator and watching the denominator.' },
    2:    { rec: '50%+ is over the halfway line. Compounding will accelerate from here.' },
  },
];
