// Health scoring — v2 behaviour model.
// Check-ins are behaviour-only; indicator values are tracked separately on the
// Trends page. The threshold tables here are used only when an indicator score
// is computed client-side.

export const BLABELS = ['Sleep', 'Smoking', 'Strength', 'Sweat', 'Sugar', 'Salt', 'Spirits', 'Stress'] as const;

// New 8 health indicators (Trends, in display order).
export const HLABELS = [
  'Blood Pressure',
  'Weight',
  'Push-ups',
  'Resting HR',
  'Body Fat',
  'Sleep Quality',
  'Blood Sugar',
  'Wellbeing Score',
] as const;

export const HUNITS = ['mmHg', 'kg', 'reps', 'bpm', '%', '/10', 'mmol/L', '/10'] as const;

// Health thresholds (1-8 scoring), gender-specific where applicable.
// Order matches HLABELS.
export const HT: Record<number, {
  both?: number[];
  male?: number[];
  female?: number[];
  dir: 'lower' | 'higher';
}> = {
  0: { both: [180, 160, 140, 130, 120, 115, 110, 0], dir: 'lower' },                                       // Blood Pressure (systolic)
  1: { male: [120, 110, 100, 90, 85, 80, 75, 70], female: [100, 90, 85, 80, 75, 70, 65, 60], dir: 'lower' }, // Weight (kg) — rough default
  2: { male: [0, 5, 10, 15, 20, 30, 50, 100], female: [0, 3, 6, 10, 15, 20, 35, 60], dir: 'higher' },        // Push-ups (max reps)
  3: { both: [100, 90, 80, 70, 65, 60, 55, 50], dir: 'lower' },                                           // Resting HR
  4: { male: [40, 35, 30, 25, 21, 18, 15, 10], female: [50, 43, 36, 31, 26, 22, 18, 14], dir: 'lower' },   // Body Fat %
  5: { both: [2, 3, 4, 5, 6, 7, 8, 9], dir: 'higher' },                                                   // Sleep Quality /10
  6: { both: [11.1, 7.8, 7.0, 6.1, 5.6, 5.1, 4.5, 4.0], dir: 'lower' },                                    // Blood Sugar mmol/L
  7: { both: [2, 3, 4, 5, 6, 7, 8, 9], dir: 'higher' },                                                   // Wellbeing Score /10
};

// Weighted importance of each indicator for octagon composite.
export const HWEIGHTS = [0.20, 0.10, 0.10, 0.15, 0.15, 0.10, 0.15, 0.05];

// Behaviour-to-indicator mapping — which behaviours most influence each indicator.
// Key = indicator index, value = array of behaviour indices that drive it.
export const BMAP: Record<number, number[]> = {
  0: [1, 5, 6, 7],     // Blood Pressure <- Smoking, Salt, Spirits, Stress
  1: [2, 3, 4],        // Weight         <- Strength, Sweat, Sugar
  2: [2],              // Push-ups       <- Strength
  3: [0, 1, 3, 7],     // Resting HR     <- Sleep, Smoking, Sweat, Stress
  4: [2, 3, 4],        // Body Fat       <- Strength, Sweat, Sugar
  5: [0, 6, 7],        // Sleep Quality  <- Sleep, Spirits, Stress
  6: [4, 3],           // Blood Sugar    <- Sugar, Sweat
  7: [0, 2, 3, 7],     // Wellbeing      <- Sleep, Strength, Sweat, Stress
};

function getThresholds(indicatorIndex: number, gender: string): number[] {
  const t = HT[indicatorIndex];
  return t.both ? t.both : (gender === 'female' ? t.female! : t.male!);
}

/** Calculate indicator score (1-8) from a raw value. */
export function calcH(indicatorIndex: number, value: number, gender: string): number {
  const t = getThresholds(indicatorIndex, gender);
  const dir = HT[indicatorIndex].dir;

  if (dir === 'lower') {
    if (value >= t[0]) return 1;
    if (value >= t[1]) return 2;
    if (value >= t[2]) return 3;
    if (value >= t[3]) return 4;
    if (value >= t[4]) return 5;
    if (value >= t[5]) return 6;
    if (value >= t[6]) return 7;
    return 8;
  } else {
    if (value >= t[7]) return 8;
    if (value >= t[6]) return 7;
    if (value >= t[5]) return 6;
    if (value >= t[4]) return 5;
    if (value >= t[3]) return 4;
    if (value >= t[2]) return 3;
    if (value >= t[1]) return 2;
    return 1;
  }
}
