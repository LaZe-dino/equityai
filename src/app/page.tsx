'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Zap, Users, TrendingUp, Sparkles, Lock, Building2, CheckCircle2 } from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
};

export default function HomePage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen overflow-hidden bg-[#0a0a0f]">
      {/* Premium gradient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-[600px] w-[600px] rounded-full bg-blue-900/10 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-amber-900/10 blur-[100px]" />
        <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-indigo-900/5 blur-[80px]" />
      </div>

      {/* Nav */}
      <nav className="fixed top-0 right-0 left-0 z-50 border-b border-white/[0.04] bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600 shadow-lg shadow-amber-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Equity<span className="text-amber-500">AI</span>
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-400 transition-colors hover:text-white"
            >
              {t('nav.login')}
            </Link>
            <Link href="/signup" className="ml-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black transition-all hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/25">
              {t('nav.getStarted')}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center px-6 pt-24">
        <motion.div
          className="mx-auto max-w-5xl text-center"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          {/* Trust Badge */}
          <motion.div variants={fadeInUp} custom={0} className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5">
              <Shield className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs font-medium text-amber-400">SEC Compliant · Private Securities Platform</span>
            </div>
          </motion.div>

          <motion.h1
            className="text-5xl font-bold leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl"
            variants={fadeInUp}
            custom={1}
          >
            Private Markets{' '}
            <span className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
              Reimagined
            </span>
          </motion.h1>

          <motion.p
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-neutral-400"
            variants={fadeInUp}
            custom={2}
          >
            Connect with verified investors and vetted startups. 
            Streamlined SAFEs, transparent terms, seamless closes.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            variants={fadeInUp}
            custom={3}
          >
            <Link href="/signup?role=founder" className="group flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black transition-all hover:bg-neutral-200">
              <Building2 className="h-4 w-4" />
              Raise Capital
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/signup?role=investor" className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:border-amber-500/30 hover:bg-amber-500/10">
              <TrendingUp className="h-4 w-4" />
              Start Investing
            </Link>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            className="mx-auto mt-20 grid max-w-3xl grid-cols-3 gap-8 border-y border-white/[0.06] py-8"
            variants={fadeInUp}
            custom={4}
          >
            <Stat value="$50M+" label="Capital Raised" />
            <Stat value="200+" label="Active Investors" />
            <Stat value="35+" label="Companies Funded" />
          </motion.div>
        </motion.div>
      </section>

      {/* Trust Logos */}
      <section className="relative px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-xs font-medium uppercase tracking-widest text-neutral-600">
            Trusted by innovative companies
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-12 opacity-50">
            {['TechCorp', 'StartupX', 'VentureCo', 'InnovateLab', 'FutureFund'].map((name) => (
              <div key={name} className="flex items-center gap-2 text-neutral-500">
                <Building2 className="h-5 w-5" />
                <span className="text-sm font-semibold">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative px-6 py-32">
        <div className="mx-auto max-w-6xl">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-medium uppercase tracking-widest text-amber-500">How It Works</span>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-white">
              Three steps to your raise
            </h2>
          </motion.div>

          <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-3">
            <StepCard
              number="01"
              title="Create Your Profile"
              description="Set up your company or investor profile in minutes. Verified identity, transparent terms."
              index={0}
            />
            <StepCard
              number="02"
              title="Connect & Negotiate"
              description="Founders post offerings. Investors browse and express interest. All terms upfront."
              index={1}
            />
            <StepCard
              number="03"
              title="Close Seamlessly"
              description="Digital SAFEs, automated document handling, wire instructions. Done deal."
              index={2}
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-medium uppercase tracking-widest text-amber-500">Features</span>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-white">
              Everything you need to close
            </h2>
          </motion.div>

          <div className="mt-20 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<Zap className="h-6 w-6 text-amber-500" />}
              title="Lightning Fast"
              description="From signup to live offering in under 10 minutes. No paperwork delays."
              index={0}
            />
            <FeatureCard
              icon={<Lock className="h-6 w-6 text-emerald-400" />}
              title="Bank-Grade Security"
              description="SOC 2 compliant infrastructure. Your data is encrypted and protected."
              index={1}
            />
            <FeatureCard
              icon={<Users className="h-6 w-6 text-blue-400" />}
              title="Verified Network"
              description="Every investor and founder is identity-verified. No bots, no scams."
              index={2}
            />
            <FeatureCard
              icon={<CheckCircle2 className="h-6 w-6 text-amber-400" />}
              title="Compliant by Design"
              description="Built-in SEC compliance checks. Accredited investor verification included."
              index={3}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-6 py-32">
        <div className="mx-auto max-w-4xl">
          <motion.div
            className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-[#0a0a0f] to-blue-900/10 p-12 text-center md:p-16"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(251,191,36,0.1),transparent_50%)]" />
            <h2 className="relative text-3xl font-bold tracking-tight text-white md:text-4xl">
              Ready to raise or invest?
            </h2>
            <p className="relative mx-auto mt-4 max-w-lg text-lg text-neutral-400">
              Join hundreds of founders and investors already using EquityAI to build the future.
            </p>
            <div className="relative mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signup?role=founder" className="rounded-lg bg-amber-500 px-6 py-3 text-sm font-semibold text-black transition-all hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/25">
                Start Raising
              </Link>
              <Link href="/signup?role=investor" className="rounded-lg border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-all hover:border-amber-500/30 hover:bg-amber-500/10">
                Explore Offerings
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/[0.04] px-6 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">
              Equity<span className="text-amber-500">AI</span>
            </span>
          </div>
          <p className="text-sm text-neutral-600">
            &copy; {new Date().getFullYear()} EquityAI. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-neutral-500">
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-3xl font-bold text-white sm:text-4xl">{value}</p>
      <p className="mt-1 text-sm text-neutral-500">{label}</p>
    </div>
  );
}

function StepCard({ number, title, description, index }: { number: string; title: string; description: string; index: number }) {
  return (
    <motion.div
      className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 backdrop-blur-sm"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
    >
      <span className="text-5xl font-bold text-white/[0.08]">{number}</span>
      <h3 className="mt-4 text-xl font-semibold text-white">{title}</h3>
      <p className="mt-2 leading-relaxed text-neutral-500">{description}</p>
    </motion.div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  index,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}) {
  return (
    <motion.div
      className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm transition-colors hover:border-amber-500/20 hover:bg-white/[0.04]"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
    >
      <div className="inline-flex rounded-xl bg-white/[0.04] p-3">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-neutral-500">{description}</p>
    </motion.div>
  );
}
