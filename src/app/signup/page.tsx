'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Suspense } from 'react';
import { Sparkles, Building2, LineChart } from 'lucide-react';

function SignUpForm() {
  const t = useTranslations('auth');
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'founder' | 'investor' | ''>(
    defaultRole === 'founder' || defaultRole === 'investor' ? defaultRole : ''
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      setError('Please select your role');
      return;
    }
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
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
      setError(error.message);
      setLoading(false);
      return;
    }

    // After signup, ensure the profile exists (the DB trigger should create it,
    // but we need to wait a moment for it to propagate)
    // Then redirect to onboarding
    router.push('/onboarding');
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      {/* Floating gradient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="gradient-orb gradient-orb-1" />
        <div className="gradient-orb gradient-orb-2" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Equity<span className="text-gradient">AI</span>
            </span>
          </Link>
          <h2 className="mt-8 text-2xl font-bold text-white">{t('createAccount')}</h2>
          <p className="mt-2 text-sm text-neutral-500">{t('signUpSubtitle')}</p>
        </div>

        <form onSubmit={handleSignUp} className="mt-8">
          <div className="glass-card p-6 space-y-5">
            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-neutral-300 mb-1.5">
                {t('fullName')}
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="glass-input"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-1.5">
                {t('email')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="glass-input"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-300 mb-1.5">
                {t('password')}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="glass-input"
                placeholder="••••••••"
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-3">
                {t('iAmA')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('founder')}
                  className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                    role === 'founder'
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-white/10 hover:border-white/20 hover:bg-white/[0.03]'
                  }`}
                >
                  <Building2 className={`h-6 w-6 ${role === 'founder' ? 'text-orange-500' : 'text-neutral-500'}`} />
                  <span className={`text-sm font-semibold ${role === 'founder' ? 'text-orange-400' : 'text-neutral-300'}`}>
                    {t('founder')}
                  </span>
                  <span className="text-xs text-neutral-500 text-center">{t('founderDesc')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('investor')}
                  className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                    role === 'investor'
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-white/10 hover:border-white/20 hover:bg-white/[0.03]'
                  }`}
                >
                  <LineChart className={`h-6 w-6 ${role === 'investor' ? 'text-orange-500' : 'text-neutral-500'}`} />
                  <span className={`text-sm font-semibold ${role === 'investor' ? 'text-orange-400' : 'text-neutral-300'}`}>
                    {t('investor')}
                  </span>
                  <span className="text-xs text-neutral-500 text-center">{t('investorDesc')}</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
            >
              {loading ? t('creatingAccount') : t('signUp')}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          {t('haveAccount')}{' '}
          <Link href="/login" className="font-medium text-orange-500 hover:text-orange-400">
            {t('signIn')}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  );
}
