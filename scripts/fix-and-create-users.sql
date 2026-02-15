-- EquityAI: Fix Trigger & Create Test Accounts
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/xikswjbanjuwepbsqngj/sql)

-- ============================================
-- STEP 1: Drop the problematic trigger temporarily
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- ============================================
-- STEP 2: Create test accounts directly in auth.users
-- ============================================

-- Founder account
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    gen_random_uuid(),
    'ad.founder@equityai.test',
    crypt('TestPass123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"AD Founder","role":"founder"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
)
ON CONFLICT (email) DO UPDATE SET
    encrypted_password = crypt('TestPass123!', gen_salt('bf')),
    email_confirmed_at = NOW(),
    raw_user_meta_data = '{"full_name":"AD Founder","role":"founder"}'
RETURNING id;

-- Investor account  
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    gen_random_uuid(),
    'ad.investor@equityai.test',
    crypt('TestPass123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"AD Investor","role":"investor"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
)
ON CONFLICT (email) DO UPDATE SET
    encrypted_password = crypt('TestPass123!', gen_salt('bf')),
    email_confirmed_at = NOW(),
    raw_user_meta_data = '{"full_name":"AD Investor","role":"investor"}'
RETURNING id;

-- ============================================
-- STEP 3: Create profiles for these users
-- ============================================

-- Get the user IDs and create profiles
DO $$
DECLARE
    founder_id UUID;
    investor_id UUID;
BEGIN
    -- Get founder ID
    SELECT id INTO founder_id FROM auth.users WHERE email = 'ad.founder@equityai.test';
    
    -- Get investor ID
    SELECT id INTO investor_id FROM auth.users WHERE email = 'ad.investor@equityai.test';
    
    -- Create founder profile
    IF founder_id IS NOT NULL THEN
        INSERT INTO public.profiles (id, email, full_name, role, onboarded)
        VALUES (founder_id, 'ad.founder@equityai.test', 'AD Founder', 'founder', true)
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            role = EXCLUDED.role,
            onboarded = true;
        
        RAISE NOTICE 'Founder profile created/updated for ID: %', founder_id;
    END IF;
    
    -- Create investor profile
    IF investor_id IS NOT NULL THEN
        INSERT INTO public.profiles (id, email, full_name, role, onboarded)
        VALUES (investor_id, 'ad.investor@equityai.test', 'AD Investor', 'investor', true)
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            role = EXCLUDED.role,
            onboarded = true;
        
        -- Create investor profile record
        INSERT INTO public.investor_profiles (user_id, accredited, investment_min, investment_max, sectors_of_interest, stages_of_interest)
        VALUES (investor_id, true, 2500000, 50000000, ARRAY['Artificial Intelligence', 'SaaS', 'Fintech'], ARRAY['seed', 'series-a'])
        ON CONFLICT (user_id) DO NOTHING;
        
        RAISE NOTICE 'Investor profile created/updated for ID: %', investor_id;
    END IF;
END $$;

-- ============================================
-- STEP 4: Recreate the trigger (optional - skip if still having issues)
-- ============================================
-- Uncomment below if you want to restore the trigger after creating accounts
/*
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'investor')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
*/

-- ============================================
-- VERIFICATION: Check that accounts were created
-- ============================================
SELECT 
    u.email,
    u.email_confirmed_at,
    u.raw_user_meta_data->>'role' as role,
    p.full_name,
    p.onboarded
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.email IN ('ad.founder@equityai.test', 'ad.investor@equityai.test');
