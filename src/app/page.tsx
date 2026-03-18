"use client";

import ShinyText from "@/components/ShinyText";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  LineChart,
  BrainCircuit,
  TrendingUp,
  Bell,
  History,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

const FEATURES = [
  {
    icon: LineChart,
    color: "text-cyan-400",
    title: "Daily Risk Score",
    desc: "Weighted scoring across sleep, stress, deadlines, and workload to surface crash risk the moment you check in.",
  },
  {
    icon: BrainCircuit,
    color: "text-violet-400",
    title: "Consent-Based AI Plans",
    desc: "Recovery steps are only generated when you explicitly opt in per check-in — your data, your call.",
  },
  {
    icon: ShieldCheck,
    color: "text-emerald-400",
    title: "Privacy by Default",
    desc: "Analytics are opt-in. Logs auto-expire. Account deletion is one click. You own your data.",
  },
  {
    icon: TrendingUp,
    color: "text-pink-400",
    title: "Trend Tracking",
    desc: "Visualise your risk score over 7, 14, or 30 days to catch recurring patterns before they become breakdowns.",
  },
  {
    icon: Bell,
    color: "text-amber-400",
    title: "Crash Alerts",
    desc: "A persistent banner surfaces anytime your risk crosses the critical threshold, so you never miss a warning.",
  },
  {
    icon: History,
    color: "text-sky-400",
    title: "Full Check-in History",
    desc: "Browse every past submission with date, score, and AI notes — exportable or deletable whenever you want.",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Log your day",
    desc: "Fill in a quick 5-field check-in: hours slept, study load, stress level, social interaction, and upcoming deadlines.",
  },
  {
    num: "02",
    title: "Get your risk score",
    desc: "Our burnout engine calculates a 0–100 risk score instantly using a weighted formula built on student wellbeing research.",
  },
  {
    num: "03",
    title: "Act on it",
    desc: "Review your score, optionally generate an AI recovery plan, and track how your habits change over time.",
  },
];

const STATS = [
  { stat: "67%", label: "of students experience burnout before graduation" },
  {
    stat: "3–5 days",
    label: "average recovery time from a single burnout episode",
  },
  {
    stat: "< 5 min",
    label: "to complete a Crashko check-in and get your score",
  },
];

const PRINCIPLES = [
  "Your check-in data is never sold or shared with anyone",
  "AI processing only runs with your explicit per-check-in consent",
  "Analytics (Vercel) are opt-in via a banner — never silently enabled",
  "Logs are auto-deleted after 90 days; manual deletion available anytime",
  "Account deletion is immediate, complete, and irreversible",
];

const FAQS = [
  {
    q: "Is my data sold to anyone?",
    a: "No. Your check-in data is stored only for your own history and is never shared with or sold to third parties.",
  },
  {
    q: "Do I need to enable AI to use Crashko?",
    a: "No. The risk score engine runs without AI. AI-generated recovery plans are entirely opt-in and you choose per check-in.",
  },
  {
    q: "How long is my data kept?",
    a: "Logs are automatically purged after 90 days. You can delete individual entries or your entire account anytime in Settings.",
  },
  {
    q: "Is this only for students?",
    a: "The scoring model is calibrated for student workloads, but anyone dealing with deadlines, sleep debt, or high stress can benefit.",
  },
];

