// Verbatim from data.js — health behaviour recommendations indexed by [behaviourIndex][score].
// Score keys are -1, 0, 1, 2.

export interface Recommendation {
  rec: string;
  next?: string;
}

export const BRECS: Record<number, Recommendation>[] = [
  // 0: Sleep
  {
    [-1]: { rec: 'Fewer than 5 hours is severely impacting your recovery, metabolism and cardiovascular health. Set a fixed bedtime and wake time \u2014 even on weekends. Remove screens 60 minutes before bed.' },
    0:    { rec: 'You are getting some sleep but not enough for full recovery. Prioritise a consistent sleep schedule above almost everything else. Keep your room cool and dark. Avoid caffeine after 2pm.' },
    1:    { rec: 'You are close to optimal. A small improvement in sleep quality or duration will have a noticeable impact on your resting heart rate. Consider a wind-down routine and limiting alcohol.' },
    2:    { rec: 'Excellent. You are doing the most important thing in health consistently. Protect this habit aggressively \u2014 it is the foundation everything else builds on.' },
  },
  // 1: Smoking
  {
    [-1]: { rec: 'Daily smoking at this level is the single biggest risk factor in your health profile. It is directly elevating your blood pressure, lowering your good cholesterol, and raising your resting heart rate every single day. Speak to your GP about cessation support immediately.' },
    0:    { rec: 'Even at lower levels, daily smoking or regular vaping causes cumulative cardiovascular damage. There is no safe level of daily tobacco use. Use nicotine replacement therapy to manage cravings while you quit.' },
    1:    { rec: 'Occasional smoking still carries risk \u2014 but you are in a position to stop entirely. If you have recently quit, stay the course. The cardiovascular benefits of quitting begin within weeks.' },
    2:    { rec: 'Not smoking is one of the most significant contributions to your long-term health. Your blood pressure, cholesterol, and resting heart rate all benefit directly.' },
  },
  // 2: Strength
  {
    [-1]: { rec: 'Without any strength training, muscle mass naturally declines \u2014 accelerating from your 30s onwards. Start with 2 sessions per week of bodyweight exercises \u2014 squats, push-ups, rows. You do not need a gym.' },
    0:    { rec: 'One session a week is a start but not enough to build or maintain muscle effectively. Add a second session this week. Keep it simple \u2014 3 compound exercises per session, 3 sets each.' },
    1:    { rec: 'Two sessions a week is solid. To build and improve your muscle mass score add a third session or increase the weight progressively each week.' },
    2:    { rec: 'Three or more sessions with progressive overload is optimal. Track muscle mass quarterly. If your score is lower than expected review your protein intake \u2014 aim for 1.6\u20132g per kg bodyweight daily.' },
  },
  // 3: Sweat
  {
    [-1]: { rec: 'No intentional cardio means your cardiovascular system is not being challenged. Start with 20 minute walks daily \u2014 this alone will begin to lower resting heart rate within weeks.' },
    0:    { rec: 'Once a week is better than nothing but your heart needs more consistent challenge. Add a second session this week \u2014 even a 25 minute jog or cycle.' },
    1:    { rec: 'Two to three sessions per week is a solid base. To push your resting heart rate lower add one interval session per week \u2014 alternating between fast and slow efforts for 20 minutes.' },
    2:    { rec: 'Four or more sessions with elevated heart rate is excellent. Mix steady state, intervals, and tempo to continue improving. Monitor resting heart rate as the key signal.' },
  },
  // 4: Sugar
  {
    [-1]: { rec: 'Daily sugar consumption is directly driving your blood sugar levels and contributing to body fat accumulation. Start with one change \u2014 eliminate sugary drinks completely.' },
    0:    { rec: 'You are aware of the issue but not yet consistent. Replace sugary snacks with whole food alternatives \u2014 fruit, nuts, yoghurt. Read food labels.' },
    1:    { rec: 'A few times a week is much better than daily. Identify your remaining sugar triggers and build a specific response for each.' },
    2:    { rec: 'Excellent discipline. Low sugar intake is directly protecting your blood sugar levels and supporting healthy body composition. Continue reading labels.' },
  },
  // 5: Salt
  {
    [-1]: { rec: 'High sodium intake at this level is putting consistent upward pressure on your blood pressure. The biggest wins come from reducing processed food \u2014 ready meals, crisps, deli meat, canned soup.' },
    0:    { rec: 'You are consuming above optimal sodium regularly. Stop adding salt at the table, or eliminate one processed food staple. Your blood pressure will respond within weeks.' },
    1:    { rec: 'You are aware and mostly in control. Cook from scratch more often and season with herbs and spices instead of salt. Your palate will adapt within a few weeks.' },
    2:    { rec: 'Consistently low sodium is one of the most protective behaviours for blood pressure. Continue reading labels \u2014 sodium hides in bread, sauces and cereals.' },
  },
  // 6: Spirits
  {
    [-1]: { rec: 'Daily or heavy weekend drinking is raising your blood pressure, disrupting your sleep, lowering your good cholesterol, and impairing recovery. Start by introducing 4 alcohol-free days per week.' },
    0:    { rec: 'Drinking several times a week has a compounding effect on blood pressure and cholesterol. Reduce to once a week for one season and track the impact on your resting heart rate and sleep quality.' },
    1:    { rec: 'Occasional drinking is manageable but still affects sleep quality at low levels. Track your resting heart rate on days after drinking versus alcohol-free days.' },
    2:    { rec: 'Not drinking gives your cardiovascular system, liver, and sleep quality a significant advantage. Your blood pressure and cholesterol both benefit directly.' },
  },
  // 7: Stress
  {
    [-1]: { rec: 'Chronic stress with no management strategy is elevating your cortisol continuously \u2014 raising blood pressure, disrupting sleep, and suppressing your immune system. Start with 5 minutes of slow breathing daily.' },
    0:    { rec: 'You have some awareness but inconsistency means stress is still accumulating. Build one non-negotiable stress management habit \u2014 a daily walk, morning breathing, journaling, or meditation.' },
    1:    { rec: 'You are managing reasonably well. Identify your highest stress triggers and build a specific response for each.' },
    2:    { rec: 'Consistent stress management is protecting your blood pressure and resting heart rate directly. Protect the habits that make them possible.' },
  },
];

