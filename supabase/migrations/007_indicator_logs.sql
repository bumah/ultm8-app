-- User-logged indicator readings (values tracked over time).
-- Indicators appear on the Trends page once the user has logged at least one reading.

CREATE TABLE IF NOT EXISTS indicator_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  indicator_key TEXT NOT NULL,                 -- e.g., 'bp', 'weight', 'net_worth'
  value NUMERIC NOT NULL,                      -- primary reading
  value2 NUMERIC,                              -- secondary (e.g., diastolic BP)
  logged_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_indicator_logs_user_key_date
  ON indicator_logs(user_id, indicator_key, logged_date DESC);

ALTER TABLE indicator_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own indicator logs"
  ON indicator_logs FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own indicator logs"
  ON indicator_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own indicator logs"
  ON indicator_logs FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own indicator logs"
  ON indicator_logs FOR DELETE USING (auth.uid() = user_id);
