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
  
  try {
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
      console.error('Create user error:', error.message);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return null;
    }

    console.log('✓ User created:', data.user.id);
    return data.user;
  } catch (e) {
    console.error('Exception:', e.message);
    return null;
  }
}

async function main() {
  // Create founder
  const founder = await createUser(
    'ad.founder@equityai.test',
    'TestPass123!',
    'AD Founder',
    'founder'
  );

  // Create investor  
  const investor = await createUser(
    'ad.investor@equityai.test',
    'TestPass123!',
    'AD Investor',
    'investor'
  );

  console.log('\n========================================');
  if (founder && investor) {
    console.log('✅ Both accounts created!');
    console.log('Founder:  ad.founder@equityai.test / TestPass123!');
    console.log('Investor: ad.investor@equityai.test / TestPass123!');
  } else {
    console.log('❌ Some accounts failed to create');
  }
}

main();
