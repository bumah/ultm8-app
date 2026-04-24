export interface PlanBehaviourDef {
  behaviour: string;
  type: 'increase' | 'reduce';
  plans: string[][];  // plans[trackIndex][weekIndex] — 4 tracks x 8 weeks
}

// v2 wealth behaviours: Income, Spending, Saving, Debt, Investments, Pension, Protection, Tax.
export const WEALTH_PLAN: PlanBehaviourDef[] = [
  { behaviour: 'Income', type: 'increase', plans: [
    ['Find your exact monthly take-home this week','Track income for a full month','Review take-home vs gross','Identify one skill to increase income','Research one income growth opportunity','Take one action toward income growth','Review income growth progress','Set an income target for next quarter'],
    ['Identify one income growth opportunity','Research it in detail','Take one concrete action','Continue \u2014 income growth takes time','Review progress monthly','Double down on what is working','Set a specific income target','Achieve measurable income growth'],
    ['Identify a new income lever','Plan how to pursue it','Take first action','Continue consistently','Review and adjust','Accelerate the most promising','Set a specific target','Hit measurable income growth'],
    ['Review income monthly','Identify next opportunity','Research it','Plan your approach','Take action','Continue consistently','Review and refine','Set a new annual target'],
  ]},
  { behaviour: 'Spending', type: 'reduce', plans: [
    ['Track every spend for 7 days','Total last month\u2019s outflows','Separate needs vs wants','Set a weekly discretionary cap','Stick to the cap this week','Review and adjust','Hold for another week','Stay within budget 4 weeks in a row'],
    ['Write a monthly budget','Break into weekly amounts','Track this week','Review \u2014 on target?','Continue for another week','Review and adjust','Confirm monthly total in range','Hit budget consistently this month'],
    ['Review discretionary vs income %','Identify biggest single category','Set a reduced limit for it','Track and stick to it','Review \u2014 on target?','Find one more category to trim','Confirm under 15% of income','Hold under 15% of income'],
    ['Review spending monthly','Check for lifestyle creep','Address anything that has crept up','Confirm under target %','Review subscriptions','Cancel anything unused','Monthly review complete','Maintain \u2014 protect against inflation'],
  ]},
  { behaviour: 'Saving', type: 'increase', plans: [
    ['Save any amount this week','Set up a savings account if needed','Save a fixed amount on payday','Repeat same amount next payday','Review \u2014 saving consistently?','Increase by a small amount','Continue consistently','Save at least 5% of income monthly'],
    ['Set up automatic savings on payday','Confirm it ran this month','Increase by 1%','Continue \u2014 automation removes the decision','Review savings total','Increase by another 1%','Confirm saving consistently','Save at least 10% of income monthly'],
    ['Review savings rate \u2014 above 15%?','Increase by 1% this month','Automate the increase','Confirm it ran','Review total savings progress','Increase by another 1%','Target 20% savings rate','Save at least 20% of income monthly'],
    ['Review savings rate monthly','Confirm automation is working','Check any month saved less \u2014 why?','Address the gap','Increase rate with any pay rise','Review savings total vs goals','Confirm rate maintained','Increase with every pay rise'],
  ]},
  { behaviour: 'Debt', type: 'reduce', plans: [
    ['List all debts with balances and interest rates','Order by interest rate highest first','Make minimum payments on all','Add any extra to highest interest debt','Continue this approach','Review total debt \u2014 reducing?','Confirm a clear plan is in place','Reduce total debt meaningfully this quarter'],
    ['Review repayment plan \u2014 on track?','Increase monthly payment by a small amount','Continue plan consistently','Review progress \u2014 debt reducing?','Find one area to free up more','Apply it to debt','Review total debt reduction','Reduce total debt meaningfully this quarter'],
    ['Review debt total and plan','Overpay by any amount this month','Continue overpaying','Review progress','Find another way to overpay','Apply it','Track monthly debt reduction','Accelerate your debt-free date significantly'],
    ['Review remaining debt','Maintain overpayments','Track monthly progress','Celebrate milestones as debt reduces','Continue consistently','Review debt-free date estimate','Adjust if circumstances change','Stay on track'],
  ]},
  { behaviour: 'Investments', type: 'increase', plans: [
    ['Open an ISA or investment account','Deposit any amount','Pick a simple index fund to start','Set up a monthly contribution','Confirm it ran','Invest same amount next month','Review your balance','Investing monthly \u2014 even small amounts'],
    ['Review existing investments','Increase monthly contribution','Confirm the increase','Research one additional asset class','Consider diversifying','Take one diversification step','Review portfolio balance','Investing monthly with a clearer strategy'],
    ['Review portfolio performance','Rebalance if one asset class dominates','Increase monthly contribution','Research one more diversification','Take action','Confirm monthly investment is running','Review total value','Investing consistently \u2014 diversified and growing'],
    ['Review portfolio quarterly','Rebalance if needed','Increase contribution with any pay rise','Confirm everything is running','Check performance vs benchmark','Adjust strategy if needed','Review total value','Maintain \u2014 quarterly review, consistent contributions'],
  ]},
  { behaviour: 'Pension', type: 'increase', plans: [
    ['Start any pension contribution this month','Confirm contribution is running','Find your employer match \u2014 claim it fully','Review your pension pot value','Understand projected retirement income','Increase contribution by 1%','Confirm increase is running','Contributing consistently'],
    ['Review pension contribution level','Increase by 1%','Confirm the increase ran','Check employer match \u2014 claiming fully?','Review projected retirement income','Identify if contributions are enough','Increase by another 1%','Know projected income and increase contributions'],
    ['Review pension pot value','Check projected retirement income','Identify any gap','Plan how to close it','Increase contributions this month','Confirm the increase','Review progress','Increase contributions and track pot growth'],
    ['Review pension pot quarterly','Check projected income vs target','Increase with every pay rise','Confirm contributions running','Review investment mix','Adjust if needed','Confirm pot is growing','Maintain \u2014 increase with every pay rise'],
  ]},
  { behaviour: 'Protection', type: 'increase', plans: [
    ['List what you currently have in place','Identify gaps (life, income, critical illness, health)','Research quotes for the biggest gap','Compare 2\u20133 providers','Choose one to address first','Apply for cover','Confirm policy is live','At least one protection policy in force'],
    ['Review existing cover against current needs','Identify any shortfall','Get quotes to close the gap','Choose a provider','Apply for cover','Confirm policy is live','Review remaining gaps','Adequate cover for current life stage'],
    ['Review life + income + critical illness annually','Check sums insured are still right','Refresh beneficiaries if needed','Identify any new gaps','Address them','Consider health cover if relevant','Document all policies in one place','Comprehensive cover reviewed annually'],
    ['Annual protection review','Confirm sums insured match income','Confirm beneficiaries current','Review any changes to life circumstances','Adjust cover as needed','Document updates','Confirm all policies in force','Maintain \u2014 review every April'],
  ]},
  { behaviour: 'Tax', type: 'increase', plans: [
    ['Check your tax code this week','Open an ISA if you don\u2019t have one','Open a pension (SIPP) if needed','Contribute any amount to an ISA','Contribute any amount to the pension','Confirm contributions recorded','Plan next month\u2019s allowance use','Use at least one tax-advantaged account'],
    ['Set up monthly ISA contribution','Set up monthly pension contribution','Confirm both ran','Review allowances used year-to-date','Adjust to use more if possible','Check for other allowances (gift, CGT)','Use what\u2019s relevant','Use ISA or pension every year'],
    ['Track total ISA + pension contributions','Plan to max one of them this tax year','Increase contributions if possible','Confirm max contribution by year end','Review additional reliefs you qualify for','Claim them','Record everything for self-assessment','Use your full ISA or pension allowance'],
    ['Annual April tax review','Confirm ISA + pension maxed where possible','Claim all reliefs available','Use gift and CGT allowances if relevant','Document everything','File self-assessment (if applicable)','Plan next year\u2019s allowance strategy','Maintain \u2014 fully use allowances every year'],
  ]},
];
