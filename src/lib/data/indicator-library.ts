/**
 * Indicator library — the 16 indicators a user can track on the Trends page.
 * Users "start tracking" an indicator simply by logging their first reading.
 *
 * Aligned with the v2 model: 8 health indicators + 8 wealth indicators.
 */

export interface IndicatorDef {
  key: string;
  category: 'health' | 'wealth';
  label: string;
  unit: string;                    // display unit, or 'currency' for money (uses profile currency)
  dual?: boolean;                  // true = takes two values (e.g., BP systolic/diastolic)
  dualUnit?: string;               // label for the second value
  decimals?: number;               // display precision
  higherIsBetter?: boolean;        // true when up = good
  hint?: string;                   // placeholder / help text
}

export const INDICATOR_LIBRARY: IndicatorDef[] = [
  // ── Health ──
  { key: 'bp',             category: 'health', label: 'Blood Pressure',  unit: 'mmHg',   dual: true, higherIsBetter: false, hint: 'Systolic / Diastolic' },
  { key: 'weight',         category: 'health', label: 'Weight',          unit: 'kg',     decimals: 1, higherIsBetter: false },
  { key: 'pushups',        category: 'health', label: 'Push-ups',        unit: 'reps',                higherIsBetter: true,  hint: 'Max reps before failing' },
  { key: 'resting_hr',     category: 'health', label: 'Resting HR',      unit: 'bpm',    higherIsBetter: false },
  { key: 'body_fat',       category: 'health', label: 'Body Fat',        unit: '%',      decimals: 1, higherIsBetter: false },
  { key: 'sleep_quality',  category: 'health', label: 'Sleep Quality',   unit: '/10',    higherIsBetter: true, hint: '1\u201310 from your wearable' },
  { key: 'blood_sugar',    category: 'health', label: 'Blood Sugar',     unit: 'mmol/L', decimals: 2, higherIsBetter: false },
  { key: 'wellbeing',      category: 'health', label: 'Wellbeing Score', unit: '/10',    higherIsBetter: true, hint: '1\u201310, how you feel overall' },

  // ── Wealth ──
  { key: 'net_income',          category: 'wealth', label: 'Net Income',          unit: 'currency', higherIsBetter: true,  hint: 'Monthly take-home after tax' },
  { key: 'discretionary_spend', category: 'wealth', label: 'Discretionary Spend', unit: 'currency', higherIsBetter: false, hint: 'Non-essential monthly spend' },
  { key: 'emergency_fund',      category: 'wealth', label: 'Emergency Fund',      unit: 'currency', higherIsBetter: true,  hint: 'Cash set aside for emergencies' },
  { key: 'debt_level',          category: 'wealth', label: 'Debt Level',          unit: 'currency', higherIsBetter: false, hint: 'Total non-mortgage debt' },
  { key: 'net_worth',           category: 'wealth', label: 'Net Worth',           unit: 'currency', higherIsBetter: true,  hint: 'Assets minus liabilities' },
  { key: 'pension_fund',        category: 'wealth', label: 'Pension Fund',        unit: 'currency', higherIsBetter: true,  hint: 'Total pension pot value' },
  { key: 'fi_ratio',            category: 'wealth', label: 'FI Ratio',            unit: '%',        decimals: 0, higherIsBetter: true, hint: 'Passive income / expenses' },
  { key: 'passive_income',      category: 'wealth', label: 'Passive Income',      unit: 'currency', higherIsBetter: true,  hint: 'Monthly income not from work' },
];

export function getIndicatorDef(key: string): IndicatorDef | undefined {
  return INDICATOR_LIBRARY.find(i => i.key === key);
}

/** Format a reading for display. */
export function formatIndicatorValue(
  def: IndicatorDef | undefined,
  value: number,
  value2: number | null,
  currency: string = '\u00a3',
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
