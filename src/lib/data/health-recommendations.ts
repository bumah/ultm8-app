export interface Recommendation {
  rec: string;
  next: string;
}

// BRECS: behaviour recommendations indexed by [behaviourIndex][tierScore (1-4)]
export const BRECS: Record<number, Recommendation>[] = [
  // 0: Sleep
  {
    1: { rec: 'Fewer than 5 hours is severely impacting your recovery, metabolism and cardiovascular health. Set a fixed bedtime and wake time — even on weekends. Remove screens 60 minutes before bed.', next: 'Get to 5–6 hours consistently as your first target.' },
    2: { rec: 'You are getting some sleep but not enough for full recovery. Prioritise a consistent sleep schedule above almost everything else. Keep your room cool and dark. Avoid caffeine after 2pm.', next: 'Aim for 6–7 hours consistently. Track your bedtime for 2 weeks.' },
    3: { rec: 'You are close to optimal. A small improvement in sleep quality or duration will have a noticeable impact on your resting heart rate. Consider a wind-down routine and limiting alcohol.', next: 'Push to a consistent 7–9 hours. Focus on quality as much as quantity.' },
    4: { rec: 'Excellent. You are doing the most important thing in health consistently. Protect this habit aggressively — it is the foundation everything else builds on.', next: 'Maintain. Track sleep quality with a wearable if possible.' },
  },
  // 1: Smoking
  {
    1: { rec: 'Daily smoking at this level is the single biggest risk factor in your health profile. It is directly elevating your blood pressure, lowering your good cholesterol, and raising your resting heart rate every single day. Speak to your GP about cessation support immediately.', next: 'Set a quit date. Book a GP appointment this week.' },
    2: { rec: 'Even at lower levels, daily smoking or regular vaping causes cumulative cardiovascular damage. There is no safe level of daily tobacco use. Use nicotine replacement therapy to manage cravings while you quit.', next: 'Cut to occasional only. Set a quit date within the next 88 days.' },
    3: { rec: 'Occasional smoking still carries risk — but you are in a position to stop entirely. If you have recently quit, stay the course. The cardiovascular benefits of quitting begin within weeks.', next: 'Stop completely. Join a cessation programme for support if needed.' },
    4: { rec: 'Not smoking is one of the most significant contributions to your long-term health. Your blood pressure, cholesterol, and resting heart rate all benefit directly.', next: 'Maintain. Avoid passive smoke exposure where possible.' },
  },
  // 2: Strength
  {
    1: { rec: 'Without any strength training, muscle mass naturally declines — accelerating from your 30s onwards. Start with 2 sessions per week of bodyweight exercises — squats, push-ups, rows. You do not need a gym.', next: 'Commit to 2 strength sessions per week for the first season.' },
    2: { rec: 'One session a week is a start but not enough to build or maintain muscle effectively. Add a second session this week. Keep it simple — 3 compound exercises per session, 3 sets each.', next: 'Add one more session per week. Two is the minimum for progress.' },
    3: { rec: 'Two sessions a week is solid. To build and improve your muscle mass score add a third session or increase the weight progressively each week.', next: 'Add a third session per week or increase weight progressively.' },
    4: { rec: 'Three or more sessions with progressive overload is optimal. Track muscle mass quarterly. If your score is lower than expected review your protein intake — aim for 1.6–2g per kg bodyweight daily.', next: 'Maintain and track. Ensure protein intake matches your training volume.' },
  },
  // 3: Sweat
  {
    1: { rec: 'No intentional cardio means your cardiovascular system is not being challenged. Start with 20 minute walks daily — this alone will begin to lower resting heart rate within weeks.', next: 'Start with 3 x 20 min walks or light cardio sessions per week.' },
    2: { rec: 'Once a week is better than nothing but your heart needs more consistent challenge. Add a second session this week — even a 25 minute jog or cycle.', next: 'Build to 2–3 sessions per week. Any elevated heart rate counts.' },
    3: { rec: 'Two to three sessions per week is a solid base. To push your resting heart rate lower add one interval session per week — alternating between fast and slow efforts for 20 minutes.', next: 'Add one interval or tempo session to your weekly routine.' },
    4: { rec: 'Four or more sessions with elevated heart rate is excellent. Mix steady state, intervals, and tempo to continue improving. Monitor resting heart rate as the key signal.', next: 'Maintain and add variety. Track resting heart rate to confirm adaptation.' },
  },
  // 4: Sugar
  {
    1: { rec: 'Daily sugar consumption is directly driving your blood sugar levels and contributing to body fat accumulation. Start with one change — eliminate sugary drinks completely.', next: 'Cut sugary drinks first. Replace with water or unsweetened options.' },
    2: { rec: 'You are aware of the issue but not yet consistent. Replace sugary snacks with whole food alternatives — fruit, nuts, yoghurt. Read food labels.', next: 'Reduce to 2–3 times per week maximum. Read labels on packaged food.' },
    3: { rec: 'A few times a week is much better than daily. Identify your remaining sugar triggers and build a specific response for each.', next: 'Identify your remaining triggers and build a specific habit response.' },
    4: { rec: 'Excellent discipline. Low sugar intake is directly protecting your blood sugar levels and supporting healthy body composition. Continue reading labels.', next: 'Maintain. Watch for hidden sugars in sauces, cereals, and packaged food.' },
  },
  // 5: Salt
  {
    1: { rec: 'High sodium intake at this level is putting consistent upward pressure on your blood pressure. The biggest wins come from reducing processed food — ready meals, crisps, deli meat, canned soup.', next: 'Replace one processed meal per day with a home-cooked alternative.' },
    2: { rec: 'You are consuming above optimal sodium regularly. Stop adding salt at the table, or eliminate one processed food staple. Your blood pressure will respond within weeks.', next: 'Remove the salt shaker from the table and check labels on packaged food.' },
    3: { rec: 'You are aware and mostly in control. Cook from scratch more often and season with herbs and spices instead of salt. Your palate will adapt within a few weeks.', next: 'Cook from scratch 5 out of 7 days and use herbs instead of salt.' },
    4: { rec: 'Consistently low sodium is one of the most protective behaviours for blood pressure. Continue reading labels — sodium hides in bread, sauces and cereals.', next: 'Maintain. Check labels on bread and sauces which are hidden sodium sources.' },
  },
  // 6: Spirits
  {
    1: { rec: 'Daily or heavy weekend drinking is raising your blood pressure, disrupting your sleep, lowering your good cholesterol, and impairing recovery. Start by introducing 4 alcohol-free days per week.', next: 'Introduce 4 alcohol-free days per week immediately.' },
    2: { rec: 'Drinking several times a week has a compounding effect on blood pressure and cholesterol. Reduce to once a week for one season and track the impact on your resting heart rate and sleep quality.', next: 'Reduce to one drinking occasion per week maximum.' },
    3: { rec: 'Occasional drinking is manageable but still affects sleep quality at low levels. Track your resting heart rate on days after drinking versus alcohol-free days.', next: 'Try extending to 2–3 week alcohol-free periods to see the full benefit.' },
    4: { rec: 'Not drinking gives your cardiovascular system, liver, and sleep quality a significant advantage. Your blood pressure and cholesterol both benefit directly.', next: 'Maintain. Your lagging indicators should reflect this advantage.' },
  },
  // 7: Stress
  {
    1: { rec: 'Chronic stress with no management strategy is elevating your cortisol continuously — raising blood pressure, disrupting sleep, and suppressing your immune system. Start with 5 minutes of slow breathing daily.', next: 'Start with 5 minutes of slow breathing every morning for 30 days.' },
    2: { rec: 'You have some awareness but inconsistency means stress is still accumulating. Build one non-negotiable stress management habit — a daily walk, morning breathing, journaling, or meditation.', next: 'Commit to one stress management habit daily for the next 88 days.' },
    3: { rec: 'You are managing reasonably well. Identify your highest stress triggers and build a specific response for each.', next: 'Identify your top 2 stress triggers and build a specific response for each.' },
    4: { rec: 'Consistent stress management is protecting your blood pressure and resting heart rate directly. Protect the habits that make them possible.', next: 'Maintain your practices. Protect the boundaries that make them possible.' },
  },
];

