type InsightFn = (ws: number[], hs: number[]) => string;

// Insight generators per indicator. WHLABELS order:
// 0 Net Income, 1 Discretionary Spend, 2 Emergency Fund, 3 Debt Level,
// 4 Net Worth, 5 Pension Fund, 6 Passive Income, 7 FI Ratio.
// Behaviour indices (ws): 0 Active Income, 1 Passive Income, 2 Expenses,
// 3 Discretionary, 4 Savings, 5 Debt Repayment, 6 Retirement, 7 Investment.

function summarise(
  drivers: [number, string][],
  ws: number[],
  indicatorPhrase: string,
  improveHint: string,
  maintainHint: string,
): string {
  const weak: string[] = [];
  const strong: string[] = [];
  drivers.forEach(([bIndex, name]) => {
    const score = ws[bIndex] ?? 0;
    if (score <= 0) weak.push(name);
    else strong.push(name);
  });
  const list = drivers.map(d => d[1]).join(', ').replace(/, ([^,]*)$/, ' and $1');
  let txt = `Your ${indicatorPhrase} is directly impacted by your ${list} habits. `;
  if (weak.length && strong.length) {
    txt += `${weak.join(' and ')} ${weak.length > 1 ? 'are' : 'is'} working against you. `;
    txt += `${strong.join(' and ')} ${strong.length > 1 ? 'are' : 'is'} working in your favour. `;
  } else if (weak.length) {
    txt += `${weak.join(' and ')} ${weak.length > 1 ? 'are' : 'is'} actively working against you. `;
  } else {
    txt += 'All these habits are currently working in your favour. ';
  }
  txt += weak.length ? `Improving ${weak[0]} is your fastest route to ${improveHint}.` : maintainHint;
  return txt;
}

export const WCONN_INSIGHTS: InsightFn[] = [
  // 0: Net Income
  (ws) => summarise(
    [[0, 'Active Income']],
    ws,
    'net income',
    'a higher take-home',
    'Keep growing what you earn.',
  ),

  // 1: Discretionary Spend
  (ws) => summarise(
    [[3, 'Discretionary'], [2, 'Expenses']],
    ws,
    'discretionary spend',
    'lower non-essential spending',
    'Keep your spending inside its plan.',
  ),

  // 2: Emergency Fund
  (ws) => summarise(
    [[4, 'Savings'], [2, 'Expenses']],
    ws,
    'emergency fund',
    'a stronger safety buffer',
    'Keep saving and your buffer will grow.',
  ),

  // 3: Debt Level
  (ws) => summarise(
    [[5, 'Debt Repayment']],
    ws,
    'debt level',
    'lower debt',
    'Keep overpaying and avoid new bad debt.',
  ),

  // 4: Net Worth
  (ws) => summarise(
    [[0, 'Active Income'], [4, 'Savings'], [5, 'Debt Repayment'], [7, 'Investment']],
    ws,
    'net worth',
    'faster net worth growth',
    'Keep all four habits pulling in the same direction.',
  ),

  // 5: Pension Fund
  (ws) => summarise(
    [[6, 'Retirement'], [7, 'Investment']],
    ws,
    'pension fund',
    'a stronger retirement position',
    'Keep contributing and reviewing your pot.',
  ),

  // 6: Passive Income
  (ws) => summarise(
    [[1, 'Passive Income'], [7, 'Investment']],
    ws,
    'passive income',
    'more income that doesn\u2019t require your time',
    'Keep investing and growing your streams.',
  ),

  // 7: FI Ratio
  (ws) => summarise(
    [[1, 'Passive Income'], [7, 'Investment'], [2, 'Expenses']],
    ws,
    'FI ratio',
    'financial independence',
    'Keep building passive income and investing consistently.',
  ),
];
