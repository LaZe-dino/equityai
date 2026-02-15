const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://xikswjbanjuwepbsqngj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhpa3N3amJhbmp1d2VwYnNxbmdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTAwNDExNSwiZXhwIjoyMDg2NTgwMTE1fQ.JEtOCRUHrcZU-q4KtluI2RI2Hy_V-5kYxcc7OF9KmSs',
  {
    auth: { autoRefreshToken: false, persistSession: false },
  }
);

async function check() {
  const { data, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error('Error:', error.message);
    return;
  }
  
  console.log('Users found:', data.users.length);
  data.users.forEach(u => {
    console.log('\nEmail:', u.email);
    console.log('ID:', u.id);
    console.log('Confirmed:', !!u.email_confirmed_at);
    console.log('Metadata:', JSON.stringify(u.user_metadata));
  });
}

check();
