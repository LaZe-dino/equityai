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
  Menu,
  X,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { NotificationBell } from '@/components/notifications/notification-bell';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex min-h-screen">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar fixed left-0 top-0 z-50 flex h-screen w-64 flex-col px-4 py-6 transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Close button on mobile */}
        <button
          onClick={closeSidebar}
          className="absolute top-4 right-4 p-2 text-neutral-500 hover:text-white lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 px-3 mb-8" onClick={closeSidebar}>
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
                onClick={closeSidebar}
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
              onClick={closeSidebar}
              className="sidebar-link mt-4 border border-dashed border-orange-500/30 text-orange-500 hover:bg-orange-500/10"
            >
              <PlusCircle className="h-5 w-5" />
              New Offering
            </Link>
          )}
        </nav>

        {/* Bottom section */}
        <div className="space-y-1 border-t border-white/[0.06] pt-4">
          <Link href="/dashboard/settings" onClick={closeSidebar} className="sidebar-link">
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
      <main className="flex-1 lg:ml-64">
        {/* Mobile header */}
        <div className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-xl px-4 py-3 lg:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-neutral-400 hover:text-white"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-sm font-semibold text-white">
              Equity<span className="text-gradient">AI</span>
            </span>
          </div>
          <NotificationBell />
        </div>

        {/* Desktop header with notifications */}
        <div className="hidden lg:flex sticky top-0 z-30 items-center justify-end gap-4 border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-xl px-6 py-3">
          <NotificationBell />
        </div>

        <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
