// Wealth scoring — v2 behaviour model.
// Check-ins are behaviour-only; indicator values are tracked separately on the
// Trends page. computeWealthScores is retained as a utility for deriving
// indicator scores from ad-hoc financial figures (e.g. on Profile) but it is
// not part of the monthly check-in flow.

export const WBLABELS = [
  'Income',
  'Spending',
  'Saving',
  'Debt',
  'Investments',
  'Pension',
  'Protection',
  'Tax',
] as const;

export const WHLABELS = [
  'Net Income',
  'Discretionary Spend',
  'Emergency Fund',
  'Debt Level',
  'Net Worth',
  'Pension Fund',
  'FI Ratio',
  'Passive Income',
] as const;

// Weighted importance of each indicator for octagon composite.
export const WHWEIGHTS = [0.15, 0.10, 0.10, 0.10, 0.20, 0.15, 0.10, 0.10];

// Behaviour-to-indicator mapping.
// Key = indicator index, value = behaviour indices that drive it.
export const WBMAP: Record<number, number[]> = {
  0: [0, 7],         // Net Income          <- Income, Tax
  1: [1],            // Discretionary Spend <- Spending
  2: [2],            // Emergency Fund      <- Saving
  3: [3],            // Debt Level          <- Debt
  4: [0, 2, 3, 4],   // Net Worth           <- Income, Saving, Debt, Investments
  5: [5, 7],         // Pension Fund        <- Pension, Tax
  6: [4, 5, 2],      // FI Ratio            <- Investments, Pension, Saving
  7: [4, 6],         // Passive Income      <- Investments, Protection
};

// Pension fund thresholds (years of annual income), age-specific.
const PENSION_THRESHOLDS: Record<string, number[]> = {
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
  netIncome: number;       // monthly take-home (after tax)
  passive: number;         // monthly passive income
  expenses: number;        // monthly total expenses
  discretionary: number;   // monthly discretionary spend
  savings: number;         // monthly savings amount
  savingsTotal: number;    // total liquid savings + investments
  pension: number;         // total pension pot
  debt: number;            // total "bad" debt (non-mortgage)
}

export interface WealthScoreResult {
  scores: number[];
  computed: {
    netWorth: number;
    fiRatio: number;
    discPct: number;
    emergencyMonths: number;
  };
}

/** Derive the 8 indicator scores from a snapshot of financial data. */
export function computeWealthScores(fd: FinancialData, ageGroup: string): WealthScoreResult {
  const ann = fd.netIncome * 12;
  const nw = fd.savingsTotal + fd.pension - fd.debt;
  const nwR = ann > 0 ? nw / ann : 0;
  const dR = ann > 0 ? fd.debt / ann : 0;
  const eM = fd.expenses > 0 ? fd.savingsTotal / fd.expenses : 0;
  const fi = fd.expenses > 0 ? fd.passive / fd.expenses : 0;
  const dp = fd.netIncome > 0 ? (fd.discretionary / fd.netIncome) * 100 : 100;

  const pthr = PENSION_THRESHOLDS[ageGroup] || PENSION_THRESHOLDS['30-44'];
  const pR = ann > 0 ? fd.pension / ann : 0;

  const scores = [
    scoreHigher(fd.netIncome, [0, 1500, 2500, 3500, 5000, 7500, 10000, 15000]),         // Net Income (monthly £)
    scoreLower(dp,            [40, 30, 25, 20, 15, 10, 5, 0]),                           // Discretionary spend %
    scoreHigher(eM,           [0, 0.5, 1, 2, 4, 7, 13, 24]),                             // Emergency months
    scoreLower(dR,            [3, 2, 1.5, 1, 0.5, 0.25, 0.01, 0]),                       // Debt to annual income
    scoreHigher(nwR,          [-99, 0, 0.25, 0.5, 1, 2, 5, 10]),                         // Net Worth ratio
    scoreHigher(pR,           [0, pthr[1], pthr[2], pthr[3], pthr[4], pthr[5], pthr[6], pthr[7]]), // Pension Fund
    scoreHigher(fi,           [0, 0.01, 0.06, 0.11, 0.26, 0.51, 1.0, 2.0]),              // FI Ratio
    scoreHigher(fd.passive,   [0, 50, 150, 300, 600, 1200, 2500, 5000]),                 // Passive Income (monthly £)
  ];

  return {
    scores,
    computed: { netWorth: nw, fiRatio: fi, discPct: dp, emergencyMonths: eM },
  };
}
