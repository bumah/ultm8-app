-- Replace Waist with Push-ups so the Strength axis has a dedicated indicator.
-- Body Fat % already captures central composition, so Waist becomes redundant.

ALTER TABLE health_assessments
  RENAME COLUMN i_waist TO i_pushups;

ALTER TABLE health_assessments
  RENAME COLUMN is_waist TO is_pushups;

-- Trends data: any waist logs / goals are no longer meaningful, drop them.
DELETE FROM indicator_logs WHERE indicator_key = 'waist';
DELETE FROM indicator_goals WHERE indicator_key = 'waist';
