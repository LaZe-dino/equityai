-- Complete Fix for EquityAI Test Accounts
-- This script completely removes the problematic trigger and creates accounts properly

-- ============================================
-- STEP 1: Completely remove the trigger
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- ============================================
-- STEP 2: Clean up any existing test data
-- ============================================
DELETE FROM public.investor_profiles WHERE user_id IN (
    SELECT id FROM auth.users WHERE email LIKE '%@equityai.test'
);
DELETE FROM public.profiles WHERE email LIKE '%@equityai.test';
DELETE FROM auth.users WHERE email LIKE '%@equityai.test';

-- ============================================
-- STEP 3: Create founder account
-- ============================================
DO $$
DECLARE
    founder_id UUID := gen_random_uuid();
BEGIN
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        recovery_token,
        email_change_token_new,
        email_change
    ) VALUES (
        founder_id,
        '00000000-0000-0000-0000-000000000000'::uuid,
        'ad.founder@equityai.test',
        -- Pre-computed bcrypt hash of "TestPass123!"
        '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqhmM6JGKpS4G3R1G2JH8YpfB0Bqy',
        NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"full_name":"AD Founder","role":"founder"}'::jsonb,
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
    );
    
    -- Create profile manually since trigger is removed
    INSERT INTO public.profiles (id, email, full_name, role, onboarded)
    VALUES (
        founder_id,
        'ad.founder@equityai.test',
        'AD Founder',
        'founder',
        true
    );
    
    RAISE NOTICE 'Founder account created: %', founder_id;
END $$;

-- ============================================
-- STEP 4: Create investor account
-- ============================================
DO $$
DECLARE
    investor_id UUID := gen_random_uuid();
BEGIN
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        recovery_token,
        email_change_token_new,
        email_change
    ) VALUES (
        investor_id,
        '00000000-0000-0000-0000-000000000000'::uuid,
        'ad.investor@equityai.test',
        -- Same bcrypt hash
        '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqhmM6JGKpS4G3R1G2JH8YpfB0Bqy',
        NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"full_name":"AD Investor","role":"investor"}'::jsonb,
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
    );
    
    -- Create profile manually
    INSERT INTO public.profiles (id, email, full_name, role, onboarded)
    VALUES (
        investor_id,
        'ad.investor@equityai.test',
        'AD Investor',
        'investor',
        true
    );
    
    -- Create investor profile
    INSERT INTO public.investor_profiles (user_id, accredited, investment_min, investment_max, sectors_of_interest, stages_of_interest)
    VALUES (
        investor_id,
        true,
        2500000,
        50000000,
        ARRAY['Artificial Intelligence', 'SaaS', 'Fintech'],
        ARRAY['seed', 'series-a']
    );
    
    RAISE NOTICE 'Investor account created: %', investor_id;
END $$;

-- ============================================
-- STEP 5: Verify results
-- ============================================
SELECT 
    u.email,
    u.email_confirmed_at IS NOT NULL as confirmed,
    p.full_name,
    p.role,
    p.onboarded
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.email LIKE '%@equityai.test';
