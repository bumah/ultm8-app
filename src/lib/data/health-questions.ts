// Verbatim from ultm8-challenge.html / data.js. Scoring scale: -1 / 0 / +1 / +2.

export interface BehaviourOption {
  score: number;
  text: string;
}

export interface BehaviourQuestion {
  id: number;
  name: string;
  hook: string;
  options: BehaviourOption[];
}

export const HEALTH_QUESTIONS: BehaviourQuestion[] = [
  {
    id: 1, name: 'Sleep',
    hook: 'Sleep is the foundation of recovery. It directly affects your heart rate, stress hormones, metabolism and mental performance.',
    options: [
      { score: -1, text: 'I regularly get less than 5 hours of sleep' },
      { score: 0, text: 'I get around 5\u20136 hours most nights' },
      { score: 1, text: 'I get 6\u20137 hours most nights' },
      { score: 2, text: 'I consistently get 7\u20139 hours of quality sleep' },
    ],
  },
  {
    id: 2, name: 'Smoking',
    hook: 'The single most impactful lifestyle behaviour on long-term health. Raises blood pressure, lowers good cholesterol, elevates resting heart rate.',
    options: [
      { score: -1, text: 'I smoke daily \u2014 10 or more cigarettes, or equivalent' },
      { score: 0, text: 'I smoke daily but fewer than 10, or I vape regularly' },
      { score: 1, text: 'I smoke occasionally or socially, or I quit within the last year' },
      { score: 2, text: 'I do not smoke and have not for over a year, or never have' },
    ],
  },
  {
    id: 3, name: 'Strength',
    hook: 'Strength training builds and preserves muscle mass \u2014 one of the strongest predictors of long-term health and longevity.',
    options: [
      { score: -1, text: 'I do no strength or resistance training' },
      { score: 0, text: 'I strength train once a week or less' },
      { score: 1, text: 'I strength train 2 times a week consistently' },
      { score: 2, text: 'I strength train 3 or more times a week with progressive overload' },
    ],
  },
  {
    id: 4, name: 'Sweat',
    hook: 'Intentional cardiovascular exercise \u2014 running, cycling, swimming, HIIT \u2014 strengthens your heart and lowers resting heart rate.',
    options: [
      { score: -1, text: 'I do no intentional cardio exercise' },
      { score: 0, text: 'I do light cardio once a week or less' },
      { score: 1, text: 'I do moderate cardio 2\u20133 times a week' },
      { score: 2, text: 'I do consistent cardio 4+ times a week with elevated heart rate' },
    ],
  },
  {
    id: 5, name: 'Sugar',
    hook: 'Excess sugar drives blood sugar spikes, insulin resistance, inflammation, and fat accumulation.',
    options: [
      { score: -1, text: 'I consume sugary food or drinks every day \u2014 sodas, juice, desserts' },
      { score: 0, text: 'I have sugar most days but try to limit it' },
      { score: 1, text: 'I limit added sugar to a few times a week' },
      { score: 2, text: 'I rarely consume added sugar or sugary drinks' },
    ],
  },
  {
    id: 6, name: 'Salt',
    hook: 'Sodium raises blood pressure over time. Most people consume far more than they realise through processed food.',
    options: [
      { score: -1, text: 'I eat a lot of salty and processed food daily with no restriction' },
      { score: 0, text: 'I eat salty or processed meals most days but am aware' },
      { score: 1, text: 'I limit salty and processed meals to a few times a week' },
      { score: 2, text: 'I rarely eat salty or processed food and check labels consistently' },
    ],
  },
  {
    id: 7, name: 'Spirits',
    hook: 'Alcohol disrupts sleep, raises blood pressure, lowers good cholesterol, and impairs recovery \u2014 even at moderate levels.',
    options: [
      { score: -1, text: 'I drink most days or have heavy drinking sessions most weekends' },
      { score: 0, text: 'I drink several times a week' },
      { score: 1, text: 'I drink occasionally \u2014 once a week or less' },
      { score: 2, text: 'I rarely or never drink alcohol' },
    ],
  },
  {
    id: 8, name: 'Stress',
    hook: 'Chronic stress elevates cortisol \u2014 raising blood pressure, disrupting sleep, suppressing immunity, and driving inflammation.',
    options: [
      { score: -1, text: 'I feel chronically stressed with no management strategy' },
      { score: 0, text: 'I manage stress inconsistently \u2014 some days better than others' },
      { score: 1, text: 'I have stress management habits that mostly work' },
      { score: 2, text: 'I consistently manage stress with daily habits and rarely feel overwhelmed' },
    ],
  },
];