// HRECS: indicator recommendations indexed by [indicatorIndex][0-7 where 0=best, 7=worst]
// Note: array index 0 = score 8 (best), index 7 = score 1 (worst)
export const HRECS: Recommendation[][] = [
  // 0: Blood Pressure
  [
    { rec: 'Optimal. Maintain low sodium intake, daily movement, manage stress, and check quarterly.', next: 'Maintain. Keep salt low, stay active, and manage stress.' },
    { rec: 'Almost there. Cut sodium below 2g/day, add 20 mins of daily walking, and practise a stress reduction habit.', next: 'Target below 110 mmHg.' },
    { rec: 'Very close to optimal. Focus on reducing salt, limiting alcohol, and getting 7-8 hours of sleep consistently.', next: 'Target below 115 mmHg.' },
    { rec: 'Good progress. Increase cardio to 150 mins per week, reduce processed food, and monitor weekly.', next: 'Target below 120 mmHg.' },
    { rec: 'Getting there. Prioritise sleep, reduce caffeine after midday, and speak to your GP about monitoring regularly.', next: 'Target below 130 mmHg.' },
    { rec: 'Work to do. Reduce salt and alcohol significantly, start a daily walking habit, and book a GP check-up.', next: 'Target below 140 mmHg.' },
    { rec: 'This needs attention. Book a GP appointment. Medication may be needed alongside lifestyle changes.', next: 'Target below 160 mmHg.' },
    { rec: 'This is a medical emergency range. See a doctor immediately.', next: 'Seek medical attention now.' },
  ],
  // 1: Blood Sugar
  [
    { rec: 'Optimal. Keep refined sugar and processed carbs low. Continue regular movement and maintain your current diet.', next: 'Maintain. Keep sugar and refined carbs low.' },
    { rec: 'Very good. Reduce sugar intake further — cut sugary drinks and snacks. Add a 10 min walk after meals.', next: 'Target below 4.5 mmol/L.' },
    { rec: 'Normal but room to improve. Reduce refined carbohydrates, increase fibre, and exercise after meals.', next: 'Target below 5.1 mmol/L.' },
    { rec: 'Pre-diabetic range. Reduce sugar and white carbs significantly. Aim for 30 mins of moderate exercise daily.', next: 'Target below 5.6 mmol/L.' },
    { rec: 'Pre-diabetic. See your GP. Focus on diet — eliminate sugary drinks, reduce portion sizes, prioritise vegetables and protein.', next: 'Target below 6.1 mmol/L.' },
    { rec: 'Diabetic range. Medical review required. Work with your GP on a management plan alongside dietary changes.', next: 'Target below 7.0 mmol/L.' },
    { rec: 'High diabetic range. Seek medical guidance immediately.', next: 'Target below 7.8 mmol/L.' },
    { rec: 'Critical range. See a doctor today.', next: 'Seek medical attention now.' },
  ],
  // 2: Cholesterol
  [
    { rec: 'Optimal. Maintain a diet low in saturated fat, keep exercising, and check annually.', next: 'Maintain. Keep saturated fat low and exercise consistently.' },
    { rec: 'Very good. Reduce saturated fat slightly — swap red meat for fish twice a week and increase oats and nuts.', next: 'Target below 3.5 mmol/L.' },
    { rec: 'Good. Increase omega-3 rich foods, reduce saturated fat, and increase fibre.', next: 'Target below 4.0 mmol/L.' },
    { rec: 'Borderline. Cut processed food, increase plant-based meals, and add 30 mins of cardio 4x per week.', next: 'Target below 4.5 mmol/L.' },
    { rec: 'Above optimal. Reduce saturated and trans fats significantly. Increase soluble fibre. Check with GP annually.', next: 'Target below 5.0 mmol/L.' },
    { rec: 'High. Dietary changes alone may not be sufficient. Book a GP review.', next: 'Target below 5.5 mmol/L.' },
    { rec: 'Very high. GP review required. Medication alongside lifestyle change is likely needed.', next: 'Target below 6.5 mmol/L.' },
    { rec: 'Critical. Seek medical advice immediately.', next: 'Seek medical attention now.' },
  ],
  // 3: Resting HR
  [
    { rec: 'Athlete level. Maintain your cardio training and prioritise recovery.', next: 'Maintain. Monitor for overtraining.' },
    { rec: 'Excellent. Keep up consistent cardio. Add one higher intensity session per week.', next: 'Target below 50 bpm.' },
    { rec: 'Very good. Add one interval training session per week — alternating fast and slow pace for 20 mins.', next: 'Target below 60 bpm.' },
    { rec: 'Good. Aim for 150 mins of moderate cardio per week.', next: 'Target below 65 bpm.' },
    { rec: 'Average. Build a consistent cardio habit — 30 mins walking or cycling daily is enough to start moving this.', next: 'Target below 70 bpm.' },
    { rec: 'Above average but manageable. Start with daily 20 min walks and build up. Reduce caffeine and improve sleep.', next: 'Target below 80 bpm.' },
    { rec: 'High. Begin gentle daily movement — walking is fine. Reduce stress and improve sleep as a priority.', next: 'Target below 90 bpm.' },
    { rec: 'Very high. Consult your GP before starting any exercise programme.', next: 'Seek medical advice before exercising.' },
  ],
  // 4: Body Fat
  [
    { rec: 'Optimal. Maintain through consistent training and a protein-rich, whole food diet.', next: 'Maintain. Keep training consistent and diet clean.' },
    { rec: 'Fit range. Small tweaks to diet — slightly reduce processed carbs and increase protein.', next: 'Target optimal range for your gender.' },
    { rec: 'Acceptable. Increase training frequency to 4x per week and track calorie intake for 2-4 weeks.', next: 'Target fit range for your gender.' },
    { rec: 'Above average. Focus on building lean muscle through strength training 3x per week.', next: 'Target acceptable range for your gender.' },
    { rec: 'High. Combine cardio 3x week with strength training 2x week. Prioritise whole foods.', next: 'Target above average range for your gender.' },
    { rec: 'Very high. Start with daily walks, remove sugary drinks, reduce portion sizes.', next: 'Target high range as your first step.' },
    { rec: 'Obese range. Focus on sustainable habits. Speak to your GP about a structured approach.', next: 'Speak to your GP about a structured plan.' },
    { rec: 'Severely obese. Seek medical guidance for a structured programme.', next: 'Seek medical support immediately.' },
  ],
  // 5: Muscle Mass
  [
    { rec: 'Optimal. Maintain with 3x strength training per week and high protein intake.', next: 'Maintain. Keep lifting and keep protein high.' },
    { rec: 'Excellent. Add one more strength session or increase volume. Focus on progressive overload.', next: 'Target optimal range for your gender.' },
    { rec: 'Good. Prioritise strength training over cardio for the next season. Increase protein to at least 1.6g per kg.', next: 'Target excellent range for your gender.' },
    { rec: 'Average. Commit to 3x strength training per week consistently. Add protein to every meal.', next: 'Target good range for your gender.' },
    { rec: 'Below average. Start a beginner strength programme 2-3 sessions per week. Focus on compound movements.', next: 'Target average range for your gender.' },
    { rec: 'Low. Muscle loss may be significant. Start with bodyweight exercises and increase protein immediately.', next: 'Target below average range for your gender.' },
    { rec: 'Very low. Prioritise muscle building as your number one health goal.', next: 'See a trainer or physio for a structured start.' },
    { rec: 'Critical. Muscle mass at this level significantly increases health risk. Seek medical advice.', next: 'Seek medical guidance immediately.' },
  ],
  // 6: Push-ups
  [
    { rec: 'Optimal. Maintain by including push-ups in your weekly routine. Try variations — decline, weighted.', next: 'Maintain. Try harder variations to keep progressing.' },
    { rec: 'Excellent. Add push-ups to your daily routine — even 2-3 sets at the end of each day.', next: 'Target optimal range for your gender.' },
    { rec: 'Very good. Increase volume — add an extra set each week. Slow the movement down.', next: 'Target excellent range for your gender.' },
    { rec: 'Good. Do push-ups 4x per week. Try 3 sets to failure each session.', next: 'Target very good range for your gender.' },
    { rec: 'Average. Commit to push-ups every other day. Start with 3 sets of 10 and add reps weekly.', next: 'Target good range for your gender.' },
    { rec: 'Developing. Start with 3 sets of 5-8 three times per week. Focus on form.', next: 'Target average range for your gender.' },
    { rec: 'Building. If you cannot do a full push-up yet start on your knees. Form first, reps second.', next: 'Target developing range for your gender.' },
    { rec: 'Start here. Begin with wall push-ups or knee push-ups and build from there.', next: 'Target building range for your gender.' },
  ],
  // 7: 5km Run
  [
    { rec: 'Optimal. You are a strong runner. Enter a Parkrun or local 5km event to keep pushing your pace.', next: 'Maintain. Race regularly to stay motivated.' },
    { rec: 'Excellent. Add one interval training session per week — 6x 400m at a hard pace with rest in between.', next: 'Target optimal range for your gender.' },
    { rec: 'Very good. Add one tempo run per week — 20 mins at a comfortably hard pace.', next: 'Target excellent range for your gender.' },
    { rec: 'Good. Run 3x per week — one easy, one slightly faster, one longer.', next: 'Target very good range for your gender.' },
    { rec: 'Average. Increase running frequency to 3x per week. Parkrun every Saturday is a perfect structure.', next: 'Target good range for your gender.' },
    { rec: 'Developing. Build your base — run/walk 3x per week. Time in motion is what matters.', next: 'Target average range for your gender.' },
    { rec: 'Starting out. Walk/run intervals are perfect. Start with 1 min run, 2 mins walk, repeat.', next: 'Target developing range for your gender.' },
    { rec: 'Start here. Begin with regular brisk walking and build to walk/run intervals.', next: 'Target starting out range for your gender.' },
  ],
];
