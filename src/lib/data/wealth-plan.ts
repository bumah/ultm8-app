export interface PlanBehaviourDef {
  behaviour: string;
  type: 'increase' | 'reduce';
  plans: string[][];  // plans[trackIndex][weekIndex] — 4 tracks x 8 weeks
}

// File-aligned wealth behaviours: Active Income, Passive Income, Expenses,
// Discretionary, Savings, Debt Repayment, Retirement, Investment.
export const WEALTH_PLAN: PlanBehaviourDef[] = [
  { behaviour: 'Active Income', type: 'increase', plans: [
    ['Find your exact monthly take-home this week','Track income for a full month','Review take-home vs gross','Identify one skill to increase income','Research one income growth opportunity','Take one action toward income growth','Review income growth progress','Set an income target for next quarter'],
    ['Identify one income growth opportunity','Research it in detail','Take one concrete action','Continue \u2014 income growth takes time','Review progress monthly','Double down on what is working','Set a specific income target','Achieve measurable income growth'],
    ['Identify a new income lever','Plan how to pursue it','Take first action','Continue consistently','Review and adjust','Accelerate the most promising','Set a specific target','Hit measurable income growth'],
    ['Review income monthly','Identify next opportunity','Research it','Plan your approach','Take action','Continue consistently','Review and refine','Set a new annual target'],
  ]},
  { behaviour: 'Passive Income', type: 'increase', plans: [
    ['Research one passive income option','Choose the most realistic','Take one first step','Continue \u2014 takes time','Track any income generated','Reinvest any returns','Review and expand','Have one active passive source'],
    ['Make existing source consistent','Track it monthly','Identify a second option','Begin building it','Track both monthly','Reinvest returns','Review and expand','Have two active sources'],
    ['Review all passive monthly','Grow the largest source','Take action to grow it','Continue growing','Add one new source','Track all sources monthly','Reinvest all returns','Grow total passive meaningfully'],
    ['Review all passive monthly','Reinvest all returns','Identify next opportunity','Take action','Continue growing','Review portfolio','Rebalance if needed','Maintain and grow'],
  ]},
  { behaviour: 'Expenses', type: 'reduce', plans: [
    ['Track all spending this week','Total last month\u2019s expenses','Categorise into needs vs wants','Identify top 3 categories','Find one to reduce by 10%','Reduce that category this week','Track and review progress','Know exact monthly expenses'],
    ['Track total expenses for the month','Categorise everything','Identify two categories to reduce','Reduce category 1','Reduce category 2','Maintain reductions','Find one more area','Keep expenses below target'],
    ['Review last month in detail','Reduce one area by 10%','Confirm the saving','Find another area','Reduce it','Track monthly vs target','Review subscriptions','Hold expenses controlled as income grows'],
    ['Review expenses monthly','Identify lifestyle creep','Address it immediately','Confirm below target','Review subscriptions','Cancel anything unused','Monthly review complete','Maintain \u2014 protect your control'],
  ]},
  { behaviour: 'Discretionary', type: 'reduce', plans: [
    ['Track every non-essential this week','Total discretionary last month','Set a weekly budget','Stick to it this week','Review \u2014 did you hit it?','Continue another week','Review monthly total','Stay under your target'],
    ['Set firm monthly limit','Break into weekly amounts','Track this week','Review \u2014 on target?','Continue another week','Adjust if needed','Confirm under limit','Hold under limit all quarter'],
    ['Review discretionary vs income %','Find largest single category','Set a reduced limit','Track and stick to it','Review on target?','Find one more to reduce','Confirm under 15%','Hold under 15% of income'],
    ['Review discretionary monthly','Check for lifestyle creep','Address what crept up','Confirm under target','Review subscriptions','Cancel anything unused','Monthly review complete','Maintain \u2014 protect against inflation'],
  ]},
  { behaviour: 'Savings', type: 'increase', plans: [
    ['Save any amount this week','Set up a savings account if needed','Save fixed amount on payday','Repeat next payday','Review \u2014 saving consistently?','Increase by a small amount','Continue consistently','Save at least 5% monthly'],
    ['Set up automatic savings on payday','Confirm it ran this month','Increase by 1%','Continue \u2014 automation removes the decision','Review savings total','Increase by another 1%','Confirm consistency','Save at least 10% monthly'],
    ['Review savings rate \u2014 above 15%?','Increase by 1% this month','Automate the increase','Confirm it ran','Review total progress','Increase by another 1%','Target 20% rate','Save at least 20% monthly'],
    ['Review savings rate monthly','Confirm automation','Check any month saved less \u2014 why?','Address the gap','Increase rate with any pay rise','Review total vs goals','Confirm rate maintained','Increase with every pay rise'],
  ]},
  { behaviour: 'Debt Repayment', type: 'reduce', plans: [
    ['List all debts with balances and rates','Order by interest rate highest first','Make minimum payments on all','Add extra to highest interest','Continue this approach','Review total \u2014 reducing?','Confirm a clear plan','Reduce total debt meaningfully'],
    ['Review repayment plan \u2014 on track?','Increase monthly payment a small amount','Continue plan consistently','Review progress','Free up more from elsewhere','Apply it to debt','Review total reduction','Reduce total debt meaningfully'],
    ['Review debt total and plan','Overpay any amount this month','Continue overpaying','Review progress','Find another way to overpay','Apply it','Track monthly reduction','Accelerate your debt-free date'],
    ['Review remaining debt','Maintain overpayments','Track monthly progress','Celebrate milestones','Continue consistently','Review debt-free date','Adjust if circumstances change','Stay on track'],
  ]},
  { behaviour: 'Retirement', type: 'increase', plans: [
    ['Start any pension contribution this month','Confirm contribution running','Find your employer match \u2014 claim it fully','Review pension pot value','Understand projected income','Increase contribution by 1%','Confirm increase running','Contributing consistently'],
    ['Review contribution level','Increase by 1%','Confirm increase ran','Check employer match','Review projected income','Identify if enough','Increase by another 1%','Know projected income and increase'],
    ['Review pension pot value','Check projected income','Identify any gap','Plan how to close it','Increase contributions this month','Confirm the increase','Review progress','Increase contributions and track growth'],
    ['Review pension pot quarterly','Check projected vs target','Increase with every pay rise','Confirm contributions running','Review investment mix','Adjust if needed','Confirm pot is growing','Maintain \u2014 increase with every pay rise'],
  ]},
  { behaviour: 'Investment', type: 'increase', plans: [
    ['Open an ISA or investment account','Deposit any amount','Pick a simple index fund','Set up monthly contribution','Confirm it ran','Invest same amount next month','Review balance','Investing monthly \u2014 even small'],
    ['Review existing investments','Increase monthly contribution','Confirm increase','Research one new asset class','Consider diversifying','Take one diversification step','Review balance','Investing monthly with a strategy'],
    ['Review portfolio performance','Rebalance if any asset dominates','Increase monthly contribution','Research one more diversification','Take action','Confirm monthly running','Review total value','Investing consistently \u2014 diversified and growing'],
    ['Review portfolio quarterly','Rebalance if needed','Increase contribution with any pay rise','Confirm everything running','Check vs benchmark','Adjust strategy if needed','Review total value','Maintain \u2014 quarterly review, consistent contributions'],
  ]},
];
