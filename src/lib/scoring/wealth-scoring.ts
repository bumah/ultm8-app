// Wealth scoring engine — ported from ultm8-wealth-assessment.html

export const WBLABELS = ['Active Income', 'Passive Income', 'Expenses', 'Discretionary', 'Savings', 'Debt Repayment', 'Retirement', 'Investment'] as const;
export const WHLABELS = ['Net Worth', 'Debt Level', 'Savings Capacity', 'Emergency Fund', 'Retirement Pot', 'FI Ratio', 'Lifestyle Creep', 'Credit Score'] as const;

export const WHWEIGHTS = [0.20, 0.15, 0.15, 0.10, 0.15, 0.10, 0.10, 0.05];

export const WBMAP: Record<number, number[]> = {
  0: [0, 7],       // Net Worth: Active Income, Investment
  1: [4, 5],       // Debt Level: Savings, Debt Repayment
  2: [2, 3, 4],    // Savings Capacity: Expenses, Discretionary, Savings
  3: [4],          // Emergency Fund: Savings
  4: [1, 6, 7],    // Retirement Pot: Passive Income, Retirement, Investment
  5: [0, 1, 7],    // FI Ratio: Active Income, Passive Income, Investment
  6: [2, 3],       // Lifestyle Creep: Expenses, Discretionary
  7: [4, 5],       // Credit Score: Savings, Debt Repayment
};

// Retirement pot thresholds are age-specific (years of annual income)
const RETIREMENT_THRESHOLDS: Record<string, number[]> = {
  '18-29': [0, 0.1, 0.3, 0.5, 1, 2, 3, 5],
  '30-44': [0, 0.5, 1, 2, 3, 5, 8, 12],
  '45-59': [0, 1, 2, 4, 6, 10, 15, 20],
  '60+':   [0, 2, 4, 7, 10, 15, 18, 22],
};

function scoreHigher(value: number, thresholds: number[]): number {
  if (value >= thresholds[7]) return 8;
  if (value >= thresholds[6]) return 7;
  if (value >= thresholds[5]) return 6;
  if (value >= thresholds[4]) return 5;
  if (value >= thresholds[3]) return 4;
  if (value >= thresholds[2]) return 3;
  if (value >= thresholds[1]) return 2;
  return 1;
}

function scoreLower(value: number, thresholds: number[]): number {
  if (value >= thresholds[0]) return 1;
  if (value >= thresholds[1]) return 2;
  if (value >= thresholds[2]) return 3;
  if (value >= thresholds[3]) return 4;
  if (value >= thresholds[4]) return 5;
  if (value >= thresholds[5]) return 6;
  if (value >= thresholds[6]) return 7;
  return 8;
}

export interface FinancialData {
  income: number;        // monthly take-home
  passive: number;       // monthly passive income
  expenses: number;      // monthly total expenses
  discretionary: number; // monthly discretionary spend
  savings: number;       // monthly savings
  savingsTotal: number;  // total savings & investments
  pension: number;       // total pension value
  debt: number;          // total outstanding debt
  creditScore: number;   // 1-8 self-rated
}

export interface WealthScoreResult {
  scores: number[];
  computed: {
    netWorth: number;
    savingsRate: number;
    emergencyMonths: number;
    fiRatio: number;
    discPct: number;
  };
}

export function computeWealthScores(fd: FinancialData, ageGroup: string): WealthScoreResult {
  const ann = fd.income * 12;
  const nw = fd.savingsTotal + fd.pension - fd.debt;
  const nwR = ann > 0 ? nw / ann : 0;
  const dR = ann > 0 ? fd.debt / ann : 0;
  const sR = fd.income > 0 ? (fd.savings / fd.income) * 100 : 0;
  const eM = fd.expenses > 0 ? fd.savingsTotal / fd.expenses : 0;
  const fi = fd.expenses > 0 ? fd.passive / fd.expenses : 0;
  const dp = fd.income > 0 ? (fd.discretionary / fd.income) * 100 : 100;

  const rthr = RETIREMENT_THRESHOLDS[ageGroup] || RETIREMENT_THRESHOLDS['30-44'];
  const rR = ann > 0 ? fd.pension / ann : 0;

  const scores = [
    scoreHigher(nwR, [-99, 0, 0.25, 0.5, 1, 2, 5, 10]),      // Net Worth Ratio
    scoreLower(dR, [3, 2, 1.5, 1, 0.5, 0.25, 0.01, 0]),       // Debt Ratio
    scoreHigher(sR, [0, 1, 6, 11, 16, 21, 31, 50]),            // Savings Rate %
    scoreHigher(eM, [0, 0.5, 1, 2, 4, 7, 13, 24]),             // Emergency Months
    scoreHigher(rR, [0, rthr[1], rthr[2], rthr[3], rthr[4], rthr[5], rthr[6], rthr[7]]), // Retirement
    scoreHigher(fi, [0, 0.01, 0.06, 0.11, 0.26, 0.51, 1.0, 2.0]), // FI Ratio
    scoreLower(dp, [40, 30, 25, 20, 15, 10, 5, 0]),            // Disc %
    fd.creditScore,                                              // Credit Score (direct)
  ];

  return {
    scores,
    computed: { netWorth: nw, savingsRate: sR, emergencyMonths: eM, fiRatio: fi, discPct: dp },
  };
}
