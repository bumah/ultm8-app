// Verbatim from ultm8-challenge.html / data.js. Scoring scale: -1 / 0 / +1 / +2.

export interface BehaviourOption {
  score: number;
  text: string;
}

export interface BehaviourQuestion {
  id: number;
  name: string;
  hook: string;
  options: BehaviourOption[];
}

export const WEALTH_QUESTIONS: BehaviourQuestion[] = [
  {
    id: 1, name: 'Active Income',
    hook: 'Your primary earned income is the foundation of everything. Knowing it precisely \u2014 and actively growing it \u2014 is the starting point of financial health.',
    options: [
      { score: -1, text: 'I don\u2019t track my income or know my exact take-home' },
      { score: 0, text: 'I know roughly what I earn but don\u2019t track it consistently' },
      { score: 1, text: 'I know my exact take-home and track it monthly' },
      { score: 2, text: 'I know my exact income, track it monthly, and actively work to grow it' },
    ],
  },
  {
    id: 2, name: 'Passive Income',
    hook: 'Income that works without your time \u2014 investments, rentals, dividends. Building passive income is the bridge from earning to financial freedom.',
    options: [
      { score: -1, text: 'I have no passive income sources' },
      { score: 0, text: 'I have one small passive income source but it is inconsistent' },
      { score: 1, text: 'I have passive income that I track monthly' },
      { score: 2, text: 'I have multiple passive income streams that I actively grow' },
    ],
  },
  {
    id: 3, name: 'Expenses',
    hook: 'Without visibility of your total monthly outgoings, nothing else works. Knowing exactly what you spend is the foundation of every financial decision.',
    options: [
      { score: -1, text: 'I don\u2019t track my expenses and often don\u2019t know where my money goes' },
      { score: 0, text: 'I have a rough idea but don\u2019t track consistently' },
      { score: 1, text: 'I track my total expenses monthly and know exactly what I spend' },
      { score: 2, text: 'I track expenses monthly, review them regularly, and actively reduce where possible' },
    ],
  },
  {
    id: 4, name: 'Discretionary',
    hook: 'Non-essential spending \u2014 dining, subscriptions, lifestyle. This is where most financial leakage happens and where lifestyle creep first takes hold.',
    options: [
      { score: -1, text: 'I spend freely on non-essentials with no tracking or limits' },
      { score: 0, text: 'I am aware of my discretionary spending but often overspend' },
      { score: 1, text: 'I track discretionary spending and mostly stick to a limit' },
      { score: 2, text: 'I consistently control discretionary spending and review it monthly' },
    ],
  },
  {
    id: 5, name: 'Savings',
    hook: 'The gap between income and spending. Even a small consistent savings rate compounds significantly over time.',
    options: [
      { score: -1, text: 'I rarely or never save \u2014 money runs out before the month ends' },
      { score: 0, text: 'I save occasionally when there is money left over' },
      { score: 1, text: 'I save a fixed amount each month but not always consistently' },
      { score: 2, text: 'I save a fixed amount every month by paying myself first before spending' },
    ],
  },
  {
    id: 6, name: 'Debt Repayment',
    hook: 'Debt costs you money every month. Tracking repayment keeps it front of mind and accelerates your path to a clean financial position.',
    options: [
      { score: -1, text: 'I only make minimum payments and have no repayment plan' },
      { score: 0, text: 'I pay more than the minimum occasionally but have no clear plan' },
      { score: 1, text: 'I have a repayment plan and stick to it most months' },
      { score: 2, text: 'I have a clear plan, overpay consistently, and track my debt monthly' },
    ],
  },
  {
    id: 7, name: 'Retirement',
    hook: 'Time is your biggest asset. Monthly contributions to your pension compound significantly over decades. Every month you delay costs more than you think.',
    options: [
      { score: -1, text: 'I make no pension or retirement contributions' },
      { score: 0, text: 'I contribute to a pension but have not reviewed it in over a year' },
      { score: 1, text: 'I contribute monthly and know roughly what my pot is worth' },
      { score: 2, text: 'I contribute monthly, review my pot regularly, and increase contributions when possible' },
    ],
  },
  {
    id: 8, name: 'Investment',
    hook: 'Capital deployed into assets that grow \u2014 stocks, funds, property. Tracking monthly investment builds the habit of making money work for you.',
    options: [
      { score: -1, text: 'I make no investments outside of a pension' },
      { score: 0, text: 'I have invested occasionally but have no consistent strategy' },
      { score: 1, text: 'I invest monthly with a clear strategy' },
      { score: 2, text: 'I invest monthly, diversify across assets, and review my portfolio quarterly' },
    ],
  },
];

