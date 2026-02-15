-- Debug the trigger issue
-- Check if profiles table exists and its constraints
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'profiles';

-- Check column types
SELECT column_name, data_type, udt_name, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles';

-- Try to see if we can insert manually (this will help diagnose)
-- DO $$
-- BEGIN
--     INSERT INTO profiles (id, email, full_name, role)
--     VALUES (
--         '00000000-0000-0000-0000-000000000001'::uuid,
--         'test@example.com',
--         'Test User',
--         'investor'
--     );
-- EXCEPTION WHEN OTHERS THEN
--     RAISE NOTICE 'Error: %', SQLERRM;
-- END $$;
