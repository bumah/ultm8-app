type InsightFn = (ws: number[], hs: number[]) => string;

// Insight generators per indicator. Order matches WHLABELS v2:
// 0 Net Income, 1 Discretionary Spend, 2 Emergency Fund, 3 Debt Level,
// 4 Net Worth, 5 Pension Fund, 6 FI Ratio, 7 Passive Income.
// Behaviour indices (ws): 0 Income, 1 Spending, 2 Saving, 3 Debt,
// 4 Investments, 5 Pension, 6 Protection, 7 Tax.

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
    if (score <= 2) weak.push(name);
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
    [[0, 'Income'], [7, 'Tax']],
    ws,
    'net income',
    'a higher take-home',
    'Keep income growing and tax efficiency tight.',
  ),

  // 1: Discretionary Spend
  (ws) => summarise(
    [[1, 'Spending']],
    ws,
    'discretionary spend',
    'lower non-essential spending',
    'Keep spending inside your plan each month.',
  ),

  // 2: Emergency Fund
  (ws) => summarise(
    [[2, 'Saving']],
    ws,
    'emergency fund',
    'a stronger safety buffer',
    'Keep saving consistently to grow and protect your buffer.',
  ),

  // 3: Debt Level
  (ws) => summarise(
    [[3, 'Debt']],
    ws,
    'debt level',
    'lower debt',
    'Keep overpaying and avoid new bad debt.',
  ),

  // 4: Net Worth
  (ws) => summarise(
    [[0, 'Income'], [2, 'Saving'], [3, 'Debt'], [4, 'Investments']],
    ws,
    'net worth',
    'faster net worth growth',
    'Keep all four habits pulling in the same direction.',
  ),

  // 5: Pension Fund
  (ws) => summarise(
    [[5, 'Pension'], [7, 'Tax']],
    ws,
    'pension fund',
    'a stronger retirement position',
    'Keep contributing and using your tax allowances.',
  ),

  // 6: FI Ratio
  (ws) => summarise(
    [[4, 'Investments'], [5, 'Pension'], [2, 'Saving']],
    ws,
    'FI ratio',
    'financial independence',
    'Keep building passive income and investing consistently.',
  ),

  // 7: Passive Income
  (ws) => summarise(
    [[4, 'Investments'], [6, 'Protection']],
    ws,
    'passive income',
    'more income that doesn\u2019t require your time',
    'Keep investing and protect what you\u2019ve built.',
  ),
];
