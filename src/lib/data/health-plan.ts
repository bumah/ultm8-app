export interface PlanBehaviourDef {
  behaviour: string;
  type: 'increase' | 'reduce';
  plans: string[][];  // plans[trackIndex][weekIndex] — 4 tracks x 8 weeks
}

export const HEALTH_PLAN: PlanBehaviourDef[] = [
  { behaviour: 'Sleep', type: 'increase', plans: [
    ['At least 5hrs, 3 nights','At least 5hrs, 5 nights','At least 5.5hrs, 4 nights','At least 5.5hrs, 5 nights','At least 6hrs, 4 nights','At least 6hrs, 5 nights','At least 6hrs, 6 nights','At least 6hrs every night'],
    ['At least 6.5hrs, 4 nights','At least 6.5hrs, 5 nights','At least 7hrs, 3 nights','At least 7hrs, 4 nights','At least 7hrs, 5 nights','At least 7hrs, 6 nights','At least 7hrs, 6 nights','At least 7hrs every night'],
    ['At least 7.5hrs, 4 nights','At least 7.5hrs, 5 nights','At least 8hrs, 3 nights','At least 8hrs, 4 nights','At least 8hrs, 5 nights','At least 8hrs, 6 nights','At least 8-9hrs, 5 nights','At least 7-9hrs every night'],
    ['Protect your 7-9hrs every night','Track sleep quality','Protect your 7-9hrs every night','Track sleep quality','Protect your 7-9hrs every night','Track sleep quality','Protect your 7-9hrs every night','Maintain — track quality with a wearable'],
  ]},
  { behaviour: 'Smoking', type: 'reduce', plans: [
    ['Limit to 8 per day','Limit to 7 per day','Limit to 6 per day','Limit to 5 per day','Limit to 4 per day','Limit to 3 per day','Limit to 2 per day','Limit to 1 per day — set quit date'],
    ['Limit to 4 per day','Limit to 3 per day','Limit to 2 per day','Limit to 1 per day','Smoke-free on weekdays','No more than 2 this week','No more than 1 this week','Smoke-free week — GP appointment booked'],
    ['No more than 2 this week','No more than 1 this week','Smoke-free week','Smoke-free week — identify triggers','Address top trigger this week','Smoke-free week','Smoke-free week','Fully smoke-free — celebrate the milestone'],
    ['Stay smoke-free','Note social pressure moments','Stay smoke-free','Have a plan for high-risk situations','Stay smoke-free','Note social pressure moments','Stay smoke-free','Maintain — smoke-free all season'],
  ]},
  { behaviour: 'Strength', type: 'increase', plans: [
    ['At least 1 session, 15 mins','At least 1 session, 20 mins','At least 1 session, 30 mins','At least 1 session — try a new exercise','At least 2 sessions this week','At least 2 sessions, 30 mins each','At least 2 sessions — add weight','At least 2 sessions, progressive overload'],
    ['At least 2 sessions this week','At least 2 sessions — increase weight','At least 3 sessions this week','At least 3 sessions, 25 mins each','At least 3 sessions, 30 mins each','At least 3 sessions — add weight on 2 lifts','At least 3 sessions, progressive overload','At least 3 sessions — track weights and reps'],
    ['At least 3 sessions this week','At least 3 sessions — add volume','At least 3 sessions — add weight on all lifts','At least 3 sessions, track progress','At least 3-4 sessions, consistent overload','At least 3-4 sessions — review protein intake','At least 3-4 sessions, progressive overload','At least 3+ sessions — protein 1.6g/kg daily'],
    ['At least 3+ sessions weekly','Track weights every session','At least 3+ sessions weekly','Ensure protein hits 1.6-2g/kg','At least 3+ sessions weekly','Check muscle mass this week','At least 3+ sessions weekly','Maintain — track and protect'],
  ]},
  { behaviour: 'Sweat', type: 'increase', plans: [
    ['At least 1 walk, 20 mins','At least 2 walks, 20 mins','At least 1 elevated HR session, 20 mins','At least 1 elevated HR session, 25 mins','At least 2 sessions, 20 mins each','At least 2 sessions, 25 mins each','At least 2 sessions — push intensity','At least 2 solid cardio sessions, 25+ mins'],
    ['At least 2 sessions, 20 mins each','At least 2 sessions, 25 mins each','At least 3 sessions this week','At least 3 sessions, 25 mins each','At least 3 sessions — one at higher intensity','At least 3 sessions, 30 mins each','At least 3 sessions — one interval session','At least 3 solid sessions, mixed intensity'],
    ['At least 4 sessions this week','At least 4 sessions — one interval','At least 4 sessions — two at higher intensity','At least 4 sessions, one tempo run','At least 4 sessions — mix steady and intervals','At least 4 sessions — track resting HR','At least 4-5 sessions, consistent effort','At least 4+ sessions — mixed intensity'],
    ['At least 4+ sessions this week','Track resting HR as key signal','At least 4+ sessions this week','Mix steady state, intervals, tempo','At least 4+ sessions this week','Monitor resting HR weekly','At least 4+ sessions this week','Maintain — protect your cardio habit'],
  ]},
  { behaviour: 'Sugar', type: 'reduce', plans: [
    ['Limit sugary drinks to once a day','No more than 5 sugary drinks this week','No more than 3 sugary drinks this week','No more than 1 sugary drink this week','No sugary drinks — limit sugary meals to 3','No sugary drinks — limit sugary meals to 2','No sugary drinks — limit sugary meals to 1','No sugary drinks. No more than 1 sugary meal.'],
    ['No more than 4 sugary drinks this week','No more than 2 sugary drinks this week','No more than 1 sugary drink this week','No sugary drinks — limit sugary meals to 4','No sugary drinks — limit sugary meals to 3','No sugary drinks — limit sugary meals to 2','No sugary drinks — limit sugary meals to 1','No more than 1 sugary meal. Check labels.'],
    ['No sugary drinks this week','No sugary drinks — limit sugary meals to 2','No sugary drinks — limit sugary meals to 1','No added sugar, 5 days this week','No added sugar, 6 days this week','No added sugar all week','No added sugar all week','Rarely added sugar. Check labels on everything.'],
    ['Watch hidden sugars in sauces and cereals','Check labels on packaged food this week','Watch hidden sugars in bread','Check labels on packaged food this week','Watch hidden sugars in sauces and cereals','Check labels on packaged food this week','Watch hidden sugars in bread','Maintain — labels on everything'],
  ]},
  { behaviour: 'Salt', type: 'reduce', plans: [
    ['Limit salty snacks to once a day','No more than 5 salty meals this week','No more than 4 salty meals this week','No more than 3 salty meals this week','No more than 2 salty meals this week','No more than 1 salty meal this week','No salty processed meals this week','No more than 1 salty meal per week'],
    ['No more than 4 salty meals this week','No more than 3 salty meals this week','No more than 2 salty meals this week','No more than 1 salty meal this week','No salty meals — check labels this week','No salty meals — check all labels','No salty meals — check bread and sauces','No more than 1 salty meal. Labels checked.'],
    ['No more than 2 salty meals this week','No more than 1 salty meal this week','No salty processed meals this week','Check labels on all packaged food','No salty meals — check labels','No salty meals — check bread and sauces','No salty meals — labels always checked','Fully low sodium. Labels on everything.'],
    ['Watch hidden sodium in bread and sauces','Check labels on packaged food this week','Watch hidden sodium in cereals','Check labels on packaged food this week','Watch hidden sodium in bread and sauces','Check labels on packaged food this week','Watch hidden sodium in cereals','Maintain — labels on everything'],
  ]},
  { behaviour: 'Spirits', type: 'reduce', plans: [
    ['No more than 5 drinking days this week','No more than 4 drinking days this week','No more than 3 drinking days this week','No more than 3 days — max 2 drinks each','No more than 2 drinking days this week','No more than 2 days — max 2 drinks each','No more than 1 drinking day this week','No more than 1 drinking day — low units'],
    ['No more than 3 drinking days this week','No more than 3 days — reduce units','No more than 2 drinking days this week','No more than 2 days — max 2 drinks each','No more than 1 drinking day this week','No more than 1 day — max 2 drinks','No more than 1 drinking day this week','No more than 1 occasion per week — low units'],
    ['No more than 2 drinking days this week','No more than 1 drinking day this week','No alcohol this week','No alcohol this week — note sleep quality','No more than 1 occasion this fortnight','No more than 1 occasion this fortnight','No alcohol this week','No more than 1 occasion per week — track impact'],
    ['No more than 1 occasion this week','Track resting HR and sleep quality','No more than 1 occasion this week','Note energy and sleep on alcohol-free days','No more than 1 occasion this week','Track resting HR and sleep quality','No more than 1 occasion this week','Maintain — track the difference it makes'],
  ]},
  { behaviour: 'Stress', type: 'increase', plans: [
    ['At least 3 mins breathing, 3 mornings','At least 3 mins breathing, 5 mornings','At least 5 mins breathing, 5 mornings','At least 5 mins daily — note your top trigger','At least 5 mins daily — act on that trigger','At least 5 mins daily — address top trigger','At least 10 mins daily','At least 10 mins daily — top trigger addressed'],
    ['At least 5 mins breathing daily','At least 5 mins daily — identify top 2 triggers','At least 10 mins daily','At least 10 mins daily — act on trigger 1','At least 10 mins daily — trigger 1 addressed','At least 10 mins daily — act on trigger 2','At least 15 mins daily','At least 15 mins daily — both triggers addressed'],
    ['At least 10 mins daily — no exceptions','At least 10 mins — identify all major triggers','At least 15 mins daily','At least 15 mins — address trigger 1','At least 15 mins — address trigger 2','Full daily practice — review trigger progress','Protect the habits that make practice possible','Consistent daily practice — triggers managed'],
    ['Maintain your daily practice','Protect sleep, boundaries and recovery time','Maintain your daily practice','Protect sleep, boundaries and recovery time','Maintain your daily practice','Protect sleep, boundaries and recovery time','Maintain your daily practice','Maintain — stress compounds when foundations slip'],
  ]},
];
