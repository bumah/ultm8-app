-- Replace Waist with Push-ups so the Strength axis has a dedicated indicator.
-- Body Fat % already captures central composition, so Waist becomes redundant.
--
-- This migration is idempotent: safe to re-run, and safe on a fresh DB that
-- never had the waist columns.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'health_assessments'
      AND column_name = 'i_waist'
  ) THEN
    ALTER TABLE health_assessments RENAME COLUMN i_waist TO i_pushups;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'health_assessments'
      AND column_name = 'is_waist'
  ) THEN
    ALTER TABLE health_assessments RENAME COLUMN is_waist TO is_pushups;
  END IF;
END $$;

-- Make sure the columns exist (covers the case of a brand-new DB that started
-- on a schema that never had i_waist/is_waist).
ALTER TABLE health_assessments
  ADD COLUMN IF NOT EXISTS i_pushups  NUMERIC,
  ADD COLUMN IF NOT EXISTS is_pushups INT;

-- Trends data: any waist logs / goals are no longer meaningful, drop them.
-- Guarded so the migration is safe on DBs where 007/010 haven't been applied.
DO $$
BEGIN
  IF to_regclass('public.indicator_logs') IS NOT NULL THEN
    DELETE FROM indicator_logs WHERE indicator_key = 'waist';
  END IF;
  IF to_regclass('public.indicator_goals') IS NOT NULL THEN
    DELETE FROM indicator_goals WHERE indicator_key = 'waist';
  END IF;
END $$;