// Indicator self-assessment questions (8 follow the 8 behaviour Qs in the
// check-in flow). Same -1/0/+1/+2 scale; "Don't know" maps to 0.
export const HEALTH_INDICATOR_QUESTIONS: BehaviourQuestion[] = [
  {
    id: 9, name: 'Blood Pressure',
    hook: 'Your blood pressure is a daily readout of cardiovascular load. If you don\u2019t know it, find out \u2014 it\u2019s the easiest number to check.',
    options: [
      { score: 2, text: 'Healthy / optimal' },
      { score: 1, text: 'Borderline' },
      { score: -1, text: 'High / concerning' },
      { score: 0, text: 'Don\u2019t know' },
    ],
  },
  {
    id: 10, name: 'Weight',
    hook: 'Weight is a blunt measure but it\u2019s the simplest indicator of long-term energy balance. Be honest about the range you sit in.',
    options: [
      { score: 2, text: 'Healthy weight for my height' },
      { score: 1, text: 'Slightly off but close' },
      { score: -1, text: 'Significantly over or under' },
      { score: 0, text: 'Don\u2019t know / haven\u2019t checked' },
    ],
  },
  {
    id: 11, name: 'Waist',
    hook: 'Waist circumference is the strongest predictor of metabolic risk \u2014 more than weight or BMI alone.',
    options: [
      { score: 2, text: 'Healthy / lean' },
      { score: 1, text: 'Borderline' },
      { score: -1, text: 'Above guidelines' },
      { score: 0, text: 'Don\u2019t know / haven\u2019t measured' },
    ],
  },
  {
    id: 12, name: 'Resting HR',
    hook: 'Resting heart rate is one of the cleanest signals of cardiovascular fitness. Lower is generally better.',
    options: [
      { score: 2, text: 'Low / athletic' },
      { score: 1, text: 'Average' },
      { score: -1, text: 'High / elevated' },
      { score: 0, text: 'Don\u2019t know' },
    ],
  },
  {
    id: 13, name: 'Body Fat',
    hook: 'Body fat distinguishes lean mass from stored energy. Composition matters more than scale weight.',
    options: [
      { score: 2, text: 'Lean / healthy range' },
      { score: 1, text: 'Borderline' },
      { score: -1, text: 'High / above healthy range' },
      { score: 0, text: 'Don\u2019t know' },
    ],
  },
  {
    id: 14, name: 'Sleep Quality',
    hook: 'Sleep quality drives every other metric. The hours matter, but so does how rested you feel.',
    options: [
      { score: 2, text: 'Restorative \u2014 wake refreshed' },
      { score: 1, text: 'Mixed / inconsistent' },
      { score: -1, text: 'Poor / unrefreshing' },
      { score: 0, text: 'Don\u2019t know / hard to say' },
    ],
  },
  {
    id: 15, name: 'Blood Sugar',
    hook: 'Blood sugar is an early warning for insulin resistance. If you\u2019ve never tested, that itself is the answer.',
    options: [
      { score: 2, text: 'Healthy / in range' },
      { score: 1, text: 'Borderline / pre-diabetic' },
      { score: -1, text: 'Diabetic / high' },
      { score: 0, text: 'Don\u2019t know / never tested' },
    ],
  },
  {
    id: 16, name: 'Wellbeing Score',
    hook: 'Self-reported wellbeing captures mood, energy and stress in a single number. It tracks closely with long-term outcomes.',
    options: [
      { score: 2, text: 'Consistently strong' },
      { score: 1, text: 'Mixed / OK most days' },
      { score: -1, text: 'Low / often struggling' },
      { score: 0, text: 'Don\u2019t know / hard to say' },
    ],
  },
];
