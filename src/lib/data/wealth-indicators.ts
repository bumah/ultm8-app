export interface FinancialInput {
  id: string;
  label: string;
  placeholder: string;
  hint?: string;
}

export interface FinancialScreen {
  title: string;
  subtitle: string;
  inputs: FinancialInput[];
}

export const FINANCIAL_SCREENS: FinancialScreen[] = [
  {
    title: 'Monthly Income',
    subtitle: 'Your regular monthly income sources.',
    inputs: [
      { id: 'income', label: 'Monthly take-home income', placeholder: 'e.g. 3000', hint: 'Net after tax' },
      { id: 'passive', label: 'Monthly passive income', placeholder: 'e.g. 200', hint: 'Investments, rentals, dividends' },
    ],
  },
  {
    title: 'Monthly Money Flow',
    subtitle: 'How your money moves each month.',
    inputs: [
      { id: 'expenses', label: 'Monthly total expenses', placeholder: 'e.g. 2200', hint: 'Everything you spend' },
      { id: 'discretionary', label: 'Monthly discretionary spend', placeholder: 'e.g. 400', hint: 'Non-essentials only' },
      { id: 'savings', label: 'Monthly savings amount', placeholder: 'e.g. 300', hint: 'What you put aside' },
    ],
  },
  {
    title: 'Financial Position',
    subtitle: 'Your current financial standing.',
    inputs: [
      { id: 'savingsTotal', label: 'Total savings & investments', placeholder: 'e.g. 15000', hint: 'Excluding pension' },
      { id: 'pension', label: 'Total pension / retirement value', placeholder: 'e.g. 25000' },
      { id: 'debt', label: 'Total outstanding debt', placeholder: 'e.g. 5000', hint: 'Loans, credit cards, overdraft (excl. mortgage)' },
    ],
  },
];

export const CREDIT_SCORE_OPTIONS = [
  { score: 1, label: 'Very poor' },
  { score: 2, label: 'Poor' },
  { score: 3, label: 'Fair' },
  { score: 4, label: 'Good' },
  { score: 5, label: 'Very good' },
  { score: 6, label: 'Excellent' },
  { score: 7, label: 'Exceptional' },
  { score: 8, label: 'Perfect / Maximum score' },
];
