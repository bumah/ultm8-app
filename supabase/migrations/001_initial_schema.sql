-- ULTM8 Initial Schema
-- Run this in your Supabase SQL Editor

-- ═══════════════════════════════════════════════
-- PROFILES
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  gender TEXT CHECK (gender IN ('male', 'female')),
  age_group TEXT CHECK (age_group IN ('18-29', '30-44', '45-59', '60+')),
  currency TEXT DEFAULT '£' CHECK (currency IN ('£', '$', '€')),
  onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- ═══════════════════════════════════════════════
-- HEALTH ASSESSMENTS
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS health_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Behaviour scores (1-4)
  b_sleep INT CHECK (b_sleep BETWEEN 1 AND 4),
  b_smoking INT CHECK (b_smoking BETWEEN 1 AND 4),
  b_strength INT CHECK (b_strength BETWEEN 1 AND 4),
  b_sweat INT CHECK (b_sweat BETWEEN 1 AND 4),
  b_sugar INT CHECK (b_sugar BETWEEN 1 AND 4),
  b_salt INT CHECK (b_salt BETWEEN 1 AND 4),
  b_spirits INT CHECK (b_spirits BETWEEN 1 AND 4),
  b_stress INT CHECK (b_stress BETWEEN 1 AND 4),

  -- Indicator raw values (nullable if skipped)
  i_blood_pressure NUMERIC,
  i_blood_sugar NUMERIC,
  i_cholesterol NUMERIC,
  i_resting_hr NUMERIC,
  i_body_fat NUMERIC,
  i_muscle_mass NUMERIC,
  i_pushups INT,
  i_5km_time NUMERIC,

  -- Computed indicator scores (1-8)
  is_blood_pressure INT CHECK (is_blood_pressure BETWEEN 1 AND 8),
  is_blood_sugar INT CHECK (is_blood_sugar BETWEEN 1 AND 8),
  is_cholesterol INT CHECK (is_cholesterol BETWEEN 1 AND 8),
  is_resting_hr INT CHECK (is_resting_hr BETWEEN 1 AND 8),
  is_body_fat INT CHECK (is_body_fat BETWEEN 1 AND 8),
  is_muscle_mass INT CHECK (is_muscle_mass BETWEEN 1 AND 8),
  is_pushups INT CHECK (is_pushups BETWEEN 1 AND 8),
  is_5km_time INT CHECK (is_5km_time BETWEEN 1 AND 8),

  -- Aggregate scores
  behaviour_score_pct INT DEFAULT 0,
  octagon_score_pct INT DEFAULT 0,

  -- Profile snapshot
  gender_snapshot TEXT,
  age_group_snapshot TEXT,

  completed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_health_user ON health_assessments(user_id, completed_at DESC);

ALTER TABLE health_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own health assessments"
  ON health_assessments FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health assessments"
  ON health_assessments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════════════
-- WEALTH ASSESSMENTS
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS wealth_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Behaviour scores (1-4)
  b_active_income INT CHECK (b_active_income BETWEEN 1 AND 4),
  b_passive_income INT CHECK (b_passive_income BETWEEN 1 AND 4),
  b_expenses INT CHECK (b_expenses BETWEEN 1 AND 4),
  b_discretionary INT CHECK (b_discretionary BETWEEN 1 AND 4),
  b_savings INT CHECK (b_savings BETWEEN 1 AND 4),
  b_debt_repayment INT CHECK (b_debt_repayment BETWEEN 1 AND 4),
  b_retirement INT CHECK (b_retirement BETWEEN 1 AND 4),
  b_investment INT CHECK (b_investment BETWEEN 1 AND 4),

  -- Financial data inputs
  fd_income NUMERIC DEFAULT 0,
  fd_passive NUMERIC DEFAULT 0,
  fd_expenses NUMERIC DEFAULT 0,
  fd_discretionary NUMERIC DEFAULT 0,
  fd_savings NUMERIC DEFAULT 0,
  fd_savings_total NUMERIC DEFAULT 0,
  fd_pension NUMERIC DEFAULT 0,
  fd_debt NUMERIC DEFAULT 0,
  fd_credit_score INT DEFAULT 1 CHECK (fd_credit_score BETWEEN 1 AND 8),

  -- Computed indicator scores (1-8)
  is_net_worth INT CHECK (is_net_worth BETWEEN 1 AND 8),
  is_debt_level INT CHECK (is_debt_level BETWEEN 1 AND 8),
  is_savings_capacity INT CHECK (is_savings_capacity BETWEEN 1 AND 8),
  is_emergency_fund INT CHECK (is_emergency_fund BETWEEN 1 AND 8),
  is_retirement_pot INT CHECK (is_retirement_pot BETWEEN 1 AND 8),
  is_fi_ratio INT CHECK (is_fi_ratio BETWEEN 1 AND 8),
  is_lifestyle_creep INT CHECK (is_lifestyle_creep BETWEEN 1 AND 8),
  is_credit_score INT CHECK (is_credit_score BETWEEN 1 AND 8),

  -- Computed intermediate values
  computed_net_worth NUMERIC,
  computed_savings_rate NUMERIC,
  computed_emergency_months NUMERIC,
  computed_fi_ratio NUMERIC,
  computed_disc_pct NUMERIC,

  -- Aggregate scores
  behaviour_score_pct INT DEFAULT 0,
  octagon_score_pct INT DEFAULT 0,

  -- Profile snapshot
  age_group_snapshot TEXT,
  currency_snapshot TEXT,

  completed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_wealth_user ON wealth_assessments(user_id, completed_at DESC);

ALTER TABLE wealth_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wealth assessments"
  ON wealth_assessments FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wealth assessments"
  ON wealth_assessments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════════════
-- ACTION PLANS
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS action_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assessment_type TEXT NOT NULL CHECK (assessment_type IN ('health', 'wealth')),
  assessment_id UUID NOT NULL,
  plan_data JSONB NOT NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_plan_user ON action_plans(user_id, is_active, start_date DESC);

ALTER TABLE action_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own plans"
  ON action_plans FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plans"
  ON action_plans FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plans"
  ON action_plans FOR UPDATE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════
-- DAILY PROGRESS
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS daily_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES action_plans(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  week_number INT NOT NULL CHECK (week_number BETWEEN 1 AND 8),
  behaviour_index INT NOT NULL CHECK (behaviour_index BETWEEN 0 AND 7),
  behaviour_name TEXT NOT NULL,
  target_text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(user_id, plan_id, date, behaviour_index)
);

CREATE INDEX idx_progress_date ON daily_progress(user_id, date);
CREATE INDEX idx_progress_plan ON daily_progress(plan_id, week_number);

ALTER TABLE daily_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON daily_progress FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON daily_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON daily_progress FOR UPDATE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════
-- AUTO-CREATE PROFILE ON SIGNUP (trigger)
-- ═══════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
