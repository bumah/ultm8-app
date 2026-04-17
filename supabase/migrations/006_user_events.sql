-- User-driven calendar events
CREATE TABLE IF NOT EXISTS user_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  notes TEXT,
  event_date DATE NOT NULL,
  event_time TEXT,                  -- optional HH:MM time
  category TEXT CHECK (category IN ('health', 'wealth', 'other')) DEFAULT 'other',
  behaviour_index INT,              -- optional link to a behaviour (0-7)
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_events_user_date ON user_events(user_id, event_date);

ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own events"
  ON user_events FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own events"
  ON user_events FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own events"
  ON user_events FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own events"
  ON user_events FOR DELETE USING (auth.uid() = user_id);
