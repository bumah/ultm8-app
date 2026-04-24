export interface Recommendation {
  rec: string;
  next: string;
}

// BRECS: behaviour recommendations indexed by [behaviourIndex][tierScore (1-4)].
// Health behaviours (Sleep, Smoking, Strength, Sweat, Sugar, Salt, Spirits, Stress) unchanged from v1.
export const BRECS: Record<number, Recommendation>[] = [
  // 0: Sleep
  {
    1: { rec: 'Fewer than 5 hours is severely impacting your recovery, metabolism and cardiovascular health. Set a fixed bedtime and wake time \u2014 even on weekends. Remove screens 60 minutes before bed.', next: 'Get to 5\u20136 hours consistently as your first target.' },
    2: { rec: 'You are getting some sleep but not enough for full recovery. Prioritise a consistent sleep schedule above almost everything else. Keep your room cool and dark. Avoid caffeine after 2pm.', next: 'Aim for 6\u20137 hours consistently. Track your bedtime for 2 weeks.' },
    3: { rec: 'You are close to optimal. A small improvement in sleep quality or duration will have a noticeable impact on your resting heart rate and wellbeing. Consider a wind-down routine and limit alcohol.', next: 'Push to a consistent 7\u20139 hours. Focus on quality as much as quantity.' },
    4: { rec: 'Excellent. You are doing the most important thing in health consistently. Protect this habit aggressively \u2014 it is the foundation everything else builds on.', next: 'Maintain. Track sleep quality with a wearable if possible.' },
  },
  // 1: Smoking
  {
    1: { rec: 'Daily smoking at this level is the single biggest risk factor in your health profile. It directly elevates your blood pressure and resting heart rate every day. Speak to your GP about cessation support immediately.', next: 'Set a quit date. Book a GP appointment this week.' },
    2: { rec: 'Even at lower levels, daily smoking or regular vaping causes cumulative cardiovascular damage. There is no safe level of daily tobacco use. Use nicotine replacement to manage cravings while you quit.', next: 'Cut to occasional only. Set a quit date in the next 60 days.' },
    3: { rec: 'Occasional smoking still carries risk \u2014 but you are in a position to stop entirely. If you have recently quit, stay the course. The cardiovascular benefits begin within weeks.', next: 'Stop completely. Join a cessation programme if needed.' },
    4: { rec: 'Not smoking is one of the most significant contributions to your long-term health. Your blood pressure and resting heart rate both benefit directly.', next: 'Maintain. Avoid passive smoke exposure where possible.' },
  },
  // 2: Strength
  {
    1: { rec: 'Without strength training, muscle mass naturally declines \u2014 accelerating from your 30s onwards. Start with 2 sessions a week of bodyweight exercises \u2014 squats, push-ups, rows. You do not need a gym.', next: 'Commit to 2 strength sessions per week for the first month.' },
    2: { rec: 'One session a week is a start but not enough to build or maintain muscle effectively. Add a second session this week. Keep it simple \u2014 3 compound exercises, 3 sets each.', next: 'Add one more session per week. Two is the minimum for progress.' },
    3: { rec: 'Two sessions a week is solid. To push your weight and body fat in the right direction add a third session or progress the weight each week.', next: 'Add a third session per week or increase weight progressively.' },
    4: { rec: 'Three or more sessions with progressive overload is optimal. Track weight and body fat quarterly. Review protein intake \u2014 aim for 1.6\u20132g per kg bodyweight daily.', next: 'Maintain and track. Ensure protein intake matches training volume.' },
  },
  // 3: Sweat
  {
    1: { rec: 'No intentional cardio means your cardiovascular system is not being challenged. Start with 20-minute walks daily \u2014 this alone will begin to lower resting heart rate within weeks.', next: 'Start with 3 x 20-min walks per week.' },
    2: { rec: 'Once a week is better than nothing but your heart needs more consistent challenge. Add a second session this week \u2014 even a 25-minute jog or cycle.', next: 'Build to 2\u20133 sessions per week. Any elevated heart rate counts.' },
    3: { rec: 'Two to three sessions per week is a solid base. To push your resting heart rate lower add one interval session per week \u2014 alternating fast and slow efforts for 20 minutes.', next: 'Add one interval or tempo session to your weekly routine.' },
    4: { rec: 'Four or more sessions with elevated heart rate is excellent. Mix steady state, intervals and tempo to continue improving. Monitor resting heart rate as the key signal.', next: 'Maintain and add variety. Track resting heart rate to confirm adaptation.' },
  },
  // 4: Sugar
  {
    1: { rec: 'Daily sugar consumption is directly driving your blood sugar levels and contributing to body fat and waist accumulation. Start with one change \u2014 eliminate sugary drinks completely.', next: 'Cut sugary drinks first. Replace with water or unsweetened options.' },
    2: { rec: 'You are aware of the issue but not yet consistent. Replace sugary snacks with whole food alternatives \u2014 fruit, nuts, yoghurt. Read food labels.', next: 'Reduce to 2\u20133 times per week max. Read labels on packaged food.' },
    3: { rec: 'A few times a week is much better than daily. Identify your remaining sugar triggers and build a specific response for each.', next: 'Identify your top triggers and build a specific habit response.' },
    4: { rec: 'Excellent discipline. Low sugar intake is directly protecting your blood sugar levels and supporting healthy body composition. Continue reading labels.', next: 'Maintain. Watch for hidden sugars in sauces, cereals and packaged food.' },
  },
  // 5: Salt
  {
    1: { rec: 'High sodium intake at this level is putting consistent upward pressure on your blood pressure. The biggest wins come from reducing processed food \u2014 ready meals, crisps, deli meat, canned soup.', next: 'Replace one processed meal per day with a home-cooked alternative.' },
    2: { rec: 'You are consuming above optimal sodium regularly. Stop adding salt at the table, or eliminate one processed food staple. Your blood pressure will respond within weeks.', next: 'Remove the salt shaker from the table and check labels on packaged food.' },
    3: { rec: 'You are aware and mostly in control. Cook from scratch more often and season with herbs and spices instead of salt. Your palate will adapt within a few weeks.', next: 'Cook from scratch 5 out of 7 days and use herbs instead of salt.' },
    4: { rec: 'Consistently low sodium is one of the most protective behaviours for blood pressure. Continue reading labels \u2014 sodium hides in bread, sauces and cereals.', next: 'Maintain. Check labels on bread and sauces, hidden sodium sources.' },
  },
  // 6: Spirits
  {
    1: { rec: 'Daily or heavy weekend drinking is raising your blood pressure, disrupting your sleep, and impairing recovery. Start by introducing 4 alcohol-free days per week.', next: 'Introduce 4 alcohol-free days per week immediately.' },
    2: { rec: 'Drinking several times a week has a compounding effect on blood pressure and sleep quality. Reduce to once a week for one month and track the impact on your resting heart rate.', next: 'Reduce to one drinking occasion per week max.' },
    3: { rec: 'Occasional drinking is manageable but still affects sleep quality at low levels. Track your resting heart rate and sleep quality on days after drinking versus alcohol-free days.', next: 'Try extending to 2\u20133 week alcohol-free periods to see the full benefit.' },
    4: { rec: 'Not drinking gives your cardiovascular system, liver, and sleep quality a significant advantage. Your blood pressure benefits directly.', next: 'Maintain. Your lagging indicators should reflect this advantage.' },
  },
  // 7: Stress
  {
    1: { rec: 'Chronic stress with no management strategy is elevating your cortisol continuously \u2014 raising blood pressure, disrupting sleep, and suppressing your immune system. Start with 5 minutes of slow breathing daily.', next: 'Start with 5 minutes of slow breathing every morning for 30 days.' },
    2: { rec: 'You have some awareness but inconsistency means stress is still accumulating. Build one non-negotiable stress management habit \u2014 a daily walk, morning breathing, journaling, or meditation.', next: 'Commit to one stress management habit daily for 60 days.' },
    3: { rec: 'You are managing reasonably well. Identify your highest stress triggers and build a specific response for each.', next: 'Identify your top 2 stress triggers and build a specific response for each.' },
    4: { rec: 'Consistent stress management is protecting your blood pressure, resting heart rate and overall wellbeing directly. Protect the habits that make them possible.', next: 'Maintain your practices. Protect the boundaries that make them possible.' },
  },
];

