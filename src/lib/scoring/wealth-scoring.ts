// Wealth scoring — aligned with the ULTM8 Challenge.
// Behaviour + indicator scores are -1 / 0 / +1 / +2; pct conversion lives in shared.ts.

export const WBLABELS = [
  'Active Income',
  'Passive Income',
  'Expenses',
  'Discretionary',
  'Savings',
  'Debt Repayment',
  'Retirement',
  'Investment',
] as const;

export const WHLABELS = [
  'Net Income',
  'Discretionary Spend',
  'Emergency Fund',
  'Debt Level',
  'Net Worth',
  'Pension Fund',
  'Passive Income',
  'FI Ratio',
] as const;

// Equal weights — the file treats all 8 indicators equally for the composite.
export const WHWEIGHTS = [0.125, 0.125, 0.125, 0.125, 0.125, 0.125, 0.125, 0.125];

// Behaviour-to-indicator mapping (which behaviours most influence each indicator).
// Behaviour indices: 0 Active Income, 1 Passive Income, 2 Expenses, 3 Discretionary,
//                    4 Savings, 5 Debt Repayment, 6 Retirement, 7 Investment.
export const WBMAP: Record<number, number[]> = {
  0: [0],            // Net Income          <- Active Income
  1: [3, 2],         // Discretionary Spend <- Discretionary, Expenses
  2: [4, 2],         // Emergency Fund      <- Savings, Expenses
  3: [5],            // Debt Level          <- Debt Repayment
  4: [0, 4, 5, 7],   // Net Worth           <- Active Income, Savings, Debt Repayment, Investment
  5: [6, 7],         // Pension Fund        <- Retirement, Investment
  6: [1, 7],         // Passive Income      <- Passive Income, Investment
  7: [1, 7, 2],      // FI Ratio            <- Passive Income, Investment, Expenses
};
