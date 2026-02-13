'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Zap, Users, TrendingUp, Sparkles } from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function HomePage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Floating gradient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="gradient-orb gradient-orb-1" />
        <div className="gradient-orb gradient-orb-2" />
        <div className="gradient-orb gradient-orb-3" />
      </div>

      {/* Nav */}
      <nav className="glass-nav fixed top-0 right-0 left-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Equity<span className="text-gradient">AI</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-neutral-400 transition-colors hover:text-white"
            >
              {t('nav.login')}
            </Link>
            <Link href="/signup" className="btn-primary text-sm">
              {t('nav.getStarted')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-screen items-center justify-center px-6 pt-20">
        <motion.div
          className="mx-auto max-w-4xl text-center"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.div variants={fadeInUp} custom={0}>
            <span className="badge badge-live mb-6 inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
              Now Open for Early Access
            </span>
          </motion.div>

          <motion.h1
            className="text-5xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-7xl"
            variants={fadeInUp}
            custom={1}
          >
            {t('hero.title')}{' '}
            <span className="text-gradient">{t('hero.titleAccent')}</span>
          </motion.h1>

          <motion.p
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-neutral-400"
            variants={fadeInUp}
            custom={2}
          >
            {t('hero.subtitle')}
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            variants={fadeInUp}
            custom={3}
          >
            <Link href="/signup?role=founder" className="btn-primary px-8 py-3.5 text-[15px]">
              {t('hero.raiseCapital')}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/signup?role=investor" className="btn-secondary px-8 py-3.5 text-[15px]">
              {t('hero.startInvesting')}
            </Link>
          </motion.div>

          {/* Floating glass card preview */}
          <motion.div
            className="mx-auto mt-20 max-w-3xl"
            variants={fadeInUp}
            custom={4}
          >
            <div className="glass-card glass-shine p-1">
              <div className="rounded-[16px] bg-gradient-to-b from-white/[0.04] to-transparent p-8">
                <div className="flex items-center gap-4 border-b border-white/[0.06] pb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-500">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-white">NeuralPay Inc.</h3>
                    <p className="text-sm text-neutral-500">FinTech · Seed · SAFE</p>
                  </div>
                  <span className="badge badge-live ml-auto">Live</span>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-6 text-center">
                  <div>
                    <p className="text-2xl font-bold text-white">$2M</p>
                    <p className="text-xs text-neutral-500">Target Raise</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">$25K</p>
                    <p className="text-xs text-neutral-500">Min. Investment</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gradient">14</p>
                    <p className="text-xs text-neutral-500">Interested</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold tracking-tight text-white">
              {t('features.heading')}
            </h2>
          </motion.div>

          <div className="mt-20 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<Zap className="h-6 w-6 text-orange-500" />}
              title={t('features.submit.title')}
              description={t('features.submit.desc')}
              index={0}
              color="from-orange-500/10 to-orange-600/5"
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6 text-red-400" />}
              title={t('features.review.title')}
              description={t('features.review.desc')}
              index={1}
              color="from-red-500/10 to-red-600/5"
            />
            <FeatureCard
              icon={<Users className="h-6 w-6 text-amber-400" />}
              title={t('features.connect.title')}
              description={t('features.connect.desc')}
              index={2}
              color="from-amber-500/10 to-amber-600/5"
            />
            <FeatureCard
              icon={<TrendingUp className="h-6 w-6 text-orange-400" />}
              title={t('features.close.title')}
              description={t('features.close.desc')}
              index={3}
              color="from-orange-400/10 to-red-500/5"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-6 py-32">
        <div className="mx-auto max-w-4xl">
          <motion.div
            className="glass-card overflow-hidden p-12 text-center md:p-16"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-600/5 via-transparent to-red-600/5" />
            <h2 className="relative text-3xl font-bold tracking-tight text-white md:text-4xl">
              {t('cta.heading')}
            </h2>
            <p className="relative mt-4 text-lg text-neutral-400">
              {t('cta.subtitle')}
            </p>
            <Link href="/signup" className="btn-primary relative mt-8 px-8 py-3.5 text-[15px]">
              {t('cta.button')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/[0.04] px-6 py-12">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">
              Equity<span className="text-gradient">AI</span>
            </span>
          </div>
          <p className="text-sm text-neutral-600">
            &copy; {new Date().getFullYear()} EquityAI. {t('footer.rights')}
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  index,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
  color: string;
}) {
  return (
    <motion.div
      className="glass-card p-6"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
    >
      <div className={`inline-flex rounded-2xl bg-gradient-to-br ${color} p-3`}>
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-neutral-500">{description}</p>
    </motion.div>
  );
}
