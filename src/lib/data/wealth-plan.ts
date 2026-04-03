export interface PlanBehaviourDef {
  behaviour: string;
  type: 'increase' | 'reduce';
  plans: string[][];  // plans[trackIndex][weekIndex] — 4 tracks x 8 weeks
}

export const WEALTH_PLAN: PlanBehaviourDef[] = [
  { behaviour: 'Active Income', type: 'increase', plans: [
    ['Find your exact monthly take-home this week','Track income for a full month','Review take-home vs gross','Identify one skill to increase income','Research one income growth opportunity','Take one action toward income growth','Review income growth progress','Set an income target for next season'],
    ['Identify one income growth opportunity','Research it in detail','Take one concrete action','Continue \u2014 income growth takes time','Review progress monthly','Double down on what is working','Set a specific income target','Target measurable income growth'],
    ['Identify one new income growth lever','Plan how to pursue it','Take first action','Continue \u2014 income growth takes time','Review and adjust','Accelerate the most promising opportunity','Set a specific target','Achieve measurable income growth'],
    ['Review income growth progress','Identify next opportunity','Research it','Plan your approach','Take action','Continue consistently','Review and refine','Set income growth target annually'],
  ]},
  { behaviour: 'Passive Income', type: 'increase', plans: [
    ['Research one passive income option','Choose the most realistic option','Take one first step toward it','Continue building \u2014 takes time','Track any income generated','Reinvest any returns','Review and expand if possible','Have at least one active passive income source'],
    ['Make your existing source consistent','Track it monthly','Identify a second option','Begin building second source','Track both monthly','Reinvest returns from both','Review and expand','Have two active passive income sources'],
    ['Review all passive income monthly','Identify one way to grow the largest source','Take action to grow it','Continue growing','Add one new source','Track all sources monthly','Reinvest all returns','Grow total passive income meaningfully'],
    ['Review all passive income monthly','Reinvest all returns','Identify next growth opportunity','Take action','Continue growing','Review portfolio','Rebalance if needed','Maintain and grow'],
  ]},
  { behaviour: 'Expenses', type: 'reduce', plans: [
    ['Track all spending this week','Total last month expenses exactly','Categorise into needs vs wants','Identify top 3 spending categories','Find one category to reduce by 10%','Reduce that category this week','Track and review progress','Know exact monthly expenses'],
    ['Track total expenses exactly this month','Review and categorise everything','Identify two categories to reduce','Reduce category 1 this week','Reduce category 2','Review and maintain reductions','Find one more area to reduce','Keep total expenses below target'],
    ['Review last month in detail','Identify one area to reduce by 10%','Reduce it this week','Confirm the saving','Find another area to reduce','Reduce it','Track monthly vs target','Keep expenses controlled as income grows'],
    ['Review expenses monthly','Identify any lifestyle creep','Address it immediately','Confirm below target','Review subscriptions','Cancel anything unused','Monthly review complete','Maintain \u2014 protect your expense control'],
  ]},
  { behaviour: 'Discretionary', type: 'reduce', plans: [
    ['Track every non-essential purchase this week','Total discretionary from last month','Set a weekly discretionary budget','Stick to it this week','Review \u2014 did you hit the budget?','Continue for another week','Review monthly total','No more than your target on discretionary'],
    ['Set a firm monthly discretionary limit','Break into weekly amounts','Track this week','Review \u2014 on target?','Continue for another week','Review and adjust if needed','Confirm monthly total is under limit','Keep discretionary under limit all season'],
    ['Review discretionary vs income %','Identify the largest single category','Set a reduced limit for it','Track and stick to it','Review \u2014 on target?','Find one more category to reduce','Confirm under 15% of income','Keep discretionary under 15% of income'],
    ['Review discretionary spend monthly','Check for lifestyle creep','Address anything that has crept up','Confirm under your target %','Review subscriptions','Cancel anything unused','Monthly review complete','Maintain \u2014 protect against lifestyle inflation'],
  ]},
  { behaviour: 'Savings', type: 'increase', plans: [
    ['Save any amount this week','Set up a savings account if needed','Save a fixed amount on payday','Repeat same amount next payday','Review \u2014 saving consistently?','Increase by a small amount','Continue consistently','Save at least 5% of income monthly'],
    ['Set up automatic savings on payday','Confirm it ran this month','Increase by 1%','Continue \u2014 automation removes the decision','Review savings total','Increase by another 1%','Confirm saving consistently','Save at least 10% of income monthly'],
    ['Review savings rate \u2014 above 15%?','Increase by 1% this month','Automate the increase','Confirm it ran','Review total savings progress','Increase by another 1%','Target 20% savings rate','Save at least 20% of income monthly'],
    ['Review savings rate monthly','Confirm automation is working','Check any month saved less \u2014 why?','Address the gap','Increase rate with any pay rise','Review savings total vs goals','Confirm savings rate maintained','Increase with every pay rise'],
  ]},
  { behaviour: 'Debt Repayment', type: 'reduce', plans: [
    ['List all debts with balances and interest rates','Order by interest rate highest first','Make minimum payments on all','Add any extra to highest interest debt','Continue this approach','Review total debt \u2014 reducing?','Confirm you have a clear repayment plan','Reduce total debt meaningfully this season'],
    ['Review repayment plan \u2014 on track?','Increase monthly payment by a small amount','Continue plan consistently','Review progress \u2014 debt reducing?','Find one area to free up more','Apply it to debt','Review total debt reduction','Reduce total debt meaningfully this season'],
    ['Review debt total and repayment plan','Overpay by any amount this month','Continue overpaying','Review progress','Find another way to overpay','Apply it','Track monthly debt reduction','Accelerate your debt-free date significantly'],
    ['Review remaining debt','Maintain overpayments','Track monthly progress','Celebrate milestones as debt reduces','Continue consistently','Review debt-free date estimate','Adjust if circumstances change','Stay on track'],
  ]},
  { behaviour: 'Retirement', type: 'increase', plans: [
    ['Start any pension contribution this month','Confirm contribution is running','Find your employer match \u2014 claim it fully','Review your pension pot value','Understand projected retirement income','Increase contribution by 1%','Confirm increase is running','Contributing consistently'],
    ['Review pension contribution level','Increase by 1%','Confirm the increase ran','Check employer match \u2014 claiming fully?','Review projected retirement income','Identify if contributions are enough','Increase by another 1%','Know projected income and increase contributions'],
    ['Review pension pot value','Check projected retirement income','Identify any gap','Plan how to close it','Increase contributions this month','Confirm the increase','Review progress','Increase contributions and track pot growth'],
    ['Review pension pot quarterly','Check projected income vs target','Increase with every pay rise','Confirm contributions running','Review investment mix','Adjust if needed','Confirm pot is growing','Maintain \u2014 increase with every pay rise'],
  ]},
  { behaviour: 'Investment', type: 'increase', plans: [
    ['Open an ISA or investment account this week','Deposit any amount','Choose a simple investment \u2014 index fund is a good start','Set up a monthly contribution','Confirm it ran','Invest same amount next month','Review your balance','Investing monthly \u2014 even small amounts'],
    ['Review existing investments','Increase monthly contribution','Confirm the increase','Research one additional asset class','Consider diversifying','Take one action toward diversification','Review portfolio balance','Investing monthly with a clearer strategy'],
    ['Review portfolio performance','Rebalance if one asset class dominates','Increase monthly contribution','Research one more diversification opportunity','Take action','Confirm monthly investment is running','Review total investment value','Investing consistently \u2014 diversified and growing'],
    ['Review portfolio quarterly','Rebalance if needed','Increase contribution with any pay rise','Confirm everything is running','Check performance vs benchmark','Adjust strategy if needed','Review total investment value','Maintain \u2014 quarterly review consistent contributions'],
  ]},
];
