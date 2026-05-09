/**
 * ULTM8 Goal Templates \u2014 inspiration benchmarks per indicator.
 * Tap any goal to open /trends/[indicatorKey] with the target form pre-filled.
 *
 * Some targets are derived from the user\u2019s baseline (income, expenses, height)
 * captured during onboarding. We keep them as functions of those inputs.
 */

export type GoalCategory = 'health' | 'wealth';

export interface GoalTemplate {
  category: GoalCategory;
  indicatorKey: string;        // matches keys in indicator-library.ts
  name: string;
  description: string;          // what the goal is, in plain English
  rationale: string;            // why this benchmark
  defaultDurationDays: number;  // suggested timeframe
  /**
   * Resolve the target value(s). Some goals depend on the user\u2019s baseline
   * (monthly income / expenses / height). When those are missing we return
   * `undefined` for the target and let the user pick one manually.
   */
  resolveTarget: (b: BaselineFigures) => ResolvedTarget;
}

export interface BaselineFigures {
  monthlyIncome: number | null;
  monthlyExpenses: number | null;
  heightCm: number | null;
  gender?: 'male' | 'female' | null;
}

export interface ResolvedTarget {
  value?: number;
  value2?: number;            // for dual indicators (BP)
  display: string;            // human-readable e.g. "Below 120 / 80 mmHg"
}

export const GOAL_TEMPLATES: GoalTemplate[] = [
  // ── Health ──
  {
    category: 'health',
    indicatorKey: 'bp',
    name: 'Blood pressure under 120/80',
    description: 'Optimal blood pressure range. Below 120 systolic / 80 diastolic, mmHg.',
    rationale: 'Optimal BP cuts cardiovascular risk substantially compared to the 130\u2013139 / 80\u201389 elevated range. The goal is the population target for healthy adults.',
    defaultDurationDays: 90,
    resolveTarget: () => ({ value: 120, value2: 80, display: 'Below 120 / 80 mmHg' }),
  },
  {
    category: 'health',
    indicatorKey: 'body_fat',
    name: 'Body fat 20%',
    description: 'Hit a body fat percentage of 20%.',
    rationale: 'Twenty per cent sits in the fit-to-athletic range for most adults and is a clear, single-number anchor that captures meaningful progress without chasing single-digit extremes.',
    defaultDurationDays: 180,
    resolveTarget: () => ({ value: 20, display: '20%' }),
  },

  // ── Wealth ──
  {
    category: 'wealth',
    indicatorKey: 'emergency_fund',
    name: 'Emergency fund: 6 months of expenses',
    description: '6 months of essential expenses held in accessible cash.',
    rationale: 'Six months gives meaningful resilience against income shock or unexpected costs. Below 1\u20133 months and a single bad event becomes high-interest debt.',
    defaultDurationDays: 365,
    resolveTarget: (b) => {
      if (b.monthlyExpenses == null) {
        return { display: '6 months of expenses' };
      }
      const value = Math.round(b.monthlyExpenses * 6);
      return { value, display: `${value.toLocaleString()} (6 months of expenses)` };
    },
  },
  {
    category: 'wealth',
    indicatorKey: 'net_worth',
    name: 'Net worth: 10\u00d7 income',
    description: 'Total assets minus liabilities equal to ten times your annual income.',
    rationale: '10\u00d7 annual income is a strong long-term wealth marker, often used as a retirement readiness benchmark by 60+.',
    defaultDurationDays: 365 * 5,
    resolveTarget: (b) => {
      if (b.monthlyIncome == null) {
        return { display: '10\u00d7 annual income' };
      }
      const annual = b.monthlyIncome * 12;
      const value = Math.round(annual * 10);
      return { value, display: `${value.toLocaleString()} (10\u00d7 annual income)` };
    },
  },
  {
    category: 'wealth',
    indicatorKey: 'pension_fund',
    name: 'Pension fund: 25\u00d7 expenses',
    description: 'Pension pot equal to 25\u00d7 your annual expenses (the classic 4% rule).',
    rationale: '25\u00d7 annual expenses is the level at which a 4% safe withdrawal rate covers your costs indefinitely. The historical anchor of financial independence.',
    defaultDurationDays: 365 * 5,
    resolveTarget: (b) => {
      if (b.monthlyExpenses == null) {
        return { display: '25\u00d7 annual expenses' };
      }
      const annual = b.monthlyExpenses * 12;
      const value = Math.round(annual * 25);
      return { value, display: `${value.toLocaleString()} (25\u00d7 annual expenses)` };
    },
  },
  {
    category: 'wealth',
    indicatorKey: 'fi_ratio',
    name: 'FI ratio: 1.0',
    description: 'Passive income covers 100% of monthly expenses.',
    rationale: 'At 1.0 your investments alone cover your costs \u2014 work becomes optional. The single most useful number for tracking progress to financial independence.',
    defaultDurationDays: 365 * 5,
    resolveTarget: () => ({ value: 100, display: '100% (passive covers expenses)' }),
  },
];
