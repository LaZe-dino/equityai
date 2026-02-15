-- Fix passwords using Supabase's expected format
-- The issue might be with how we're hashing the password

-- Let's update the passwords using a different approach
UPDATE auth.users 
SET encrypted_password = '$2a$10$abcdefghijklmnopqrstuuxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
WHERE email IN ('ad.founder@equityai.test', 'ad.investor@equityai.test');

-- Actually, let's try using pgcrypto properly or just use a known hash
-- First, let's see what a proper hash looks like from an existing user
SELECT email, substring(encrypted_password, 1, 30) as hash_prefix
FROM auth.users 
LIMIT 5;
