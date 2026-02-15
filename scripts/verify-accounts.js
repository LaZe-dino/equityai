const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://xikswjbanjuwepbsqngj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhpa3N3amJhbmp1d2VwYnNxbmdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwMDQxMTUsImV4cCI6MjA4NjU4MDExNX0.9ZLoNyhpaEFnUK-XPAoJoYsjGDvf8iVz2f1_9WU1Zd0'
);

async function testLogin(email, password) {
  console.log(`\nTesting login for: ${email}`);
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('❌ Login failed:', error.message);
    return false;
  }

  console.log('✅ Login successful!');
  console.log('   User ID:', data.user.id);
  console.log('   Role:', data.user.user_metadata?.role);
  
  // Sign out to clean up
  await supabase.auth.signOut();
  return true;
}

async function main() {
  console.log('========================================');
  console.log('Verifying EquityAI Test Accounts');
  console.log('========================================');

  const founderOk = await testLogin('ad.founder@equityai.test', 'TestPass123!');
  const investorOk = await testLogin('ad.investor@equityai.test', 'TestPass123!');

  console.log('\n========================================');
  if (founderOk && investorOk) {
    console.log('✅ Both accounts working!');
    console.log('\nYou can now log in at: http://localhost:3000/login');
    console.log('\nCredentials:');
    console.log('  Founder:  ad.founder@equityai.test / TestPass123!');
    console.log('  Investor: ad.investor@equityai.test / TestPass123!');
  } else {
    console.log('❌ Some accounts have issues');
  }
}

main();