export const WEALTH_INDICATOR_QUESTIONS: BehaviourQuestion[] = [
  {
    id: 9, name: 'Net Income',
    hook: 'Your net income is the foundation. If you don\u2019t know your exact take-home, that\u2019s the first signal to fix.',
    options: [
      { score: 2, text: 'Comfortably above what I need' },
      { score: 1, text: 'Just covers it' },
      { score: -1, text: 'Below / struggling' },
      { score: 0, text: 'Don\u2019t know' },
    ],
  },
  {
    id: 10, name: 'Discretionary Spend',
    hook: 'Discretionary spending is where wealth quietly leaks. Be honest about what you spend on non-essentials.',
    options: [
      { score: 2, text: 'Tightly controlled' },
      { score: 1, text: 'Moderate' },
      { score: -1, text: 'High / often regret it' },
      { score: 0, text: 'Don\u2019t know' },
    ],
  },
  {
    id: 11, name: 'Emergency Fund',
    hook: 'An emergency fund is the buffer that lets you make calm decisions. Three months is the standard floor.',
    options: [
      { score: 2, text: '3+ months of expenses covered' },
      { score: 1, text: '1\u20133 months' },
      { score: -1, text: 'Less than a month / none' },
      { score: 0, text: 'Don\u2019t know' },
    ],
  },
  {
    id: 12, name: 'Debt Level',
    hook: 'Debt is the headwind on every other financial metric. The lower it is, the faster everything else compounds.',
    options: [
      { score: 2, text: 'Debt-free or minimal' },
      { score: 1, text: 'Manageable / on a plan' },
      { score: -1, text: 'High / hard to control' },
      { score: 0, text: 'Don\u2019t know' },
    ],
  },
  {
    id: 13, name: 'Net Worth',
    hook: 'Net worth is the headline number that tracks long-term direction. Assets minus liabilities. Honestly.',
    options: [
      { score: 2, text: 'Positive and growing' },
      { score: 1, text: 'Close to zero' },
      { score: -1, text: 'Negative (in the red)' },
      { score: 0, text: 'Don\u2019t know' },
    ],
  },
  {
    id: 14, name: 'Pension Fund',
    hook: 'Time is the biggest asset for retirement. Where you stand today, relative to your age, determines what\u2019s possible.',
    options: [
      { score: 2, text: 'On track or ahead for my age' },
      { score: 1, text: 'Behind but contributing' },
      { score: -1, text: 'Nothing or very little' },
      { score: 0, text: 'Don\u2019t know' },
    ],
  },
  {
    id: 15, name: 'Passive Income',
    hook: 'Passive income is the bridge from working for money to financial freedom. Even small amounts compound.',
    options: [
      { score: 2, text: 'Meaningful / multiple streams' },
      { score: 1, text: 'Small / just starting' },
      { score: -1, text: 'None' },
      { score: 0, text: 'Don\u2019t know' },
    ],
  },
  {
    id: 16, name: 'FI Ratio',
    hook: 'The FI ratio is passive income divided by expenses. It tells you, plainly, how close you are to choice.',
    options: [
      { score: 2, text: '50%+ covered' },
      { score: 1, text: '1\u201349% covered' },
      { score: -1, text: '0% / haven\u2019t started' },
      { score: 0, text: 'Don\u2019t know' },
    ],
  },
];
