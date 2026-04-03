// Health scoring engine — ported from ultm8-health-assessment.html

export const BLABELS = ['Sleep', 'Smoking', 'Strength', 'Sweat', 'Sugar', 'Salt', 'Spirits', 'Stress'] as const;
export const HLABELS = ['Blood Pressure', 'Blood Sugar', 'Cholesterol', 'Resting HR', 'Body Fat', 'Muscle Mass', 'Push-ups', '5km Run'] as const;
export const HUNITS = ['mmHg', 'mmol/L', 'mmol/L', 'bpm', '%', '%', 'reps', 'mins'] as const;

// Health thresholds — gender-specific where applicable
export const HT: Record<number, {
  both?: number[];
  male?: number[];
  female?: number[];
  dir: 'lower' | 'higher';
}> = {
  0: { both: [180, 160, 140, 130, 120, 115, 110, 0], dir: 'lower' },
  1: { both: [11.1, 7.8, 7.0, 6.1, 5.6, 5.1, 4.5, 0], dir: 'lower' },
  2: { both: [7.5, 6.5, 5.5, 5.0, 4.5, 4.0, 3.5, 0], dir: 'lower' },
  3: { both: [100, 90, 80, 70, 65, 60, 50, 0], dir: 'lower' },
  4: { male: [40, 35, 30, 25, 21, 18, 15, 0], female: [50, 43, 36, 31, 26, 22, 18, 0], dir: 'lower' },
  5: { male: [30, 32, 33, 36, 39, 42, 45, 48], female: [22, 24, 25, 28, 31, 34, 37, 40], dir: 'higher' },
  6: { male: [0, 5, 10, 15, 20, 25, 30, 40], female: [0, 3, 6, 10, 15, 20, 25, 30], dir: 'higher' },
  7: { male: [50, 45, 40, 35, 30, 27, 24, 0], female: [60, 52, 46, 40, 35, 31, 27, 0], dir: 'lower' },
};

// Weighted importance of each indicator for octagon score
export const HWEIGHTS = [0.20, 0.20, 0.15, 0.15, 0.10, 0.10, 0.05, 0.05];

// Behaviour-to-indicator mapping
// Key = indicator index, Value = array of behaviour indices that drive it
export const BMAP: Record<number, number[]> = {
  0: [1, 3, 5, 6, 7],   // Blood Pressure: Smoking, Sweat, Salt, Spirits, Stress
  1: [4],                 // Blood Sugar: Sugar
  2: [1, 6],              // Cholesterol: Smoking, Spirits
  3: [0, 1, 3, 7],        // Resting HR: Sleep, Smoking, Sweat, Stress
  4: [3, 4],              // Body Fat: Sweat, Sugar
  5: [2],                 // Muscle Mass: Strength
  6: [2, 3],              // Push-ups: Strength, Sweat
  7: [3],                 // 5km Run: Sweat
};

function getThresholds(indicatorIndex: number, gender: string): number[] {
  const t = HT[indicatorIndex];
  return t.both ? t.both : (gender === 'female' ? t.female! : t.male!);
}

/**
 * Calculate indicator score (1-8) from raw value
 */
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
