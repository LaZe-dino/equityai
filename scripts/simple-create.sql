-- Simple account creation - run each block separately if needed

-- First, let's see what's there
SELECT count(*) as user_count FROM auth.users WHERE email LIKE '%@equityai.test';
SELECT count(*) as profile_count FROM public.profiles WHERE email LIKE '%@equityai.test';

-- Clean up
DELETE FROM public.investor_profiles WHERE user_id IN (SELECT id FROM auth.users WHERE email LIKE '%@equityai.test');
DELETE FROM public.profiles WHERE email LIKE '%@equityai.test';
DELETE FROM auth.users WHERE email LIKE '%@equityai.test';

-- Create founder
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES (
  'a0000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'ad.founder@equityai.test',
  crypt('TestPass123!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"AD Founder","role":"founder"}',
  NOW(),
  NOW()
);

-- Create investor
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES (
  'a0000000-0000-0000-0000-000000000002'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'ad.investor@equityai.test',
  crypt('TestPass123!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"AD Investor","role":"investor"}',
  NOW(),
  NOW()
);

-- Create profiles
INSERT INTO public.profiles (id, email, full_name, role, onboarded) VALUES
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'ad.founder@equityai.test', 'AD Founder', 'founder', true),
  ('a0000000-0000-0000-0000-000000000002'::uuid, 'ad.investor@equityai.test', 'AD Investor', 'investor', true);

-- Create investor profile
INSERT INTO public.investor_profiles (user_id, accredited, investment_min, investment_max, sectors_of_interest, stages_of_interest)
VALUES ('a0000000-0000-0000-0000-000000000002'::uuid, true, 2500000, 50000000, ARRAY['AI', 'SaaS', 'Fintech'], ARRAY['seed', 'series-a']);

-- Verify
SELECT u.email, u.email_confirmed_at IS NOT NULL as confirmed, p.full_name, p.role
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.email LIKE '%@equityai.test';
