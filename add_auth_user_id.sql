-- ============================================
-- ADD auth_user_id COLUMN TO CONTRACTORS
-- Run this ONCE in Supabase SQL Editor
-- ============================================

-- Add column to link contractors to Supabase Auth users
ALTER TABLE contractors 
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_contractors_auth_user_id 
ON contractors(auth_user_id);

-- Verify column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'contractors' AND column_name = 'auth_user_id';
