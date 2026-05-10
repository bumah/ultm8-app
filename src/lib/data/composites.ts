/**
 * Composite axes \u2014 maps the 8 behaviours + 8 indicators per category onto
 * 4 composite pillars per category (8 pillars across health + wealth in total).
 *
 * Octagon axes are computed from INDICATORS only (where they exist) \u2014 they
 * represent "where you are right now". Habit grades are computed from
 * BEHAVIOURS only \u2014 they represent "what you\u2019re doing about it". The two
 * are surfaced side-by-side rather than blended.
 */

/* ── Indices into BLABELS / WBLABELS / HLABELS / WHLABELS ──
 *
 *  BLABELS   : 0 Sleep   1 Smoking  2 Strength  3 Sweat  4 Sugar  5 Salt  6 Spirits  7 Stress
 *  HLABELS   : 0 Blood Pressure  1 Weight  2 Push-ups  3 Resting HR  4 Body Fat
 *              5 Sleep Quality   6 Blood Sugar  7 Wellbeing Score
 *  WBLABELS  : 0 Active Income  1 Passive Income  2 Expenses  3 Discretionary
 *              4 Savings        5 Debt Repayment  6 Retirement   7 Investment
 *  WHLABELS  : 0 Net Income     1 Discretionary Spend  2 Emergency Fund  3 Debt Level
 *              4 Net Worth      5 Pension Fund        6 Passive Income  7 FI Ratio
 */

export type HealthAxisKey = 'mind' | 'strength' | 'fitness' | 'heart';
export type WealthAxisKey = 'cashflow' | 'assets' | 'debt' | 'retirement';

export interface AxisDef<K extends string> {
  key: K;
  label: string;
  behaviourIndices: number[];
  indicatorIndices: number[];
}

export const HEALTH_AXES: AxisDef<HealthAxisKey>[] = [
  { key: 'mind',     label: 'Mind',     behaviourIndices: [0, 7],       indicatorIndices: [5, 7] },
  { key: 'strength', label: 'Strength', behaviourIndices: [2],          indicatorIndices: [2] },
  { key: 'fitness',  label: 'Fitness',  behaviourIndices: [3],          indicatorIndices: [3] },
  { key: 'heart',    label: 'Heart',    behaviourIndices: [1, 4, 5, 6], indicatorIndices: [0, 1, 4, 6] },
];

export const WEALTH_AXES: AxisDef<WealthAxisKey>[] = [
  { key: 'cashflow',   label: 'Cashflow',   behaviourIndices: [0, 2, 3], indicatorIndices: [0, 1] },
  { key: 'assets',     label: 'Assets',     behaviourIndices: [4, 7],    indicatorIndices: [2, 4] },
  { key: 'debt',       label: 'Debt',       behaviourIndices: [5],       indicatorIndices: [3] },
  { key: 'retirement', label: 'Retirement', behaviourIndices: [1, 6],    indicatorIndices: [5, 6, 7] },
];

/* ── Aggregation helpers ── */

/** Convert a sum of -1/0/1/2 scores across n items to 0..100. */
export function pctFromSigned(scores: number[]): number | null {
  if (scores.length === 0) return null;
  const n = scores.length;
  const sum = scores.reduce((a, b) => a + b, 0);
  const pct = ((sum + n) / (3 * n)) * 100;
  return Math.max(0, Math.min(100, Math.round(pct)));
}

/** Average signed score across items, for trajectory arrows. */
export function signedAvg(scores: number[]): number {
  if (scores.length === 0) return 0;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

/** A,B,C grade from a 0..100 percentage. */
export function habitGrade(pct: number | null): 'A+' | 'A' | 'B' | 'C' | '\u2014' {
  if (pct == null) return '\u2014';
  if (pct >= 80) return 'A+';
  if (pct >= 60) return 'A';
  if (pct >= 40) return 'B';
  return 'C';
}

/** Trajectory arrow from average behaviour score (-1..+2). */
export function trajectoryArrow(avg: number): '\u2191\u2191' | '\u2191' | '\u2192' | '\u2193' | '\u2193\u2193' {
  if (avg >= 1.5)  return '\u2191\u2191';
  if (avg >= 0.5)  return '\u2191';
  if (avg >= -0.5) return '\u2192';
  if (avg >= -1.0) return '\u2193';
  return '\u2193\u2193';
}

/** Tier color for a habit grade pct. Reuses the orange/cream palette. */
export function gradeColor(pct: number | null): string {
  if (pct == null) return 'var(--text-muted)';
  if (pct >= 80) return '#F8F6F1'; // cream  (Ultimate)
  if (pct >= 60) return '#FFB783'; // soft orange (Strong)
  if (pct >= 40) return '#F08A47'; // orange (Getting there)
  return '#FF9A4D';                 // bright orange (Needs improvement)
}

/* ── Per-axis bundle, ready for the UI ── */
export interface AxisResult {
  key: string;
  label: string;
  /** Octagon value (indicator-led). null if axis has no indicators. */
  indicatorPct: number | null;
  /** Behaviour-derived percent for the habit grade. */
  habitPct: number | null;
  /** Average signed behaviour score for the trajectory arrow. */
  habitAvg: number;
  /** Habit grade letter. */
  grade: 'A+' | 'A' | 'B' | 'C' | '\u2014';
  /** Tier colour for the grade. */
  color: string;
  /** Trajectory arrow string. */
  trajectory: ReturnType<typeof trajectoryArrow>;
}

export function buildAxis<K extends string>(
  def: AxisDef<K>,
  behaviourScores: number[],
  indicatorScores: number[],
): AxisResult {
  const bs = def.behaviourIndices.map(i => behaviourScores[i] ?? 0);
  const is = def.indicatorIndices.map(i => indicatorScores[i] ?? 0);

  const indicatorPct = is.length > 0 ? pctFromSigned(is) : null;
  const habitPct = bs.length > 0 ? pctFromSigned(bs) : null;
  const habitAvg = signedAvg(bs);

  return {
    key: def.key,
    label: def.label,
    indicatorPct,
    habitPct,
    habitAvg,
    grade: habitGrade(habitPct),
    color: gradeColor(habitPct),
    trajectory: trajectoryArrow(habitAvg),
  };
}

/** Build all 4 health axes. */
export function buildHealthAxes(b: number[], i: number[]): AxisResult[] {
  return HEALTH_AXES.map(def => buildAxis(def, b, i));
}

/** Build all 4 wealth axes. */
export function buildWealthAxes(b: number[], i: number[]): AxisResult[] {
  return WEALTH_AXES.map(def => buildAxis(def, b, i));
}

/** Average the indicator pcts across an axis set; used for the composite Health/Wealth %. */
export function avgIndicatorPct(axes: AxisResult[]): number {
  const vals = axes.map(a => a.indicatorPct).filter((v): v is number => v != null);
  if (vals.length === 0) return 0;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

/** Project axisPct onto octagon ring values 1..8 for the existing OctagonChart. */
export function axisPctToRing(pct: number | null): number {
  if (pct == null) return 1;
  return Math.max(1, Math.min(8, Math.round((pct / 100) * 8)));
}