export default function LandingPage() {
  const { data: session } = useSession();
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    let rafId = 0;

    const syncScrollUI = () => {
      const y = window.scrollY;
      const nextShowHint = y < 40;
      const nextShowTop = y > 220;

      setShowScrollHint((prev) =>
        prev === nextShowHint ? prev : nextShowHint,
      );
      setShowBackToTop((prev) => (prev === nextShowTop ? prev : nextShowTop));
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        syncScrollUI();
      });
    };

    syncScrollUI();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  const handleGetStarted = () => {
    if (session?.user) {
      window.location.href = "/dashboard";
    } else {
      signIn("google", { callbackUrl: "/dashboard" });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollDown = () => {
    const next = document.getElementById("how-it-works");
    if (next) {
      next.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    window.scrollTo({ top: window.innerHeight * 0.85, behavior: "smooth" });
  };

  return (
    <div className="flex-1 overflow-x-hidden">
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative mx-auto flex min-h-[90vh] max-w-5xl flex-col items-center justify-center px-4 text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
          className="mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-slate-400"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.10)",
          }}
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          Free for students
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={1}
        >
          <ShinyText
            as="h1"
            className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl"
          >
            Predict burnout before
            <br className="hidden sm:block" />
            it predicts your day.
          </ShinyText>
        </motion.div>

        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={2}
          className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg"
        >
          Crashko is a student wellbeing tool that scores your daily inputs,
          tracks trends over time, and — only when you say so — generates an AI
          recovery plan to help you bounce back before burnout hits.
        </motion.p>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={3}
          className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <button
            type="button"
            onClick={handleGetStarted}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white sm:w-auto"
            style={{
              background:
                "linear-gradient(135deg, #06d6d0 0%, #818cf8 50%, #f472b6 100%)",
            }}
          >
            Get Started
            <ArrowRight size={15} />
          </button>
          <a
            href="#how-it-works"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-slate-300 hover:text-white sm:w-auto"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            See how it works
            <ChevronDown size={14} />
          </a>
        </motion.div>

        {/* Scroll hint */}
        {showScrollHint && (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            onClick={scrollDown}
            className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 text-slate-700 transition-colors hover:text-slate-500"
          >
            <span className="text-[10px] uppercase tracking-widest">
              Scroll
            </span>
            <ChevronDown size={13} className="animate-bounce" />
          </motion.button>
        )}
      </section>

      {showBackToTop && (
        <motion.button
          type="button"
          aria-label="Back to top"
          onClick={scrollToTop}
          initial={{ opacity: 0, y: 12, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-3 z-40 inline-flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-full px-3 py-2 text-xs font-semibold text-white shadow-lg sm:bottom-6 sm:right-6 sm:gap-1.5 sm:px-3.5"
          style={{
            background:
              "linear-gradient(135deg, rgba(6,214,208,0.95) 0%, rgba(129,140,248,0.95) 55%, rgba(244,114,182,0.95) 100%)",
            border: "1px solid rgba(255,255,255,0.22)",
          }}
        >
          <ChevronUp size={14} />
          <span className="hidden sm:inline">Top</span>
        </motion.button>
      )}

      {/* ── PROBLEM / STATS ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 py-24 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <ShinyText as="h2" className="text-2xl font-bold sm:text-4xl">
            Burnout doesn&apos;t announce itself.
          </ShinyText>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">
            By the time you feel it, it&apos;s already cost you days of
            productivity. Most tools tell you to &ldquo;rest more.&rdquo;
            Crashko tells you{" "}
            <span className="font-medium text-white">when and why</span> —
            before the crash.
          </p>
        </motion.div>

        <div
          className="mt-12 grid overflow-hidden rounded-2xl sm:grid-cols-3"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          {STATS.map(({ stat, label }, i) => (
            <motion.div
              key={stat}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i}
              className="px-6 py-10"
              style={{ background: "#05070f" }}
            >
              <p className="text-3xl font-extrabold text-white">{stat}</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                {label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────── */}
      <section id="how-it-works" className="mx-auto max-w-5xl px-4 py-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
            How it works
          </p>
          <ShinyText as="h2" className="mt-2 text-2xl font-bold sm:text-4xl">
            Three steps. That&apos;s it.
          </ShinyText>
        </motion.div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map(({ num, title, desc }, i) => (
            <motion.div
              key={num}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i}
              className="rounded-2xl p-7"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <span className="text-5xl font-black text-slate-800">{num}</span>
              <h3 className="mt-4 text-base font-semibold text-white">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 py-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">
            Features
          </p>
          <ShinyText as="h2" className="mt-2 text-2xl font-bold sm:text-4xl">
            Everything you need, nothing you don&apos;t.
          </ShinyText>
        </motion.div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, color, title, desc }, i) => (
            <motion.article
              key={title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i % 3}
              className="rounded-2xl p-6"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <Icon className={`mb-3 ${color}`} size={20} />
              <h3 className="text-sm font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {desc}
              </p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* ── PRINCIPLES ────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-4 py-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="rounded-2xl p-8 text-center sm:p-14"
          style={{
            background:
              "linear-gradient(135deg, rgba(6,214,208,0.05) 0%, rgba(129,140,248,0.07) 50%, rgba(244,114,182,0.05) 100%)",
            border: "1px solid rgba(255,255,255,0.09)",
          }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
            Our principles
          </p>
          <ShinyText as="h2" className="mt-2 text-2xl font-bold sm:text-3xl">
            Built on honest foundations.
          </ShinyText>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
            No dark patterns. No hidden data collection. No upsells. Crashko
            exists to help students, so it earns trust by being transparent
            about exactly what it does and doesn&apos;t do.
          </p>
          <ul className="mt-8 inline-flex flex-col gap-3 text-left text-sm text-slate-300">
            {PRINCIPLES.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2
                  className="mt-0.5 shrink-0 text-emerald-400"
                  size={16}
                />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Link
              href="/legal"
              className="text-xs text-slate-500 underline underline-offset-4 hover:text-slate-300"
            >
              Read our Privacy Policy →
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-4 py-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-pink-400">
            FAQ
          </p>
          <ShinyText as="h2" className="mt-2 text-2xl font-bold sm:text-4xl">
            Common questions.
          </ShinyText>
        </motion.div>

        <div className="mt-10 space-y-4">
          {FAQS.map(({ q, a }, i) => (
            <motion.div
              key={q}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i}
              className="rounded-2xl px-6 py-5"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <p className="text-sm font-semibold text-white">{q}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{a}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-4 py-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="rounded-3xl px-8 py-20 text-center"
          style={{
            background:
              "linear-gradient(135deg, rgba(6,214,208,0.07) 0%, rgba(129,140,248,0.09) 50%, rgba(244,114,182,0.07) 100%)",
            border: "1px solid rgba(255,255,255,0.10)",
          }}
        >
          <ShinyText as="h2" className="text-2xl font-extrabold sm:text-4xl">
            Start before you burn out.
          </ShinyText>
          <p className="mx-auto mt-4 max-w-md text-sm text-slate-400 sm:text-base">
            Takes 5 minutes. Free forever for students. No card needed.
          </p>
          <button
            type="button"
            onClick={handleGetStarted}
            className="mt-8 inline-flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-semibold text-white"
            style={{
              background:
                "linear-gradient(135deg, #06d6d0 0%, #818cf8 50%, #f472b6 100%)",
            }}
          >
            Create your free account
            <ArrowRight size={15} />
          </button>
        </motion.div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────── */}
      <footer
        className="mt-4 py-10 text-center text-xs text-slate-600"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <p className="text-sm font-semibold text-slate-500">Crashko</p>
        <p className="mt-1">AI-powered burnout prediction for students.</p>
        <div className="mt-4 flex items-center justify-center gap-5 text-slate-500">
          <Link href="/legal" className="hover:text-slate-300">
            Privacy Policy
          </Link>
          <Link href="/signup" className="hover:text-slate-300">
            Sign In
          </Link>
        </div>
        <p className="mt-5">
          © {new Date().getFullYear()} Crashko. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
