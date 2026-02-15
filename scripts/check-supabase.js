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

async function check() {
  console.log('Checking Supabase connection...');
  
  // Try to list users
  const { data, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error('Error:', error.message);
    console.error('Full error:', JSON.stringify(error, null, 2));
  } else {
    console.log('Success! Users found:', data.users.length);
    if (data.users.length > 0) {
      console.log('First user:', data.users[0].email);
    }
  }
}

check();
