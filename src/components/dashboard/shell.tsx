'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Profile } from '@/types';
import {
  LayoutDashboard,
  Building2,
  FileText,
  Users,
  Bookmark,
  Settings,
  LogOut,
  Sparkles,
  PlusCircle,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const founderLinks = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/company', label: 'My Company', icon: Building2 },
  { href: '/dashboard/offerings', label: 'My Offerings', icon: FileText },
  { href: '/dashboard/interests', label: 'Incoming Interests', icon: Users },
];

const investorLinks = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/offerings', label: 'Browse Offerings', icon: FileText },
  { href: '/dashboard/my-interests', label: 'My Interests', icon: Users },
  { href: '/dashboard/saved', label: 'Saved', icon: Bookmark },
];

export default function DashboardShell({
  profile,
  children,
}: {
  profile: Profile;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const links = profile.role === 'founder' ? founderLinks : investorLinks;

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="sidebar fixed left-0 top-0 z-40 flex h-screen w-64 flex-col px-4 py-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 px-3 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">
            Equity<span className="text-gradient">AI</span>
          </span>
        </Link>

        {/* Nav Links */}
        <nav className="flex-1 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
              >
                <Icon className="h-5 w-5" />
                {link.label}
              </Link>
            );
          })}

          {profile.role === 'founder' && (
            <Link
              href="/dashboard/offerings/new"
              className="sidebar-link mt-4 border border-dashed border-orange-500/30 text-orange-500 hover:bg-orange-500/10"
            >
              <PlusCircle className="h-5 w-5" />
              New Offering
            </Link>
          )}
        </nav>

        {/* Bottom section */}
        <div className="space-y-1 border-t border-white/[0.06] pt-4">
          <Link href="/dashboard/settings" className="sidebar-link">
            <Settings className="h-5 w-5" />
            Settings
          </Link>
          <button onClick={handleLogout} className="sidebar-link w-full text-left">
            <LogOut className="h-5 w-5" />
            Log out
          </button>
        </div>

        {/* User */}
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-white/[0.03] px-3 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-sm font-bold text-white">
            {profile.full_name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{profile.full_name}</p>
            <p className="truncate text-xs text-neutral-500 capitalize">{profile.role}</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 flex-1 p-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
