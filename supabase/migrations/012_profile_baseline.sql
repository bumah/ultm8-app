-- Baseline figures collected at first login + editable from /profile.
-- Used to compute:
--   * Waist target  = height / 2
--   * Net Worth target = 10 \u00d7 annual income
--   * Emergency Fund target = 6 \u00d7 monthly expenses
--   * Pension Fund target = 25 \u00d7 annual expenses
--   * FI Ratio target = 1.0 (passive income / monthly expenses)

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS monthly_income NUMERIC,
  ADD COLUMN IF NOT EXISTS monthly_expenses NUMERIC,
  ADD COLUMN IF NOT EXISTS height_cm NUMERIC;
