type InsightFn = (bs: number[], hs: number[]) => string;

// Insight generators per indicator. Order matches HLABELS v2:
// 0 Blood Pressure, 1 Weight, 2 Waist, 3 Resting HR, 4 Body Fat,
// 5 Sleep Quality, 6 Blood Sugar, 7 Wellbeing Score.
// Each generator inspects behaviour scores (bs, 0-7 by behaviour index) and
// summarises which habits are helping vs holding the indicator back.

function summarise(
  drivers: [number, string][],
  bs: number[],
  indicatorPhrase: string,
  improveHint: string,
  maintainHint: string,
): string {
  const weak: string[] = [];
  const strong: string[] = [];
  drivers.forEach(([bIndex, name]) => {
    const score = bs[bIndex] ?? 0;
    if (score <= 0) weak.push(name);
    else strong.push(name);
  });
  const list = drivers.map(d => d[1]).join(', ').replace(/, ([^,]*)$/, ' and $1');
  let txt = `Your ${indicatorPhrase} is directly impacted by your ${list} habits. `;
  if (weak.length && strong.length) {
    txt += `${weak.join(' and ')} ${weak.length > 1 ? 'are' : 'is'} working against you. `;
    txt += `${strong.join(' and ')} ${strong.length > 1 ? 'are' : 'is'} working in your favour. `;
  } else if (weak.length) {
    txt += `${weak.join(' and ')} ${weak.length > 1 ? 'are' : 'is'} actively working against you. `;
  } else {
    txt += 'All these habits are currently working in your favour. ';
  }
  txt += weak.length ? `Improving ${weak[0]} is your fastest route to ${improveHint}.` : maintainHint;
  return txt;
}

export const CONN_INSIGHTS: InsightFn[] = [
  // 0: Blood Pressure
  (bs) => summarise(
    [[1, 'Smoking'], [5, 'Salt'], [6, 'Spirits'], [7, 'Stress']],
    bs,
    'blood pressure',
    'a better reading',
    'Keep these habits consistent to maintain your reading.',
  ),

  // 1: Weight
  (bs) => summarise(
    [[2, 'Strength'], [3, 'Sweat'], [4, 'Sugar']],
    bs,
    'weight',
    'a healthier weight',
    'Keep training and diet consistent to hold this weight.',
  ),

  // 2: Waist
  (bs) => summarise(
    [[3, 'Sweat'], [4, 'Sugar']],
    bs,
    'waist',
    'a lower waist measurement',
    'Keep cardio and sugar low to protect this measurement.',
  ),

  // 3: Resting HR
  (bs) => summarise(
    [[0, 'Sleep'], [1, 'Smoking'], [3, 'Sweat'], [7, 'Stress']],
    bs,
    'resting heart rate',
    'a lower resting heart rate',
    'Keep these habits consistent to maintain your reading.',
  ),

  // 4: Body Fat
  (bs) => summarise(
    [[2, 'Strength'], [3, 'Sweat'], [4, 'Sugar']],
    bs,
    'body fat',
    'a better body composition',
    'Keep these habits consistent to maintain your composition.',
  ),

  // 5: Sleep Quality
  (bs) => summarise(
    [[0, 'Sleep'], [6, 'Spirits'], [7, 'Stress']],
    bs,
    'sleep quality',
    'better sleep',
    'Protect these habits to keep sleep quality high.',
  ),

  // 6: Blood Sugar
  (bs) => summarise(
    [[4, 'Sugar'], [3, 'Sweat']],
    bs,
    'blood sugar',
    'a better reading',
    'Keep sugar low and cardio consistent to maintain your level.',
  ),

  // 7: Wellbeing Score
  (bs) => summarise(
    [[0, 'Sleep'], [2, 'Strength'], [3, 'Sweat'], [7, 'Stress']],
    bs,
    'overall wellbeing',
    'feeling better overall',
    'Protect these foundations to keep feeling good.',
  ),
];
