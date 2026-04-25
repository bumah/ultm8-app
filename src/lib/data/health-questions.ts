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

// Weekly check-in — questions look back at the last 7 days.
export const HEALTH_QUESTIONS: BehaviourQuestion[] = [
  {
    id: 1, name: 'Sleep',
    hook: 'Sleep is the foundation of recovery. It directly affects your heart rate, stress hormones, metabolism and mental performance.',
    drives: 'Sleep Quality, Resting HR, Wellbeing Score',
    options: [
      { score: 1, text: 'Most nights this week I got less than 5 hours' },
      { score: 2, text: 'I averaged around 5\u20136 hours most nights' },
      { score: 3, text: 'I averaged 6\u20137 hours most nights' },
      { score: 4, text: 'I consistently got 7\u20139 hours of quality sleep' },
    ],
  },
  {
    id: 2, name: 'Smoking',
    hook: 'The single most impactful lifestyle behaviour on long-term health. Raises blood pressure and elevates resting heart rate.',
    drives: 'Blood Pressure, Resting HR',
    options: [
      { score: 1, text: 'I smoked daily \u2014 10+ cigarettes a day or equivalent' },
      { score: 2, text: 'I smoked daily but fewer than 10, or vaped regularly' },
      { score: 3, text: 'I smoked occasionally or socially this week' },
      { score: 4, text: 'I didn\u2019t smoke at all this week' },
    ],
  },
  {
    id: 3, name: 'Strength',
    hook: 'Strength training builds and preserves muscle mass \u2014 one of the strongest predictors of long-term health and longevity.',
    drives: 'Weight, Body Fat, Wellbeing Score',
    options: [
      { score: 1, text: 'I did no strength or resistance training' },
      { score: 2, text: 'I did one strength session this week' },
      { score: 3, text: 'I did two strength sessions this week' },
      { score: 4, text: 'I did three or more sessions with progressive overload' },
    ],
  },
  {
    id: 4, name: 'Sweat',
    hook: 'Intentional cardiovascular exercise \u2014 running, cycling, swimming, HIIT \u2014 strengthens your heart and lowers resting heart rate.',
    drives: 'Resting HR, Weight, Waist, Wellbeing Score',
    options: [
      { score: 1, text: 'I did no intentional cardio this week' },
      { score: 2, text: 'I did one light cardio session this week' },
      { score: 3, text: 'I did 2\u20133 moderate cardio sessions this week' },
      { score: 4, text: 'I did 4+ cardio sessions with elevated heart rate' },
    ],
  },
  {
    id: 5, name: 'Sugar',
    hook: 'Excess sugar drives blood sugar spikes, insulin resistance, inflammation, and fat accumulation.',
    drives: 'Blood Sugar, Weight, Waist, Body Fat',
    options: [
      { score: 1, text: 'I had sugary food or drinks daily \u2014 sodas, juice, desserts' },
      { score: 2, text: 'I had sugar most days but tried to limit it' },
      { score: 3, text: 'I had added sugar only a few times this week' },
      { score: 4, text: 'I rarely had any added sugar or sugary drinks' },
    ],
  },
  {
    id: 6, name: 'Salt',
    hook: 'Sodium raises blood pressure over time. Most people consume far more than they realise through processed food.',
    drives: 'Blood Pressure',
    options: [
      { score: 1, text: 'I ate a lot of salty and processed food daily' },
      { score: 2, text: 'I ate salty or processed meals most days but was aware' },
      { score: 3, text: 'I had salty or processed meals only a few times this week' },
      { score: 4, text: 'I rarely ate salty or processed food and checked labels' },
    ],
  },
  {
    id: 7, name: 'Spirits',
    hook: 'Alcohol disrupts sleep, raises blood pressure, and impairs recovery \u2014 even at moderate levels.',
    drives: 'Blood Pressure, Sleep Quality, Resting HR',
    options: [
      { score: 1, text: 'I drank most days or had heavy sessions this week' },
      { score: 2, text: 'I drank several times this week' },
      { score: 3, text: 'I drank once this week' },
      { score: 4, text: 'I didn\u2019t drink any alcohol this week' },
    ],
  },
  {
    id: 8, name: 'Stress',
    hook: 'Chronic stress elevates cortisol \u2014 raising blood pressure, disrupting sleep, and driving inflammation.',
    drives: 'Blood Pressure, Resting HR, Sleep Quality, Wellbeing Score',
    options: [
      { score: 1, text: 'I felt chronically stressed with no way to manage it' },
      { score: 2, text: 'I managed stress inconsistently \u2014 some days better than others' },
      { score: 3, text: 'I had stress habits that mostly worked this week' },
      { score: 4, text: 'I managed stress consistently and rarely felt overwhelmed' },
    ],
  },
];
