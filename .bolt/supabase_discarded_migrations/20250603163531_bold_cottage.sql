/*
  # Add subscription status to profiles

  1. Changes
    - Add `is_subscribed` boolean column to profiles table with default false
    - Add index on is_subscribed column for faster queries
    
  2. Security
    - No changes to RLS policies needed as existing profile policies cover this column
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'is_subscribed'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN is_subscribed boolean DEFAULT false;

    CREATE INDEX idx_profiles_is_subscribed 
    ON profiles(is_subscribed);
  END IF;
END $$;