// Indicator recommendations indexed by [indicatorIndex][score]. Scores -1/0/1/2.
// Order matches HLABELS: BP, Weight, Waist, Resting HR, Body Fat, Sleep Quality, Blood Sugar, Wellbeing.
export const HRECS: Record<number, Recommendation>[] = [
  // 0: Blood Pressure
  {
    [-1]: { rec: 'High blood pressure is putting consistent strain on your heart. Reduce salt and alcohol, get moving daily, and book a GP review.' },
    0:    { rec: 'You don\u2019t know your blood pressure. It\u2019s the simplest cardiovascular number to check \u2014 do it this month.' },
    1:    { rec: 'Borderline blood pressure is a clear signal to act before it climbs. Cut sodium and add daily walks.' },
    2:    { rec: 'Healthy blood pressure is one of the best long-term protective signals. Maintain the habits that got you here.' },
  },
  // 1: Weight
  {
    [-1]: { rec: 'Significantly off your healthy range. Combine consistent strength + cardio with a small calorie deficit and protein at every meal.' },
    0:    { rec: 'You haven\u2019t checked your weight recently. Weigh in once a week at the same time of day to establish a baseline.' },
    1:    { rec: 'You\u2019re close to a healthy range. Small consistency tweaks \u2014 sleep, sugar, training \u2014 will move this.' },
    2:    { rec: 'A healthy weight for your height is a strong baseline. Protect it through training, sleep and clean diet.' },
  },
  // 2: Waist
  {
    [-1]: { rec: 'Waist above guidelines is the strongest predictor of metabolic risk. Sugar reduction and cardio are the fastest levers.' },
    0:    { rec: 'You haven\u2019t measured your waist. Wrap a tape around your belly button this week \u2014 cm or inches.' },
    1:    { rec: 'Borderline waist is worth a small targeted reduction. Cut sugar and add 3 cardio sessions weekly.' },
    2:    { rec: 'A lean waist is one of the cleanest metabolic signals. Maintain it.' },
  },
  // 3: Resting HR
  {
    [-1]: { rec: 'Elevated resting HR points to under-trained cardiovascular system or chronic stress. Daily walks + better sleep are the first lever.' },
    0:    { rec: 'You don\u2019t know your resting heart rate. Measure it on waking before getting up \u2014 lowest reading of the day.' },
    1:    { rec: 'Average resting HR has room to fall. Add 150 minutes of moderate cardio weekly to push it down.' },
    2:    { rec: 'Athletic resting HR is excellent. Maintain training and prioritise recovery.' },
  },
  // 4: Body Fat
  {
    [-1]: { rec: 'High body fat raises long-term risk. Combine strength training and a clean, protein-led diet.' },
    0:    { rec: 'You don\u2019t know your body fat. A smart scale gives you a workable estimate at home.' },
    1:    { rec: 'Borderline body fat is responsive to small consistent changes \u2014 protein, training and sleep.' },
    2:    { rec: 'Lean and healthy is exactly the composition you want. Protect it.' },
  },
  // 5: Sleep Quality
  {
    [-1]: { rec: 'Poor, unrefreshing sleep affects every other metric. Treat sleep as the most important health behaviour for the next month.' },
    0:    { rec: 'Hard to say how rested you feel? Track it for 2 weeks with a simple wake-up score.' },
    1:    { rec: 'Mixed sleep quality has clear leverage. Stabilise wake time and reduce evening alcohol first.' },
    2:    { rec: 'Restorative sleep is the single biggest health asset you have. Defend the routine that makes it possible.' },
  },
  // 6: Blood Sugar
  {
    [-1]: { rec: 'Diabetic-range blood sugar needs medical guidance alongside dietary change. Book a GP review.' },
    0:    { rec: 'You\u2019ve never tested your blood sugar. Ask your GP for a fasting glucose test, or use a home kit.' },
    1:    { rec: 'Borderline blood sugar is a strong signal to act early. Reduce refined carbs and walk after meals.' },
    2:    { rec: 'In-range blood sugar is metabolic gold. Keep sugar low and stay active.' },
  },
  // 7: Wellbeing Score
  {
    [-1]: { rec: 'A low wellbeing score is a real signal \u2014 don\u2019t ignore it. Prioritise sleep, social contact, and reach out to a GP or therapist if it persists.' },
    0:    { rec: 'Hard to say how you feel? Set a daily check-in and track for two weeks.' },
    1:    { rec: 'Mixed days are the norm. Build one foundational habit that lifts the median \u2014 sleep, movement, or daily walk.' },
    2:    { rec: 'Consistently strong wellbeing is the goal everything else compounds toward. Protect what works.' },
  },
];
