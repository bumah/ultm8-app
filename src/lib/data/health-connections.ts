type InsightFn = (bs: number[], hs: number[]) => string;

export const CONN_INSIGHTS: InsightFn[] = [
  // 0: Blood Pressure
  (bs, hs) => {
    const weak: string[] = [];
    const strong: string[] = [];
    ([[1, bs[1], 'Smoking'], [5, bs[5], 'Salt'], [6, bs[6], 'Spirits'], [7, bs[7], 'Stress']] as [number, number, string][]).forEach(([, score, name]) => {
      if (score <= 2) weak.push(name); else strong.push(name);
    });
    let txt = 'Your blood pressure is directly impacted by your Salt, Spirits, Smoking and Stress habits. ';
    if (weak.length && strong.length) txt += weak.join(' and ') + ' are actively pushing your blood pressure up. ' + strong.join(' and ') + ' are working in your favour. ';
    else if (weak.length) txt += weak.join(', ') + ' are actively pushing your blood pressure up. ';
    else txt += 'All four habits are currently working in your favour. ';
    if (weak.length) txt += 'Improving ' + weak[0] + ' can be your fastest route to a better blood pressure reading.';
    else txt += 'Keep these habits consistent to maintain your reading.';
    return txt;
  },

  // 1: Blood Sugar
  (bs, hs) => {
    const s = bs[4];
    let txt = 'Your blood sugar is directly impacted by your Sugar habit. ';
    if (s <= 2) txt += 'Your current sugar consumption is actively pushing your blood glucose up. Improving your Sugar habit can be your fastest route to a better reading.';
    else txt += 'Your Sugar habit is currently working in your favour. Keep it consistent to maintain your blood glucose level.';
    return txt;
  },

  // 2: Cholesterol
  (bs, hs) => {
    const weak: string[] = [];
    const strong: string[] = [];
    ([[1, bs[1], 'Smoking'], [6, bs[6], 'Spirits']] as [number, number, string][]).forEach(([, score, name]) => {
      if (score <= 2) weak.push(name); else strong.push(name);
    });
    let txt = 'Your cholesterol is directly impacted by your Smoking and Spirits habits. ';
    if (weak.length && strong.length) txt += weak.join(' and ') + ' are actively pushing your cholesterol up. ' + strong.join(' and ') + ' are working in your favour. ';
    else if (weak.length) txt += weak.join(' and ') + ' are actively working against your cholesterol. ';
    else txt += 'Both habits are currently working in your favour. ';
    if (weak.length) txt += 'Improving ' + weak[0] + ' can be your fastest route to a better reading.';
    else txt += 'Keep these habits consistent to protect your cholesterol level.';
    return txt;
  },

  // 3: Resting HR
  (bs, hs) => {
    const weak: string[] = [];
    const strong: string[] = [];
    ([[0, bs[0], 'Sleep'], [1, bs[1], 'Smoking'], [3, bs[3], 'Sweat'], [7, bs[7], 'Stress']] as [number, number, string][]).forEach(([, score, name]) => {
      if (score <= 2) weak.push(name); else strong.push(name);
    });
    let txt = 'Your resting heart rate is directly impacted by your Sleep, Smoking, Sweat and Stress habits. ';
    if (strong.length) txt += strong.join(' and ') + ' are working in your favour. ';
    if (weak.length) txt += weak.join(' and ') + ' are actively keeping it elevated. ';
    if (weak.length) txt += 'Improving ' + weak[0] + ' can be your fastest route to a lower resting heart rate.';
    else txt += 'Keep these habits consistent to maintain your reading.';
    return txt;
  },

  // 4: Body Fat
  (bs, hs) => {
    const weak: string[] = [];
    const strong: string[] = [];
    ([[3, bs[3], 'Sweat'], [4, bs[4], 'Sugar']] as [number, number, string][]).forEach(([, score, name]) => {
      if (score <= 2) weak.push(name); else strong.push(name);
    });
    let txt = 'Your body fat is directly impacted by your Sweat and Sugar habits. ';
    if (weak.length && strong.length) txt += weak.join(' and ') + ' are actively working against you here. ' + strong.join(' and ') + ' are working in your favour. ';
    else if (weak.length) txt += weak.join(' and ') + ' are actively working against your body composition. ';
    else txt += 'Both habits are currently working in your favour. ';
    if (weak.length) txt += 'Improving ' + weak[0] + ' can be your fastest route to a better body fat reading.';
    else txt += 'Keep these habits consistent to maintain your body composition.';
    return txt;
  },

  // 5: Muscle Mass
  (bs, hs) => {
    const s = bs[2];
    let txt = 'Your muscle mass is directly impacted by your Strength habit. ';
    if (s <= 2) txt += 'Your current strength training frequency is actively limiting your muscle mass. Improving your Strength habit can be your fastest route to a better reading.';
    else if (s === 3) txt += 'Your Strength habit is working in your favour. Adding one more session per week can push your muscle mass to the next level.';
    else txt += 'Your Strength habit is at its best. Keep your training consistent and protein intake high to maintain your muscle mass.';
    return txt;
  },

  // 6: Push-ups
  (bs, hs) => {
    const weak: string[] = [];
    const strong: string[] = [];
    ([[2, bs[2], 'Strength'], [3, bs[3], 'Sweat']] as [number, number, string][]).forEach(([, score, name]) => {
      if (score <= 2) weak.push(name); else strong.push(name);
    });
    let txt = 'Your push-up performance is directly impacted by your Strength and Sweat habits. ';
    if (weak.length && strong.length) txt += weak.join(' and ') + ' are holding your performance back. ' + strong.join(' and ') + ' are working in your favour. ';
    else if (weak.length) txt += weak.join(' and ') + ' are actively limiting your push-up capacity. ';
    else txt += 'Both habits are working in your favour. ';
    if (weak.length) txt += 'Improving ' + weak[0] + ' can be your fastest route to a higher push-up score.';
    else txt += 'Keep training consistently to maintain and improve your performance.';
    return txt;
  },

  // 7: 5km Run
  (bs, hs) => {
    const s = bs[3];
    let txt = 'Your 5km time is directly impacted by your Sweat habit. ';
    if (s <= 2) txt += 'Your current cardio frequency is actively limiting your endurance. Improving your Sweat habit can be your fastest route to a better 5km time.';
    else if (s === 3) txt += 'Your Sweat habit is working in your favour. Adding one interval session per week can push your time to the next level.';
    else txt += 'Your Sweat habit is at its best. Mix steady state, intervals and tempo sessions to keep improving.';
    return txt;
  },
];
