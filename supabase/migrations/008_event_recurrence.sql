-- Recurrence support for user_events.
-- A recurring event stores a single row with a frequency + interval,
-- and per-occurrence completion is tracked in `completed_dates` (DATE[]).
-- Non-recurring events continue to use the existing `completed` boolean.

ALTER TABLE user_events
  ADD COLUMN IF NOT EXISTS recurrence_freq TEXT
    CHECK (recurrence_freq IN ('daily', 'weekly', 'monthly', 'annually')),
  ADD COLUMN IF NOT EXISTS recurrence_interval INT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS recurrence_end_date DATE,
  ADD COLUMN IF NOT EXISTS completed_dates DATE[] NOT NULL DEFAULT '{}';
