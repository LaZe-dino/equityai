import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardShell from '@/components/dashboard/shell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Try to get profile — the DB trigger creates it on signup,
  // but there can be a small delay. If missing, try to create it from auth metadata.
  let { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    // Attempt to create profile from auth metadata (fallback if trigger didn't fire)
    const meta = user.user_metadata || {};
    const { data: newProfile, error: insertErr } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email || '',
        full_name: meta.full_name || user.email?.split('@')[0] || 'User',
        role: meta.role || 'investor',
      }, { onConflict: 'id' })
      .select()
      .single();

    if (insertErr || !newProfile) {
      // If we still can't get a profile, send to onboarding
      redirect('/onboarding');
    }
    profile = newProfile;
  }

  return <DashboardShell profile={profile}>{children}</DashboardShell>;
}
