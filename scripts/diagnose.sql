-- Check if the trigger function exists and has issues
SELECT 
    proname as function_name,
    prosrc as source_code
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- Check if trigger exists
SELECT 
    tgname as trigger_name,
    tgrelid::regclass as table_name
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- Check profiles table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles';
