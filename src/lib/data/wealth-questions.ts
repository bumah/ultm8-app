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

export const WEALTH_QUESTIONS: BehaviourQuestion[] = [
  {
    id: 1, name: 'Income',
    hook: 'Your earned income sets the ceiling for everything else. Knowing it precisely — and actively growing it — is the starting point of financial health.',
    drives: 'Net Income, Net Worth',
    options: [
      { score: 1, text: 'I don\u2019t track my income or know my exact take-home' },
      { score: 2, text: 'I know roughly what I earn but don\u2019t track it consistently' },
      { score: 3, text: 'I know my exact take-home and track it monthly' },
      { score: 4, text: 'I know my exact income, track it monthly, and actively work to grow it' },
    ],
  },
  {
    id: 2, name: 'Spending',
    hook: 'Spending outside your planned budget is where most financial leakage happens. Keeping discretionary spend in check protects everything below it.',
    drives: 'Discretionary Spend',
    options: [
      { score: 1, text: 'I spend freely with no plan and often overshoot' },
      { score: 2, text: 'I have a rough sense of my budget but often exceed it' },
      { score: 3, text: 'I follow a monthly budget most of the time' },
      { score: 4, text: 'I review spending monthly and rarely go outside my planned budget' },
    ],
  },
  {
    id: 3, name: 'Saving',
    hook: 'The gap between income and spending compounds over time. A consistent savings rate \u2014 paid first \u2014 builds your cushion and your net worth.',
    drives: 'Emergency Fund, Net Worth',
    options: [
      { score: 1, text: 'I rarely or never save \u2014 money runs out before the month ends' },
      { score: 2, text: 'I save occasionally when there\u2019s money left over' },
      { score: 3, text: 'I save a fixed amount each month but not always consistently' },
      { score: 4, text: 'I pay myself first every month before any discretionary spend' },
    ],
  },
  {
    id: 4, name: 'Debt',
    hook: 'Bad debt costs you money every month and drags on net worth. Tracking repayment and avoiding new bad debt accelerates your path to freedom.',
    drives: 'Debt Level, Net Worth',
    options: [
      { score: 1, text: 'I only make minimum payments and have no repayment plan' },
      { score: 2, text: 'I pay more than the minimum occasionally but have no clear plan' },
      { score: 3, text: 'I have a repayment plan and stick to it most months' },
      { score: 4, text: 'I have a clear plan, overpay consistently, and track my debt monthly' },
    ],
  },
  {
    id: 5, name: 'Investments',
    hook: 'Capital deployed into assets that grow \u2014 equities, funds, property. Consistent investing turns income into income-producing assets.',
    drives: 'Net Worth, FI Ratio, Passive Income',
    options: [
      { score: 1, text: 'I make no investments outside of a workplace pension' },
      { score: 2, text: 'I\u2019ve invested occasionally but have no consistent strategy' },
      { score: 3, text: 'I invest monthly with a clear strategy' },
      { score: 4, text: 'I invest monthly, diversify across assets, and review my portfolio quarterly' },
    ],
  },
  {
    id: 6, name: 'Pension',
    hook: 'Time is your biggest asset. Monthly contributions compound for decades. Every month you delay costs more than you think.',
    drives: 'Pension Fund',
    options: [
      { score: 1, text: 'I make no pension contributions' },
      { score: 2, text: 'I contribute to a pension but haven\u2019t reviewed it in over a year' },
      { score: 3, text: 'I contribute monthly and know roughly what my pot is worth' },
      { score: 4, text: 'I contribute monthly, review my pot regularly, and increase contributions when possible' },
    ],
  },
  {
    id: 7, name: 'Protection',
    hook: 'Insurance \u2014 life, income protection, critical illness, health \u2014 is the safety net that stops a single bad event from wiping out years of progress.',
    drives: 'Passive Income',
    options: [
      { score: 1, text: 'I have no protection in place' },
      { score: 2, text: 'I have some cover but haven\u2019t reviewed it in years' },
      { score: 3, text: 'I have life and income protection and review them annually' },
      { score: 4, text: 'I have comprehensive cover (life, income, critical illness, health) and review it annually' },
    ],
  },
  {
    id: 8, name: 'Tax',
    hook: 'Tax efficiency keeps more of what you earn. Using allowances \u2014 ISAs, pension, gift \u2014 compounds into meaningful extra net worth over time.',
    drives: 'Net Income, Pension Fund',
    options: [
      { score: 1, text: 'I don\u2019t use any tax-advantaged accounts or allowances' },
      { score: 2, text: 'I use one tax-advantaged account but not consistently' },
      { score: 3, text: 'I use my ISA or pension allowance most years' },
      { score: 4, text: 'I fully use my ISA, pension and other allowances every tax year' },
    ],
  },
];
