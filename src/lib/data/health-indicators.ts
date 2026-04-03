export interface IndicatorDefinition {
  id: number;
  name: string;
  hook: string;
  drivenBy: string;
  unit: string;
  placeholder: string;
  min: number;
  max: number;
  step: number;
  range: string;
}

export const HEALTH_INDICATORS: IndicatorDefinition[] = [
  {
    id: 1, name: 'Blood Pressure',
    hook: 'Your systolic (top) number in mmHg. Check with a home cuff or at your GP.',
    drivenBy: 'Salt, Spirits, Smoking, Stress',
    unit: 'mmHg', placeholder: 'e.g. 125', min: 60, max: 220, step: 1,
    range: 'Normal range: 90–180+',
  },
  {
    id: 2, name: 'Blood Sugar',
    hook: 'Fasting blood glucose in mmol/L. Taken after 8 hours without food.',
    drivenBy: 'Sugar',
    unit: 'mmol/L', placeholder: 'e.g. 5.2', min: 2, max: 20, step: 0.1,
    range: 'Normal range: 3.5–11+',
  },
  {
    id: 3, name: 'Cholesterol',
    hook: 'Total cholesterol in mmol/L. Available from a GP blood test or home test kit.',
    drivenBy: 'Smoking, Spirits',
    unit: 'mmol/L', placeholder: 'e.g. 4.8', min: 1, max: 12, step: 0.1,
    range: 'Normal range: 2.0–7.5+',
  },
  {
    id: 4, name: 'Resting Heart Rate',
    hook: 'Beats per minute at complete rest. Measure first thing in the morning before getting up.',
    drivenBy: 'Sleep, Smoking, Sweat, Stress',
    unit: 'bpm', placeholder: 'e.g. 65', min: 30, max: 120, step: 1,
    range: 'Normal range: 40–100+',
  },
  {
    id: 5, name: 'Body Fat',
    hook: 'Your body fat percentage. Measured by a smart scale with bioelectrical impedance.',
    drivenBy: 'Sugar, Sweat',
    unit: '%', placeholder: 'e.g. 22', min: 3, max: 60, step: 0.1,
    range: 'Normal range varies by gender',
  },
  {
    id: 6, name: 'Muscle Mass',
    hook: 'Your skeletal muscle mass percentage. Measured by a smart scale.',
    drivenBy: 'Strength',
    unit: '%', placeholder: 'e.g. 38', min: 15, max: 60, step: 0.1,
    range: 'Normal range varies by gender',
  },
  {
    id: 7, name: 'Push-ups',
    hook: 'Maximum reps in one go, full range of motion. Stop when your form breaks.',
    drivenBy: 'Strength, Sweat',
    unit: 'reps', placeholder: 'e.g. 20', min: 0, max: 150, step: 1,
    range: 'How many can you do in one go?',
  },
  {
    id: 8, name: '5km',
    hook: 'Your 5km time in minutes. Walk, jog, or run. Use a recent Parkrun time or estimate.',
    drivenBy: 'Sweat',
    unit: 'mins', placeholder: 'e.g. 32', min: 15, max: 90, step: 1,
    range: 'How long does 5km take you?',
  },
];
