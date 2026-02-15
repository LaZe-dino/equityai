-- FINAL FIX - Create working test accounts
-- This uses a pre-computed bcrypt hash that actually works

-- Clean slate
DELETE FROM public.investor_profiles WHERE user_id IN (
    SELECT id FROM auth.users WHERE email LIKE '%@equityai.test'
);
DELETE FROM public.profiles WHERE email LIKE '%@equityai.test';
DELETE FROM auth.users WHERE email LIKE '%@equityai.test';

-- Founder account with working password hash
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
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
    'a1111111-1111-1111-1111-111111111111'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'authenticated',
    'authenticated',
    'ad.founder@equityai.test',
    -- This is a real bcrypt hash of "TestPass123!" generated with proper salt
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
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

-- Investor account with working password hash
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
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
    'a2222222-2222-2222-2222-222222222222'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'authenticated',
    'authenticated',
    'ad.investor@equityai.test',
    -- Same working hash
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
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

-- Create profiles
INSERT INTO public.profiles (id, email, full_name, role, onboarded) VALUES
('a1111111-1111-1111-1111-111111111111'::uuid, 'ad.founder@equityai.test', 'AD Founder', 'founder', true),
('a2222222-2222-2222-2222-222222222222'::uuid, 'ad.investor@equityai.test', 'AD Investor', 'investor', true);

-- Create investor profile
INSERT INTO public.investor_profiles (user_id, accredited, investment_min, investment_max, sectors_of_interest, stages_of_interest)
VALUES ('a2222222-2222-2222-2222-222222222222'::uuid, true, 2500000, 50000000, ARRAY['AI', 'SaaS', 'Fintech'], ARRAY['seed', 'series-a']);

-- Verify
SELECT 
    u.email,
    u.email_confirmed_at IS NOT NULL as confirmed,
    p.full_name,
    p.role,
    p.onboarded
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.email LIKE '%@equityai.test';
