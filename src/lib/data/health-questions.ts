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

export const HEALTH_QUESTIONS: BehaviourQuestion[] = [
  {
    id: 1, name: 'Sleep',
    hook: 'Sleep is the foundation of recovery. It directly affects your heart rate, stress hormones, metabolism and mental performance.',
    drives: 'Sleep Quality, Resting HR, Wellbeing Score',
    options: [
      { score: 1, text: 'I regularly get less than 5 hours of sleep' },
      { score: 2, text: 'I get around 5–6 hours most nights' },
      { score: 3, text: 'I get 6–7 hours most nights' },
      { score: 4, text: 'I consistently get 7–9 hours of quality sleep' },
    ],
  },
  {
    id: 2, name: 'Smoking',
    hook: 'The single most impactful lifestyle behaviour on long-term health. Raises blood pressure, lowers good cholesterol, elevates resting heart rate.',
    drives: 'Blood Pressure, Resting HR',
    options: [
      { score: 1, text: 'I smoke daily — 10 or more cigarettes, or equivalent' },
      { score: 2, text: 'I smoke daily but fewer than 10, or I vape regularly' },
      { score: 3, text: 'I smoke occasionally or socially, or I quit within the last year' },
      { score: 4, text: 'I do not smoke and have not for over a year, or never have' },
    ],
  },
  {
    id: 3, name: 'Strength',
    hook: 'Strength training builds and preserves muscle mass — one of the strongest predictors of long-term health and longevity.',
    drives: 'Weight, Body Fat, Wellbeing Score',
    options: [
      { score: 1, text: 'I do no strength or resistance training' },
      { score: 2, text: 'I strength train once a week or less' },
      { score: 3, text: 'I strength train 2 times a week consistently' },
      { score: 4, text: 'I strength train 3 or more times a week with progressive overload' },
    ],
  },
  {
    id: 4, name: 'Sweat',
    hook: 'Intentional cardiovascular exercise — running, cycling, swimming, HIIT — strengthens your heart and lowers resting heart rate.',
    drives: 'Resting HR, Weight, Waist, Wellbeing Score',
    options: [
      { score: 1, text: 'I do no intentional cardio exercise' },
      { score: 2, text: 'I do light cardio once a week or less' },
      { score: 3, text: 'I do moderate cardio 2–3 times a week' },
      { score: 4, text: 'I do consistent cardio 4+ times a week with elevated heart rate' },
    ],
  },
  {
    id: 5, name: 'Sugar',
    hook: 'Excess sugar drives blood sugar spikes, insulin resistance, inflammation, and fat accumulation.',
    drives: 'Blood Sugar, Weight, Waist, Body Fat',
    options: [
      { score: 1, text: 'I consume sugary food or drinks every day — sodas, juice, desserts' },
      { score: 2, text: 'I have sugar most days but try to limit it' },
      { score: 3, text: 'I limit added sugar to a few times a week' },
      { score: 4, text: 'I rarely consume added sugar or sugary drinks' },
    ],
  },
  {
    id: 6, name: 'Salt',
    hook: 'Sodium raises blood pressure over time. Most people consume far more than they realise through processed food.',
    drives: 'Blood Pressure',
    options: [
      { score: 1, text: 'I eat a lot of salty and processed food daily with no restriction' },
      { score: 2, text: 'I eat salty or processed meals most days but am aware' },
      { score: 3, text: 'I limit salty and processed meals to a few times a week' },
      { score: 4, text: 'I rarely eat salty or processed food and check labels consistently' },
    ],
  },
  {
    id: 7, name: 'Spirits',
    hook: 'Alcohol disrupts sleep, raises blood pressure, lowers good cholesterol, and impairs recovery — even at moderate levels.',
    drives: 'Blood Pressure, Sleep Quality, Resting HR',
    options: [
      { score: 1, text: 'I drink most days or have heavy drinking sessions most weekends' },
      { score: 2, text: 'I drink several times a week' },
      { score: 3, text: 'I drink occasionally — once a week or less' },
      { score: 4, text: 'I rarely or never drink alcohol' },
    ],
  },
  {
    id: 8, name: 'Stress',
    hook: 'Chronic stress elevates cortisol — raising blood pressure, disrupting sleep, suppressing immunity, and driving inflammation.',
    drives: 'Blood Pressure, Resting HR, Sleep Quality, Wellbeing Score',
    options: [
      { score: 1, text: 'I feel chronically stressed with no management strategy' },
      { score: 2, text: 'I manage stress inconsistently — some days better than others' },
      { score: 3, text: 'I have stress management habits that mostly work' },
      { score: 4, text: 'I consistently manage stress with daily habits and rarely feel overwhelmed' },
    ],
  },
];
