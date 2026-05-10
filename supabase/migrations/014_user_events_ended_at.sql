-- 014: end-challenge support
-- Adds an ended_at timestamp to user_events. A challenge is considered
-- "ended" if this is non-null. Active surfaces (dashboard, calendar) filter
-- ended rows out; the row itself stays so history (completed_dates,
-- progress) is preserved.

ALTER TABLE user_events
  ADD COLUMN IF NOT EXISTS ended_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS user_events_ended_at_idx
  ON user_events (ended_at);
