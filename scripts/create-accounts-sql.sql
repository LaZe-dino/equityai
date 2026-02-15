-- EquityAI Test Account Creation Script
-- Run this in the Supabase SQL Editor
-- This creates two test accounts for AD

-- First, let's fix the trigger if it's causing issues
-- Drop and recreate the trigger function with better error handling

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into profiles, handling potential conflicts
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'investor')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't block user creation
  RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Now create the test accounts using supabase-auth admin functions
-- Note: You'll need to run the Node.js script after this, OR use the Supabase Dashboard

-- Alternative: Create users via SQL (requires proper permissions)
-- This only works if you have direct database access to auth schema

-- For now, let's ensure the profiles table will accept our manual inserts
-- In case the trigger doesn't work, we can manually create profiles

SELECT 'Trigger updated successfully' as status;
