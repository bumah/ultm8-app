export interface BehaviourOption {
  score: number;
  text: string;
}

export interface BehaviourQuestion {
  id: number;
  name: string;
  hook: string;
  drives: string;
  options: BehaviourOption[];
}

// Monthly check-in — questions look back at the last 30 days.
export const WEALTH_QUESTIONS: BehaviourQuestion[] = [
  {
    id: 1, name: 'Income',
    hook: 'Your earned income sets the ceiling for everything else. Knowing it precisely \u2014 and actively growing it \u2014 is the starting point of financial health.',
    drives: 'Net Income, Net Worth',
    options: [
      { score: 1, text: 'I didn\u2019t track my income or know my exact take-home this month' },
      { score: 2, text: 'I knew roughly what I earned but didn\u2019t track it' },
      { score: 3, text: 'I tracked my exact take-home this month' },
      { score: 4, text: 'I tracked it and took a step to grow it this month' },
    ],
  },
  {
    id: 2, name: 'Spending',
    hook: 'Spending outside your planned budget is where most financial leakage happens. Keeping discretionary spend in check protects everything below it.',
    drives: 'Discretionary Spend',
    options: [
      { score: 1, text: 'I spent freely with no plan and overshot' },
      { score: 2, text: 'I had a rough budget but exceeded it this month' },
      { score: 3, text: 'I followed my monthly budget most weeks' },
      { score: 4, text: 'I reviewed spending and stayed inside my budget' },
    ],
  },
  {
    id: 3, name: 'Saving',
    hook: 'The gap between income and spending compounds over time. A consistent savings rate \u2014 paid first \u2014 builds your cushion and your net worth.',
    drives: 'Emergency Fund, Net Worth',
    options: [
      { score: 1, text: 'I didn\u2019t save anything this month' },
      { score: 2, text: 'I saved what was left over at the end of the month' },
      { score: 3, text: 'I saved a fixed amount this month' },
      { score: 4, text: 'I paid myself first on payday before any spending' },
    ],
  },
  {
    id: 4, name: 'Debt',
    hook: 'Bad debt costs you money every month and drags on net worth. Tracking repayment and avoiding new bad debt accelerates your path to freedom.',
    drives: 'Debt Level, Net Worth',
    options: [
      { score: 1, text: 'I only made minimum payments and had no plan' },
      { score: 2, text: 'I paid more than the minimum but had no plan' },
      { score: 3, text: 'I followed my repayment plan this month' },
      { score: 4, text: 'I overpaid on my plan and tracked total debt this month' },
    ],
  },
  {
    id: 5, name: 'Investments',
    hook: 'Capital deployed into assets that grow \u2014 equities, funds, property. Consistent investing turns income into income-producing assets.',
    drives: 'Net Worth, FI Ratio, Passive Income',
    options: [
      { score: 1, text: 'I made no investments outside a workplace pension this month' },
      { score: 2, text: 'I invested ad hoc with no consistent strategy' },
      { score: 3, text: 'I invested monthly with a clear strategy' },
      { score: 4, text: 'I invested monthly and reviewed my portfolio this month' },
    ],
  },
  {
    id: 6, name: 'Pension',
    hook: 'Time is your biggest asset. Monthly contributions compound for decades. Every month you delay costs more than you think.',
    drives: 'Pension Fund',
    options: [
      { score: 1, text: 'I made no pension contribution this month' },
      { score: 2, text: 'I contributed but haven\u2019t reviewed my pot in over a year' },
      { score: 3, text: 'I contributed monthly and know roughly what my pot is worth' },
      { score: 4, text: 'I contributed and reviewed my pot this month' },
    ],
  },
  {
    id: 7, name: 'Protection',
    hook: 'Insurance \u2014 life, income protection, critical illness, health \u2014 is the safety net that stops a single bad event from wiping out years of progress.',
    drives: 'Passive Income',
    options: [
      { score: 1, text: 'I had no protection in place this month' },
      { score: 2, text: 'I had some cover but haven\u2019t reviewed it in years' },
      { score: 3, text: 'I had life and income protection in place this month' },
      { score: 4, text: 'I had comprehensive cover and reviewed it this year' },
    ],
  },
  {
    id: 8, name: 'Tax',
    hook: 'Tax efficiency keeps more of what you earn. Using allowances \u2014 ISAs, pension, gift \u2014 compounds into meaningful extra net worth over time.',
    drives: 'Net Income, Pension Fund',
    options: [
      { score: 1, text: 'I didn\u2019t use any tax-advantaged accounts this month' },
      { score: 2, text: 'I used one tax-advantaged account but inconsistently' },
      { score: 3, text: 'I contributed to my ISA or pension allowance this month' },
      { score: 4, text: 'I used my full ISA, pension and other allowances this year' },
    ],
  },
];
