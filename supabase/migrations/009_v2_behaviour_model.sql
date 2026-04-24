-- ULTM8 v2: clean-slate rebuild of the behaviour + indicator model.
-- Wipes all existing check-in / tracking data and reshapes the schema to
-- match the new 8 behaviours + 8 indicators per category.
--
-- Health behaviours: Sleep, Smoking, Strength, Sweat, Sugar, Salt, Spirits, Stress  (unchanged)
-- Health indicators: Blood Pressure, Weight, Waist, Resting HR, Body Fat %, Sleep Quality, Blood Sugar, Wellbeing Score
-- Wealth behaviours: Income, Spending, Saving, Debt, Investments, Pension, Protection, Tax
-- Wealth indicators: Net Income, Discretionary Spend, Emergency Fund, Debt Level, Net Worth, Pension Fund, FI Ratio, Passive Income

-- ── Wipe existing rows ──
DELETE FROM daily_progress;
DELETE FROM action_plans;
DELETE FROM user_events;
DELETE FROM indicator_logs;
DELETE FROM health_assessments;
DELETE FROM wealth_assessments;

-- ── Health: reshape indicators ──
ALTER TABLE health_assessments
  DROP COLUMN IF EXISTS i_cholesterol,
  DROP COLUMN IF EXISTS i_muscle_mass,
  DROP COLUMN IF EXISTS i_pushups,
  DROP COLUMN IF EXISTS i_5km_time,
  DROP COLUMN IF EXISTS is_cholesterol,
  DROP COLUMN IF EXISTS is_muscle_mass,
  DROP COLUMN IF EXISTS is_pushups,
  DROP COLUMN IF EXISTS is_5km_time;

ALTER TABLE health_assessments
  ADD COLUMN IF NOT EXISTS i_weight NUMERIC,
  ADD COLUMN IF NOT EXISTS i_waist NUMERIC,
  ADD COLUMN IF NOT EXISTS i_sleep_quality NUMERIC,
  ADD COLUMN IF NOT EXISTS i_wellbeing NUMERIC,
  ADD COLUMN IF NOT EXISTS is_weight INT,
  ADD COLUMN IF NOT EXISTS is_waist INT,
  ADD COLUMN IF NOT EXISTS is_sleep_quality INT,
  ADD COLUMN IF NOT EXISTS is_wellbeing INT;

-- ── Wealth: swap behaviour columns ──
ALTER TABLE wealth_assessments
  ADD COLUMN IF NOT EXISTS b_income INT,
  ADD COLUMN IF NOT EXISTS b_spending INT,
  ADD COLUMN IF NOT EXISTS b_saving INT,
  ADD COLUMN IF NOT EXISTS b_debt INT,
  ADD COLUMN IF NOT EXISTS b_investments INT,
  ADD COLUMN IF NOT EXISTS b_pension INT,
  ADD COLUMN IF NOT EXISTS b_protection INT,
  ADD COLUMN IF NOT EXISTS b_tax INT;

ALTER TABLE wealth_assessments
  DROP COLUMN IF EXISTS b_active_income,
  DROP COLUMN IF EXISTS b_passive_income,
  DROP COLUMN IF EXISTS b_expenses,
  DROP COLUMN IF EXISTS b_discretionary,
  DROP COLUMN IF EXISTS b_savings,
  DROP COLUMN IF EXISTS b_debt_repayment,
  DROP COLUMN IF EXISTS b_retirement,
  DROP COLUMN IF EXISTS b_investment;

-- ── Wealth: reshape indicator score columns ──
ALTER TABLE wealth_assessments
  ADD COLUMN IF NOT EXISTS is_net_income INT,
  ADD COLUMN IF NOT EXISTS is_discretionary_spend INT,
  ADD COLUMN IF NOT EXISTS is_pension_fund INT,
  ADD COLUMN IF NOT EXISTS is_passive_income INT;

ALTER TABLE wealth_assessments
  DROP COLUMN IF EXISTS is_savings_capacity,
  DROP COLUMN IF EXISTS is_retirement_pot,
  DROP COLUMN IF EXISTS is_lifestyle_creep,
  DROP COLUMN IF EXISTS is_credit_score;

-- ── Wealth: drop now-unused financial data + computed columns ──
-- (wealth check-ins are behaviour-only; financial figures live on the Profile
-- page or in the Trends indicator logs.)
ALTER TABLE wealth_assessments
  DROP COLUMN IF EXISTS fd_income,
  DROP COLUMN IF EXISTS fd_passive,
  DROP COLUMN IF EXISTS fd_expenses,
  DROP COLUMN IF EXISTS fd_discretionary,
  DROP COLUMN IF EXISTS fd_savings,
  DROP COLUMN IF EXISTS fd_savings_total,
  DROP COLUMN IF EXISTS fd_pension,
  DROP COLUMN IF EXISTS fd_debt,
  DROP COLUMN IF EXISTS fd_credit_score,
  DROP COLUMN IF EXISTS computed_net_worth,
  DROP COLUMN IF EXISTS computed_savings_rate,
  DROP COLUMN IF EXISTS computed_emergency_months,
  DROP COLUMN IF EXISTS computed_fi_ratio,
  DROP COLUMN IF EXISTS computed_disc_pct;
