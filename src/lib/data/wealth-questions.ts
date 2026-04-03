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
    id: 1, name: 'Active Income',
    hook: 'Your primary earned income is the foundation of everything. Knowing it precisely \u2014 and actively growing it \u2014 is the starting point of financial health.',
    drives: 'Net Worth, FI Ratio',
    options: [
      { score: 1, text: 'I don\'t track my income or know my exact take-home' },
      { score: 2, text: 'I know roughly what I earn but don\'t track it consistently' },
      { score: 3, text: 'I know my exact take-home and track it monthly' },
      { score: 4, text: 'I know my exact income, track it monthly, and actively work to grow it' },
    ],
  },
  {
    id: 2, name: 'Passive Income',
    hook: 'Income that works without your time \u2014 investments, rentals, dividends. Building passive income is the bridge from earning to financial freedom.',
    drives: 'Net Worth, FI Ratio, Retirement Pot',
    options: [
      { score: 1, text: 'I have no passive income sources' },
      { score: 2, text: 'I have one small passive income source but it is inconsistent' },
      { score: 3, text: 'I have passive income that I track monthly' },
      { score: 4, text: 'I have multiple passive income streams that I actively grow' },
    ],
  },
  {
    id: 3, name: 'Expenses',
    hook: 'Without visibility of your total monthly outgoings, nothing else works. Knowing exactly what you spend is the foundation of every financial decision.',
    drives: 'Savings Capacity, FI Ratio, Lifestyle Creep',
    options: [
      { score: 1, text: 'I don\'t track my expenses and often don\'t know where my money goes' },
      { score: 2, text: 'I have a rough idea but don\'t track consistently' },
      { score: 3, text: 'I track my total expenses monthly and know exactly what I spend' },
      { score: 4, text: 'I track expenses monthly, review them regularly, and actively reduce where possible' },
    ],
  },
  {
    id: 4, name: 'Discretionary',
    hook: 'Non-essential spending \u2014 dining, subscriptions, lifestyle. This is where most financial leakage happens and where lifestyle creep first takes hold.',
    drives: 'Savings Capacity, Lifestyle Creep',
    options: [
      { score: 1, text: 'I spend freely on non-essentials with no tracking or limits' },
      { score: 2, text: 'I am aware of my discretionary spending but often overspend' },
      { score: 3, text: 'I track discretionary spending and mostly stick to a limit' },
      { score: 4, text: 'I consistently control discretionary spending and review it monthly' },
    ],
  },
  {
    id: 5, name: 'Savings',
    hook: 'The gap between income and spending. Even a small consistent savings rate compounds significantly over time.',
    drives: 'Emergency Fund, Net Worth',
    options: [
      { score: 1, text: 'I rarely or never save \u2014 money runs out before the month ends' },
      { score: 2, text: 'I save occasionally when there is money left over' },
      { score: 3, text: 'I save a fixed amount each month but not always consistently' },
      { score: 4, text: 'I save a fixed amount every month by paying myself first before spending' },
    ],
  },
  {
    id: 6, name: 'Debt Repayment',
    hook: 'Debt costs you money every month. Tracking repayment keeps it front of mind and accelerates your path to a clean financial position.',
    drives: 'Debt Level, Net Worth, Credit Score',
    options: [
      { score: 1, text: 'I only make minimum payments and have no repayment plan' },
      { score: 2, text: 'I pay more than the minimum occasionally but have no clear plan' },
      { score: 3, text: 'I have a repayment plan and stick to it most months' },
      { score: 4, text: 'I have a clear plan, overpay consistently, and track my debt monthly' },
    ],
  },
  {
    id: 7, name: 'Retirement',
    hook: 'Time is your biggest asset. Monthly contributions to your pension compound significantly over decades. Every month you delay costs more than you think.',
    drives: 'Retirement Pot',
    options: [
      { score: 1, text: 'I make no pension or retirement contributions' },
      { score: 2, text: 'I contribute to a pension but have not reviewed it in over a year' },
      { score: 3, text: 'I contribute monthly and know roughly what my pot is worth' },
      { score: 4, text: 'I contribute monthly, review my pot regularly, and increase contributions when possible' },
    ],
  },
  {
    id: 8, name: 'Investment',
    hook: 'Capital deployed into assets that grow \u2014 stocks, funds, property. Tracking monthly investment builds the habit of making money work for you.',
    drives: 'Net Worth, FI Ratio',
    options: [
      { score: 1, text: 'I make no investments outside of a pension' },
      { score: 2, text: 'I have invested occasionally but have no consistent strategy' },
      { score: 3, text: 'I invest monthly with a clear strategy' },
      { score: 4, text: 'I invest monthly, diversify across assets, and review my portfolio quarterly' },
    ],
  },
];
