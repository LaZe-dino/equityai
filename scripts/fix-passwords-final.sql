-- Fix passwords for test accounts
-- Using proper bcrypt hash that Supabase expects

-- Delete and recreate with proper password handling
DELETE FROM public.investor_profiles WHERE user_id IN (
    SELECT id FROM auth.users WHERE email IN ('ad.founder@equityai.test', 'ad.investor@equityai.test')
);
DELETE FROM public.profiles WHERE email IN ('ad.founder@equityai.test', 'ad.investor@equityai.test');
DELETE FROM auth.users WHERE email IN ('ad.founder@equityai.test', 'ad.investor@equityai.test');

-- Create founder account with properly hashed password
-- Using crypt with blowfish (bf) which Supabase/Gotrue expects
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
    -- bcrypt hash of "TestPass123!" with cost 10
    '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqhmM6JGKpS4G3R1G2JH8YpfB0Bqy',
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

-- Create investor account with properly hashed password
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
    -- bcrypt hash of "TestPass123!" with cost 10
    '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqhmM6JGKpS4G3R1G2JH8YpfB0Bqy',
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

-- Create profiles
INSERT INTO public.profiles (id, email, full_name, role, onboarded)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
    COALESCE(raw_user_meta_data->>'role', 'investor'),
    true
FROM auth.users
WHERE email IN ('ad.founder@equityai.test', 'ad.investor@equityai.test');

-- Create investor profile
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

-- Show results
SELECT 
    u.email,
    u.email_confirmed_at IS NOT NULL as confirmed,
    p.full_name,
    p.role,
    p.onboarded
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.email LIKE '%@equityai.test';
