-- Goals attached to a tracked indicator. One active goal per indicator per user
-- is the typical pattern, but this table allows historical goals too.
-- Status (achieved / progressing) is derived in the app from the latest reading
-- vs target_value, so it isn't stored here. `achieved_at` is set the first time
-- the user crosses the target.

CREATE TABLE IF NOT EXISTS indicator_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  indicator_key TEXT NOT NULL,         -- e.g. 'bp', 'weight', 'net_worth'
  target_value NUMERIC NOT NULL,        -- primary target
  target_value2 NUMERIC,                -- secondary target (e.g. BP diastolic)
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  target_date DATE NOT NULL,
  notes TEXT,
  achieved_at TIMESTAMPTZ,              -- set the first time the target is hit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_indicator_goals_user_key
  ON indicator_goals(user_id, indicator_key);

ALTER TABLE indicator_goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own indicator goals" ON indicator_goals;
DROP POLICY IF EXISTS "Users can insert own indicator goals" ON indicator_goals;
DROP POLICY IF EXISTS "Users can update own indicator goals" ON indicator_goals;
DROP POLICY IF EXISTS "Users can delete own indicator goals" ON indicator_goals;

CREATE POLICY "Users can view own indicator goals"
  ON indicator_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own indicator goals"
  ON indicator_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own indicator goals"
  ON indicator_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own indicator goals"
  ON indicator_goals FOR DELETE USING (auth.uid() = user_id);
