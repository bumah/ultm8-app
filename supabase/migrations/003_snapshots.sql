-- ULTM8 Health & Wealth Snapshots
-- Run this in your Supabase SQL Editor

-- ═══════════════════════════════════════════════
-- HEALTH SNAPSHOT (one row per user, body metrics + health checks)
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS health_snapshot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Body metrics
  height NUMERIC,
  height_unit TEXT DEFAULT 'cm',
  weight NUMERIC,
  weight_updated TIMESTAMPTZ,
  waistline NUMERIC,
  waistline_unit TEXT DEFAULT 'in',
  waistline_updated TIMESTAMPTZ,
  body_fat NUMERIC,
  body_fat_updated TIMESTAMPTZ,
  blood_pressure_systolic NUMERIC,
  blood_pressure_diastolic NUMERIC,
  blood_pressure_updated TIMESTAMPTZ,

  -- Health checks (date-based)
  dental_last DATE,
  dental_next DATE,
  eye_last DATE,
  eye_next DATE,
  cancer_last DATE,
  cancer_next DATE,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(user_id)
);

ALTER TABLE health_snapshot ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own health snapshot" ON health_snapshot FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own health snapshot" ON health_snapshot FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own health snapshot" ON health_snapshot FOR UPDATE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════
-- WEALTH SNAPSHOT ITEMS (line items: income, expenses, assets, liabilities, pensions, insurance)
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS wealth_snapshot_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN (
    'income_active', 'income_passive', 'expense',
    'asset', 'liability', 'pension', 'insurance'
  )),
  name TEXT NOT NULL,
  value NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_wealth_items_user ON wealth_snapshot_items(user_id, category);

ALTER TABLE wealth_snapshot_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own wealth items" ON wealth_snapshot_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wealth items" ON wealth_snapshot_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own wealth items" ON wealth_snapshot_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own wealth items" ON wealth_snapshot_items FOR DELETE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════
-- WEALTH SNAPSHOT (single-value fields per user)
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS wealth_snapshot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  emergency_fund NUMERIC,
  will_last_updated DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(user_id)
);

ALTER TABLE wealth_snapshot ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own wealth snapshot" ON wealth_snapshot FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wealth snapshot" ON wealth_snapshot FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own wealth snapshot" ON wealth_snapshot FOR UPDATE USING (auth.uid() = user_id);
