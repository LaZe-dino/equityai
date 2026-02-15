// Create users using Supabase Admin API with proper password handling
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://xikswjbanjuwepbsqngj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhpa3N3amJhbmp1d2VwYnNxbmdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTAwNDExNSwiZXhwIjoyMDg2NTgwMTE1fQ.JEtOCRUHrcZU-q4KtluI2RI2Hy_V-5kYxcc7OF9KmSs',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

async function createUser(email, password, fullName, role) {
  console.log(`\nCreating ${role}: ${email}`);
  
  // First delete if exists
  const { data: existing } = await supabase.auth.admin.listUsers();
  const userToDelete = existing?.users.find(u => u.email === email);
  if (userToDelete) {
    console.log('  Deleting existing user...');
    await supabase.auth.admin.deleteUser(userToDelete.id);
  }
  
  // Create new user
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role: role,
    },
  });

  if (error) {
    console.error('  ❌ Error:', error.message);
    return null;
  }

  console.log('  ✓ User created:', data.user.id);
  
  // Update profile to mark as onboarded
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ onboarded: true })
    .eq('id', data.user.id);
    
  if (profileError) {
    console.error('  ⚠ Profile update error:', profileError.message);
  } else {
    console.log('  ✓ Profile updated');
  }
  
  return data.user;
}

async function main() {
  console.log('========================================');
  console.log('Creating EquityAI Test Accounts');
  console.log('========================================');

  const founder = await createUser(
    'ad.founder@equityai.test',
    'TestPass123!',
    'AD Founder',
    'founder'
  );

  const investor = await createUser(
    'ad.investor@equityai.test',
    'TestPass123!',
    'AD Investor',
    'investor'
  );

  console.log('\n========================================');
  if (founder && investor) {
    console.log('✅ Accounts created successfully!');
    console.log('\nCredentials:');
    console.log('  Founder:  ad.founder@equityai.test / TestPass123!');
    console.log('  Investor: ad.investor@equityai.test / TestPass123!');
  } else {
    console.log('❌ Some accounts failed');
  }
}

main().catch(console.error);
EOF
node scripts/create-with-api.js