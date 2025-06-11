/*
  # Add INSERT policy for profiles table

  1. Security Changes
    - Add RLS policy to allow authenticated users to insert their own profile data
    - This enables new users to create their profile during the sign-up process

  The policy ensures users can only insert a profile with their own user ID (auth.uid()).
*/

-- Add policy to allow authenticated users to insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);