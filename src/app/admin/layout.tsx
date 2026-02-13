import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardShell from '@/components/dashboard/shell';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  let { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    const meta = user.user_metadata || {};
    const { data: newProfile } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email || '',
        full_name: meta.full_name || user.email?.split('@')[0] || 'User',
        role: meta.role || 'investor',
      }, { onConflict: 'id' })
      .select()
      .single();
    profile = newProfile;
  }

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard');
  }

  return <DashboardShell profile={profile}>{children}</DashboardShell>;
}
