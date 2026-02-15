// Sign up users directly using the anon key (simulates frontend signup)
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xikswjbanjuwepbsqngj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhpa3N3amJhbmp1d2VwYnNxbmdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwMDQxMTUsImV4cCI6MjA4NjU4MDExNX0.9ZLoNyhpaEFnUK-XPAoJoYsjGDvf8iVz2f1_9WU1Zd0';

async function signUpUser(email, password, fullName, role) {
  console.log(`\nSigning up ${role}: ${email}`);
  
  // Create a fresh client for each signup
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
      },
    },
  });

  if (error) {
    console.error('❌ Signup error:', error.message);
    return null;
  }

  console.log('✓ User created:', data.user?.id);
  console.log('  Email confirmation required:', !data.user?.email_confirmed_at);
  
  return data.user;
}

async function main() {
  console.log('========================================');
  console.log('EquityAI Test Account Signup');
  console.log('========================================');

  const founder = await signUpUser(
    'ad.founder@equityai.test',
    'TestPass123!',
    'AD Founder',
    'founder'
  );

  const investor = await signUpUser(
    'ad.investor@equityai.test', 
    'TestPass123!',
    'AD Investor',
    'investor'
  );

  console.log('\n========================================');
  if (founder || investor) {
    console.log('Signup complete!');
    console.log('\nIMPORTANT: Check your Supabase Dashboard to confirm these users');
    console.log('and manually mark their emails as confirmed if needed.');
    console.log('\nCredentials:');
    console.log('  Founder:  ad.founder@equityai.test / TestPass123!');
    console.log('  Investor: ad.investor@equityai.test / TestPass123!');
  }
}

main();
