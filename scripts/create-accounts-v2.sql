-- EquityAI: Create Test Accounts (Version 2 - No ON CONFLICT)
-- Run this in Supabase SQL Editor

-- Step 1: Drop the problematic trigger temporarily
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 2: Delete existing test accounts if they exist
DELETE FROM public.investor_profiles WHERE user_id IN (
    SELECT id FROM auth.users WHERE email IN ('ad.founder@equityai.test', 'ad.investor@equityai.test')
);
DELETE FROM public.profiles WHERE email IN ('ad.founder@equityai.test', 'ad.investor@equityai.test');
DELETE FROM auth.users WHERE email IN ('ad.founder@equityai.test', 'ad.investor@equityai.test');

-- Step 3: Create founder account
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
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000'::uuid,
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
);

-- Step 4: Create investor account
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
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000'::uuid,
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
);

-- Step 5: Create profiles for both users
INSERT INTO public.profiles (id, email, full_name, role, onboarded)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
    COALESCE(raw_user_meta_data->>'role', 'investor'),
    true
FROM auth.users
WHERE email IN ('ad.founder@equityai.test', 'ad.investor@equityai.test');

-- Step 6: Create investor profile for the investor account
INSERT INTO public.investor_profiles (user_id, accredited, investment_min, investment_max, sectors_of_interest, stages_of_interest)
SELECT 
    id,
    true,
    2500000,
    50000000,
    ARRAY['Artificial Intelligence', 'SaaS', 'Fintech'],
    ARRAY['seed', 'series-a']
FROM auth.users
WHERE email = 'ad.investor@equityai.test';

-- Step 7: Show results
SELECT 
    u.email,
    u.email_confirmed_at IS NOT NULL as confirmed,
    p.full_name,
    p.role,
    p.onboarded
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.email LIKE '%@equityai.test';
