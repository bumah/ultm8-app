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
    hook: 'Your blood pressure reading in mmHg. Enter both systolic (top) and diastolic (bottom) numbers.',
    drivenBy: 'Salt, Spirits, Smoking, Stress',
    unit: 'mmHg', placeholder: 'e.g. 125', min: 60, max: 220, step: 1,
    range: 'Systolic / Diastolic',
  },
  {
    id: 2, name: 'Weight',
    hook: 'Your body weight. Weigh yourself at the same time of day for consistency, ideally first thing.',
    drivenBy: 'Sugar, Sweat, Strength',
    unit: 'kg', placeholder: 'e.g. 78', min: 30, max: 250, step: 0.1,
    range: 'Your body weight over time',
  },
  {
    id: 3, name: 'Waist',
    hook: 'Waist circumference around your belly button, relaxed. A stronger predictor of metabolic health than weight alone.',
    drivenBy: 'Sugar, Sweat',
    unit: 'cm', placeholder: 'e.g. 88', min: 40, max: 180, step: 0.5,
    range: 'Measured around belly button',
  },
  {
    id: 4, name: 'Resting HR',
    hook: 'Beats per minute at complete rest. Measure first thing in the morning before getting up.',
    drivenBy: 'Sleep, Smoking, Sweat, Stress',
    unit: 'bpm', placeholder: 'e.g. 65', min: 30, max: 120, step: 1,
    range: 'Normal range: 40–100+',
  },
  {
    id: 5, name: 'Body Fat',
    hook: 'Your body fat percentage. Measured by a smart scale with bioelectrical impedance.',
    drivenBy: 'Sugar, Sweat, Strength',
    unit: '%', placeholder: 'e.g. 22', min: 3, max: 60, step: 0.1,
    range: 'Normal range varies by gender',
  },
  {
    id: 6, name: 'Sleep Quality',
    hook: 'Your sleep quality score, 1–10. Use the score from your wearable (Oura, Whoop, Fitbit, Apple Watch) or rate it yourself.',
    drivenBy: 'Sleep, Spirits, Stress',
    unit: '/10', placeholder: 'e.g. 7', min: 1, max: 10, step: 1,
    range: '1 = poor, 10 = excellent',
  },
  {
    id: 7, name: 'Blood Sugar',
    hook: 'Fasting blood glucose in mmol/L. Taken after 8 hours without food.',
    drivenBy: 'Sugar, Sweat',
    unit: 'mmol/L', placeholder: 'e.g. 5.2', min: 2, max: 20, step: 0.1,
    range: 'Normal range: 3.5–5.5',
  },
  {
    id: 8, name: 'Wellbeing Score',
    hook: 'How well do you feel about yourself right now, 1–10? A check-in on your overall state — physical, mental, social.',
    drivenBy: 'Sleep, Strength, Sweat, Stress',
    unit: '/10', placeholder: 'e.g. 7', min: 1, max: 10, step: 1,
    range: '1 = struggling, 10 = thriving',
  },
];
