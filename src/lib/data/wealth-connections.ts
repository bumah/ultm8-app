type InsightFn = (ws: number[], hs: number[]) => string;

export const WCONN_INSIGHTS: InsightFn[] = [
  // 0: Net Worth
  (ws, hs) => {
    const weak: string[] = [];
    const strong: string[] = [];
    ([[0, ws[0], 'Active Income'], [7, ws[7], 'Investment']] as [number, number, string][]).forEach(([, score, name]) => {
      if (score <= 2) weak.push(name); else strong.push(name);
    });
    let txt = 'Your net worth is directly impacted by your Active Income and Investment habits. ';
    if (weak.length && strong.length) txt += weak.join(' and ') + ' are holding your net worth back. ' + strong.join(' and ') + ' are working in your favour. ';
    else if (weak.length) txt += weak.join(' and ') + ' are actively limiting your net worth growth. ';
    else txt += 'Both habits are currently working in your favour. ';
    txt += weak.length ? 'Improving ' + weak[0] + ' can be your fastest route to a higher net worth.' : 'Keep these habits consistent to protect and grow your net worth.';
    return txt;
  },

  // 1: Debt Level
  (ws, hs) => {
    const s5 = ws[4], s6 = ws[5];
    let txt = 'Your debt level is directly impacted by your Savings and Debt Repayment habits. ';
    txt += s6 <= 2 ? 'Your Debt Repayment habit is actively slowing progress. ' : 'Your Debt Repayment habit is working in your favour. ';
    txt += s5 <= 2 ? 'Improving your Savings habit can free up more money for repayments.' : 'Your Savings habit is supporting your debt reduction. Keep both consistent.';
    return txt;
  },

  // 2: Savings Capacity
  (ws, hs) => {
    const weak: string[] = [];
    const strong: string[] = [];
    ([[2, ws[2], 'Expenses'], [3, ws[3], 'Discretionary'], [4, ws[4], 'Savings']] as [number, number, string][]).forEach(([, score, name]) => {
      if (score <= 2) weak.push(name); else strong.push(name);
    });
    let txt = 'Your savings capacity is directly impacted by your Expenses, Discretionary and Savings habits. ';
    if (weak.length) txt += weak.join(' and ') + ' are actively limiting how much you can save. ';
    if (strong.length) txt += strong.join(' and ') + ' are working in your favour. ';
    txt += weak.length ? 'Improving ' + weak[0] + ' can be your fastest route to a higher savings rate.' : 'Keep these habits consistent.';
    return txt;
  },

  // 3: Emergency Fund
  (ws, hs) => {
    const s = ws[4];
    let txt = 'Your emergency fund is directly impacted by your Savings habit. ';
    txt += s <= 2
      ? 'Your current savings behaviour is actively limiting your financial resilience. Improving your Savings habit can be your fastest route to a stronger emergency fund.'
      : 'Your Savings habit is building your emergency fund effectively. Keep it consistent.';
    return txt;
  },

  // 4: Retirement Pot
  (ws, hs) => {
    const weak: string[] = [];
    const strong: string[] = [];
    ([[1, ws[1], 'Passive Income'], [6, ws[6], 'Retirement'], [7, ws[7], 'Investment']] as [number, number, string][]).forEach(([, score, name]) => {
      if (score <= 2) weak.push(name); else strong.push(name);
    });
    let txt = 'Your retirement pot is directly impacted by your Passive Income, Retirement and Investment habits. ';
    if (weak.length) txt += weak.join(' and ') + ' are actively limiting your retirement pot growth. ';
    if (strong.length) txt += strong.join(' and ') + ' are working in your favour. ';
    txt += weak.length ? 'Improving ' + weak[0] + ' can be your fastest route to a stronger retirement position.' : 'Keep contributing consistently.';
    return txt;
  },

  // 5: FI Ratio
  (ws, hs) => {
    const weak: string[] = [];
    const strong: string[] = [];
    ([[0, ws[0], 'Active Income'], [1, ws[1], 'Passive Income'], [7, ws[7], 'Investment']] as [number, number, string][]).forEach(([, score, name]) => {
      if (score <= 2) weak.push(name); else strong.push(name);
    });
    let txt = 'Your FI ratio is directly impacted by your Active Income, Passive Income and Investment habits. ';
    if (weak.length) txt += weak.join(' and ') + ' are holding your financial independence progress back. ';
    if (strong.length) txt += strong.join(' and ') + ' are working in your favour. ';
    txt += weak.length ? 'Improving ' + weak[0] + ' can be your fastest route to a higher FI ratio.' : 'Keep building passive income and investments.';
    return txt;
  },

  // 6: Lifestyle Creep
  (ws, hs) => {
    const weak: string[] = [];
    const strong: string[] = [];
    ([[2, ws[2], 'Expenses'], [3, ws[3], 'Discretionary']] as [number, number, string][]).forEach(([, score, name]) => {
      if (score <= 2) weak.push(name); else strong.push(name);
    });
    let txt = 'Your lifestyle creep is directly impacted by your Expenses and Discretionary habits. ';
    if (weak.length) txt += weak.join(' and ') + ' are actively driving lifestyle creep. ';
    if (strong.length) txt += strong.join(' and ') + ' are working in your favour. ';
    txt += weak.length ? 'Improving ' + weak[0] + ' can be your fastest route to controlling lifestyle creep.' : 'Keep your spending controlled as your income grows.';
    return txt;
  },

  // 7: Credit Score
  (ws, hs) => {
    const weak: string[] = [];
    const strong: string[] = [];
    ([[4, ws[4], 'Savings'], [5, ws[5], 'Debt Repayment']] as [number, number, string][]).forEach(([, score, name]) => {
      if (score <= 2) weak.push(name); else strong.push(name);
    });
    let txt = 'Your credit score is directly impacted by your Savings and Debt Repayment habits. ';
    if (weak.length) txt += weak.join(' and ') + ' are actively working against your credit score. ';
    if (strong.length) txt += strong.join(' and ') + ' are working in your favour. ';
    txt += weak.length ? 'Improving ' + weak[0] + ' can be your fastest route to a better credit score.' : 'Keep paying on time and managing debt consistently.';
    return txt;
  },
];
