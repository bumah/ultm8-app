-- Align the data model with the standalone ULTM8 Challenge format:
--   * Wealth behaviours revert to the file's 8 (Active Income, Passive Income,
--     Expenses, Discretionary, Savings, Debt Repayment, Retirement, Investment).
--   * Scoring scale is now -1 / 0 / +1 / +2 (the existing INT columns happily
--     hold negatives — no type change).
--   * Both check-ins now also store an indicator score percentage alongside
--     behaviour pct + combined octagon pct.
-- Existing assessment + plan + tracking data is wiped (scoring scale + columns
-- have changed; nothing is salvageable).

-- ── Wipe ──
DELETE FROM daily_progress;
DELETE FROM action_plans;
DELETE FROM indicator_goals;
DELETE FROM indicator_logs;
DELETE FROM health_assessments;
DELETE FROM wealth_assessments;

-- ── Wealth: revert behaviour columns to file's 8 ──
ALTER TABLE wealth_assessments
  ADD COLUMN IF NOT EXISTS b_active_income INT,
  ADD COLUMN IF NOT EXISTS b_passive_income INT,
  ADD COLUMN IF NOT EXISTS b_expenses INT,
  ADD COLUMN IF NOT EXISTS b_discretionary INT,
  ADD COLUMN IF NOT EXISTS b_savings INT,
  ADD COLUMN IF NOT EXISTS b_debt_repayment INT,
  ADD COLUMN IF NOT EXISTS b_retirement INT,
  ADD COLUMN IF NOT EXISTS b_investment INT;

ALTER TABLE wealth_assessments
  DROP COLUMN IF EXISTS b_income,
  DROP COLUMN IF EXISTS b_spending,
  DROP COLUMN IF EXISTS b_saving,
  DROP COLUMN IF EXISTS b_debt,
  DROP COLUMN IF EXISTS b_investments,
  DROP COLUMN IF EXISTS b_pension,
  DROP COLUMN IF EXISTS b_protection,
  DROP COLUMN IF EXISTS b_tax;

-- ── Indicator score percentage column ──
ALTER TABLE health_assessments
  ADD COLUMN IF NOT EXISTS indicator_score_pct INT;
ALTER TABLE wealth_assessments
  ADD COLUMN IF NOT EXISTS indicator_score_pct INT;
