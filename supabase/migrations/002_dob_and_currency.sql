-- Add date_of_birth column and allow custom currency text
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Change currency to TEXT (remove the CHECK constraint to allow custom currencies)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_currency_check;
ALTER TABLE profiles ALTER COLUMN currency SET DEFAULT '£';
