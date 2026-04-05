-- Add diastolic blood pressure column
ALTER TABLE health_assessments ADD COLUMN IF NOT EXISTS i_blood_pressure_diastolic NUMERIC;
