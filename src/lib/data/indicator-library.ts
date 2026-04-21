/**
 * Indicator library — the full list of indicators a user can track on the Trends page.
 * Users "start tracking" an indicator simply by logging their first reading for it.
 */

export interface IndicatorDef {
  key: string;
  category: 'health' | 'wealth';
  label: string;
  unit: string;                    // display unit, or 'currency' for money (uses profile currency)
  dual?: boolean;                  // true = takes two values (e.g., BP systolic/diastolic)
  dualUnit?: string;               // label for the second value
  decimals?: number;               // display precision
  higherIsBetter?: boolean;        // true for things where up = good (weight gain for muscle, etc.)
  hint?: string;                   // placeholder / help text
}

export const INDICATOR_LIBRARY: IndicatorDef[] = [
  // ── Health ──
  { key: 'bp',             category: 'health', label: 'Blood Pressure', unit: 'mmHg',   dual: true, higherIsBetter: false, hint: 'Systolic / Diastolic' },
  { key: 'weight',         category: 'health', label: 'Weight',         unit: 'kg',     decimals: 1, higherIsBetter: false },
  { key: 'body_fat',       category: 'health', label: 'Body Fat',       unit: '%',      decimals: 1, higherIsBetter: false },
  { key: 'muscle_mass',    category: 'health', label: 'Muscle Mass',    unit: '%',      decimals: 1, higherIsBetter: true },
  { key: 'waistline',      category: 'health', label: 'Waistline',      unit: 'in',     decimals: 1, higherIsBetter: false },
  { key: 'resting_hr',     category: 'health', label: 'Resting HR',     unit: 'bpm',    higherIsBetter: false },
  { key: 'pushups',        category: 'health', label: 'Push-ups max',   unit: 'reps',   higherIsBetter: true },
  { key: '5km_time',       category: 'health', label: '5km Time',       unit: 'mins',   decimals: 1, higherIsBetter: false },
  { key: 'sleep_hours',    category: 'health', label: 'Sleep Hours',    unit: 'hrs',    decimals: 1, higherIsBetter: true },
  { key: 'cholesterol',    category: 'health', label: 'Cholesterol',    unit: 'mmol/L', decimals: 2, higherIsBetter: false },
  { key: 'blood_sugar',    category: 'health', label: 'Blood Sugar',    unit: 'mmol/L', decimals: 2, higherIsBetter: false },

  // ── Wealth ──
  { key: 'net_worth',        category: 'wealth', label: 'Net Worth',        unit: 'currency', higherIsBetter: true },
  { key: 'monthly_income',   category: 'wealth', label: 'Monthly Income',   unit: 'currency', higherIsBetter: true },
  { key: 'passive_income',   category: 'wealth', label: 'Passive Income',   unit: 'currency', higherIsBetter: true },
  { key: 'monthly_expenses', category: 'wealth', label: 'Monthly Expenses', unit: 'currency', higherIsBetter: false },
  { key: 'monthly_savings',  category: 'wealth', label: 'Monthly Savings',  unit: 'currency', higherIsBetter: true },
  { key: 'discretionary',    category: 'wealth', label: 'Discretionary',    unit: 'currency', higherIsBetter: false },
  { key: 'total_debt',       category: 'wealth', label: 'Total Debt',       unit: 'currency', higherIsBetter: false },
  { key: 'emergency_fund',   category: 'wealth', label: 'Emergency Fund',   unit: 'currency', higherIsBetter: true },
  { key: 'pension',          category: 'wealth', label: 'Pension',          unit: 'currency', higherIsBetter: true },
  { key: 'investments',      category: 'wealth', label: 'Investments',      unit: 'currency', higherIsBetter: true },
  { key: 'credit_score',     category: 'wealth', label: 'Credit Score',     unit: '',         higherIsBetter: true },
];

export function getIndicatorDef(key: string): IndicatorDef | undefined {
  return INDICATOR_LIBRARY.find(i => i.key === key);
}

/** Format a reading for display. */
export function formatIndicatorValue(
  def: IndicatorDef | undefined,
  value: number,
  value2: number | null,
  currency: string = '£'
): string {
  if (!def) return String(value);

  const decimals = def.decimals ?? 0;
  const formatted = (v: number) => {
    if (def.unit === 'currency') {
      return `${currency}${Math.round(v).toLocaleString()}`;
    }
    return decimals > 0 ? v.toFixed(decimals) : Math.round(v).toString();
  };

  if (def.dual && value2 != null) {
    return `${formatted(value)}/${formatted(value2)} ${def.unit}`;
  }

  if (def.unit === 'currency') {
    return formatted(value);
  }
  if (def.unit === '') {
    return formatted(value);
  }
  return `${formatted(value)} ${def.unit}`;
}