// HRECS: indicator recommendations indexed by [indicatorIndex][0-7 where 0=score 8 (best), 7=score 1 (worst)].
// Order matches HLABELS: Blood Pressure, Weight, Waist, Resting HR, Body Fat, Sleep Quality, Blood Sugar, Wellbeing Score.
export const HRECS: Recommendation[][] = [
  // 0: Blood Pressure
  [
    { rec: 'Optimal. Maintain low sodium intake, daily movement, manage stress, and check quarterly.', next: 'Maintain. Keep salt low, stay active, manage stress.' },
    { rec: 'Almost there. Cut sodium below 2g/day, add 20 mins of daily walking, and practise a stress reduction habit.', next: 'Target below 110 mmHg.' },
    { rec: 'Very close to optimal. Focus on reducing salt, limiting alcohol, and getting 7\u20138 hours of sleep consistently.', next: 'Target below 115 mmHg.' },
    { rec: 'Good progress. Increase cardio to 150 mins per week, reduce processed food, and monitor weekly.', next: 'Target below 120 mmHg.' },
    { rec: 'Getting there. Prioritise sleep, reduce caffeine after midday, and speak to your GP about regular monitoring.', next: 'Target below 130 mmHg.' },
    { rec: 'Work to do. Reduce salt and alcohol significantly, start a daily walking habit, and book a GP check-up.', next: 'Target below 140 mmHg.' },
    { rec: 'This needs attention. Book a GP appointment. Medication may be needed alongside lifestyle changes.', next: 'Target below 160 mmHg.' },
    { rec: 'This is a medical emergency range. See a doctor immediately.', next: 'Seek medical attention now.' },
  ],
  // 1: Weight
  [
    { rec: 'Optimal for your build. Maintain through consistent training, a protein-rich whole-food diet, and monthly weigh-ins.', next: 'Maintain. Weigh in weekly.' },
    { rec: 'Very good. Small tweaks to diet composition and weekly training will protect this range.', next: 'Maintain within 2kg of current.' },
    { rec: 'Good range. Focus on protein intake and progressive strength training to shift composition, not just weight.', next: 'Aim for 1kg change per month in the right direction.' },
    { rec: 'Above optimal. Cut sugary drinks and ultra-processed food. Add 3 strength sessions and 150 mins cardio per week.', next: 'Aim for 0.5\u20131kg per week down.' },
    { rec: 'High. Prioritise a sustainable calorie deficit via whole foods. Track weight weekly at the same time of day.', next: 'Target 1kg per week down.' },
    { rec: 'Very high. Start small: walks after meals, protein at every meal, remove one processed snack per week.', next: 'Target 1\u20132kg per month down.' },
    { rec: 'Speak to your GP. A structured plan combining diet, activity and accountability is the most effective approach.', next: 'Book a GP review.' },
    { rec: 'Seek medical guidance for a structured programme. This is a health risk worth professional support.', next: 'Seek medical support immediately.' },
  ],
  // 2: Waist
  [
    { rec: 'Optimal. Waist is a strong indicator of metabolic health. Maintain with core training and a clean diet.', next: 'Maintain. Measure monthly.' },
    { rec: 'Very good. Keep core strength work and cardio consistent.', next: 'Hold within 2cm.' },
    { rec: 'Good. A small reduction is very achievable \u2014 cut sugar and add 3 cardio sessions per week.', next: 'Target 1cm down per month.' },
    { rec: 'Above optimal. Visceral fat is responsive to cardio and fibre. Add 30 mins of movement daily.', next: 'Target 2cm down per month.' },
    { rec: 'High. Strongly linked to metabolic risk. Combine cardio, strength and sugar reduction.', next: 'Target 3cm down per quarter.' },
    { rec: 'Very high. Prioritise walking, protein at every meal, and eliminate sugary drinks.', next: 'Target 5cm down per quarter.' },
    { rec: 'Speak to your GP. Elevated waist circumference is a significant predictor of cardiovascular risk.', next: 'Book a GP review.' },
    { rec: 'Seek medical guidance. This requires a structured plan.', next: 'Seek medical support immediately.' },
  ],
  // 3: Resting HR
  [
    { rec: 'Athlete level. Maintain your cardio training and prioritise recovery.', next: 'Maintain. Monitor for overtraining.' },
    { rec: 'Excellent. Keep up consistent cardio. Add one higher intensity session per week.', next: 'Target below 50 bpm.' },
    { rec: 'Very good. Add one interval training session per week \u2014 alternating fast and slow pace for 20 mins.', next: 'Target below 60 bpm.' },
    { rec: 'Good. Aim for 150 mins of moderate cardio per week.', next: 'Target below 65 bpm.' },
    { rec: 'Average. Build a consistent cardio habit \u2014 30 mins walking or cycling daily is enough to start moving this.', next: 'Target below 70 bpm.' },
    { rec: 'Above average but manageable. Start with daily 20-min walks and build up. Reduce caffeine and improve sleep.', next: 'Target below 80 bpm.' },
    { rec: 'High. Begin gentle daily movement \u2014 walking is fine. Reduce stress and improve sleep as a priority.', next: 'Target below 90 bpm.' },
    { rec: 'Very high. Consult your GP before starting any exercise programme.', next: 'Seek medical advice before exercising.' },
  ],
  // 4: Body Fat
  [
    { rec: 'Optimal. Maintain through consistent training and a protein-rich, whole-food diet.', next: 'Maintain. Keep training consistent and diet clean.' },
    { rec: 'Fit range. Small tweaks to diet \u2014 slightly reduce processed carbs and increase protein.', next: 'Target optimal range for your gender.' },
    { rec: 'Acceptable. Increase training frequency to 4x per week and track calorie intake for 2\u20134 weeks.', next: 'Target fit range for your gender.' },
    { rec: 'Above average. Focus on building lean muscle through strength training 3x per week.', next: 'Target acceptable range for your gender.' },
    { rec: 'High. Combine cardio 3x week with strength training 2x week. Prioritise whole foods.', next: 'Target above-average range for your gender.' },
    { rec: 'Very high. Start with daily walks, remove sugary drinks, reduce portion sizes.', next: 'Target high range as your first step.' },
    { rec: 'Obese range. Focus on sustainable habits. Speak to your GP about a structured approach.', next: 'Speak to your GP about a structured plan.' },
    { rec: 'Severely obese. Seek medical guidance for a structured programme.', next: 'Seek medical support immediately.' },
  ],
  // 5: Sleep Quality
  [
    { rec: 'Elite recovery. Maintain a consistent bedtime, cool dark room, and low evening alcohol.', next: 'Maintain. Protect bedtime above most other habits.' },
    { rec: 'Excellent. Minor tweaks \u2014 screens off earlier, consistent wind-down \u2014 will push you higher.', next: 'Target 9+ consistently.' },
    { rec: 'Very good. Reduce alcohol and late caffeine to push quality further.', next: 'Target 8+ consistently.' },
    { rec: 'Good. Fix your schedule: same bedtime, same wake time, 7 days a week.', next: 'Target 7+ consistently.' },
    { rec: 'Average. Identify what\u2019s interrupting your sleep \u2014 light, noise, stress, alcohol \u2014 and remove it.', next: 'Target 6+ consistently.' },
    { rec: 'Poor. Prioritise sleep as the highest-leverage health behaviour for the next month.', next: 'Target 5+ consistently.' },
    { rec: 'Very poor. Speak to your GP if this continues for more than 2 weeks.', next: 'Book a GP review if no improvement.' },
    { rec: 'Critical. Persistent poor sleep is a serious health issue \u2014 seek medical support.', next: 'Seek medical advice.' },
  ],
  // 6: Blood Sugar
  [
    { rec: 'Optimal. Keep refined sugar and processed carbs low. Continue regular movement and maintain your current diet.', next: 'Maintain. Keep sugar and refined carbs low.' },
    { rec: 'Very good. Reduce sugar intake further \u2014 cut sugary drinks and snacks. Add a 10-min walk after meals.', next: 'Target below 4.5 mmol/L.' },
    { rec: 'Normal but room to improve. Reduce refined carbohydrates, increase fibre, and exercise after meals.', next: 'Target below 5.1 mmol/L.' },
    { rec: 'Pre-diabetic range. Reduce sugar and white carbs significantly. Aim for 30 mins of moderate exercise daily.', next: 'Target below 5.6 mmol/L.' },
    { rec: 'Pre-diabetic. See your GP. Focus on diet \u2014 eliminate sugary drinks, reduce portions, prioritise vegetables and protein.', next: 'Target below 6.1 mmol/L.' },
    { rec: 'Diabetic range. Medical review required. Work with your GP on a management plan alongside dietary changes.', next: 'Target below 7.0 mmol/L.' },
    { rec: 'High diabetic range. Seek medical guidance immediately.', next: 'Target below 7.8 mmol/L.' },
    { rec: 'Critical range. See a doctor today.', next: 'Seek medical attention now.' },
  ],
  // 7: Wellbeing Score
  [
    { rec: 'Thriving. Keep the habits that got you here \u2014 sleep, movement, strength, connection, purpose.', next: 'Maintain. Protect what\u2019s working.' },
    { rec: 'Excellent. Identify which single habit would nudge this to thriving and lean in.', next: 'Push for 9+.' },
    { rec: 'Very good. Small consistency gains in sleep and movement will pay off quickly.', next: 'Push for 8+.' },
    { rec: 'Good. Add one habit focused on connection or purpose alongside physical habits.', next: 'Push for 7+.' },
    { rec: 'Average. Reassess where you spend your time and energy \u2014 cut what drains you, add what fills you.', next: 'Push for 6+.' },
    { rec: 'Struggling. Talk to someone you trust. Prioritise sleep, movement and social contact.', next: 'Push for 5+. Book a catch-up with a friend.' },
    { rec: 'Low. Consider speaking to your GP or a therapist. You don\u2019t have to do this alone.', next: 'Book a GP or therapist appointment this week.' },
    { rec: 'Crisis range. Please reach out \u2014 GP, helpline, or someone you trust \u2014 today.', next: 'Seek support now.' },
  ],
];
