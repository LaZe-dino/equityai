const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://xikswjbanjuwepbsqngj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhpa3N3amJhbmp1d2VwYnNxbmdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTAwNDExNSwiZXhwIjoyMDg2NTgwMTE1fQ.JEtOCRUHrcZU-q4KtluI2RI2Hy_V-5kYxcc7OF9KmSs'
);

async function run() {
  console.log('Creating accounts via SQL...\n');
  
  const sql = `
    -- Drop trigger temporarily
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    
    -- Insert founder
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      'ad.founder@equityai.test',
      crypt('TestPass123!', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"AD Founder","role":"founder"}',
      NOW(),
      NOW()
    )
    ON CONFLICT (email) DO UPDATE SET
      encrypted_password = crypt('TestPass123!', gen_salt('bf')),
      email_confirmed_at = NOW();
    
    -- Insert investor
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      'ad.investor@equityai.test',
      crypt('TestPass123!', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"AD Investor","role":"investor"}',
      NOW(),
      NOW()
    )
    ON CONFLICT (email) DO UPDATE SET
      encrypted_password = crypt('TestPass123!', gen_salt('bf')),
      email_confirmed_at = NOW();
    
    -- Create profiles
    INSERT INTO public.profiles (id, email, full_name, role, onboarded)
    SELECT id, email, raw_user_meta_data->>'full_name', raw_user_meta_data->>'role', true
    FROM auth.users
    WHERE email IN ('ad.founder@equityai.test', 'ad.investor@equityai.test')
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      role = EXCLUDED.role,
      onboarded = true;
    
    SELECT 'Done' as status;
  `;
  
  const { error } = await supabase.rpc('exec_sql', { sql });
  
  if (error) {
    console.error('Error:', error.message);
    console.log('\nPlease run the SQL manually in Supabase Dashboard:');
    console.log('File: scripts/fix-and-create-users.sql');
  } else {
    console.log('✅ Accounts created successfully!');
  }
}

run();
