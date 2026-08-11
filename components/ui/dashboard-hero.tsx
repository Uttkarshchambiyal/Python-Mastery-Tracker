"use client";

import React from "react";
import { motion } from "motion/react";
import {
  Flame,
  Timer,
  TrendingUp,
  Zap,
  ChevronRight,
  Star,
} from "lucide-react";

/* ── Inline GitHub SVG (removed from lucide-react v1.28+) ── */
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   TYPES — Prepared for prop-driven state
   ═══════════════════════════════════════════════════════════ */
export interface DashboardHeroProps {
  /** Current consecutive learning streak in days */
  currentStreak?: number;
  /** Topics completed per day pace (used for ETA calc) */
  topicsPerDay?: number;
  /** Total topics in the curriculum */
  totalTopics?: number;
  /** Number of topics already completed */
  completedTopics?: number;
  /** Community member avatars (Unsplash URLs) */
  communityAvatars?: string[];
  /** Community size label */
  communitySize?: string;
}

/* ═══════════════════════════════════════════════════════════
   MOCK DATA — Default values used when no props provided
   ═══════════════════════════════════════════════════════════ */
const DEFAULTS: Required<DashboardHeroProps> = {
  currentStreak: 12,
  topicsPerDay: 2,
  totalTopics: 68,
  completedTopics: 23,
  communityAvatars: [
    "/avatar-vector.png",
    "/avatar-pixel.jpg",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=80&h=80&fit=crop&crop=face",
  ],
  communitySize: "2.4K learners",
};

/* ═══════════════════════════════════════════════════════════
   ANIMATION VARIANTS
   ═══════════════════════════════════════════════════════════ */
const EASE_OUT_EXPO: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay,
      ease: EASE_OUT_EXPO,
    },
  }),
};

/* ═══════════════════════════════════════════════════════════
   CIRCULAR PROGRESS — SVG Component
   ═══════════════════════════════════════════════════════════ */
function CircularProgress({
  percentage,
  size = 72,
  strokeWidth = 5,
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        className="progress-ring-track"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
      />
      <motion.circle
        className="progress-ring-fill"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.5, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function DashboardHero(props: DashboardHeroProps) {
  const {
    currentStreak,
    topicsPerDay,
    totalTopics,
    completedTopics,
    communityAvatars,
    communitySize,
  } = { ...DEFAULTS, ...props };

  const percentage = Math.round((completedTopics / totalTopics) * 100);
  const remainingTopics = totalTopics - completedTopics;
  const estDays = Math.ceil(remainingTopics / topicsPerDay);

  return (
    <div id="hero" className="relative min-h-screen overflow-hidden bg-deep-blue text-white grid-overlay">
      {/* ═══════════════════════════════════
          AMBIENT BACKGROUND ELEMENTS
          ═══════════════════════════════════ */}

      {/* Large gradient orb — top left */}
      <div
        className="pointer-events-none absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full opacity-40"
        style={{
          background:
            "radial-gradient(circle, rgba(204,255,0,0.15) 0%, transparent 70%)",
        }}
      />

      {/* Smaller orb — bottom right */}
      <div
        className="pointer-events-none absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full opacity-30"
        style={{
          background:
            "radial-gradient(circle, rgba(0,56,255,0.4) 0%, transparent 70%)",
        }}
      />

      {/* Diagonal neon streak */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[800px] w-[2px] origin-top rotate-[25deg] opacity-15"
        style={{
          background:
            "linear-gradient(to bottom, #CCFF00, transparent)",
        }}
      />

      {/* ═══════════════════════════════════
          NAVBAR
          ═══════════════════════════════════ */}
      <motion.nav
        className="relative z-50 flex items-center justify-between px-6 py-5 md:px-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon">
            <Zap className="h-5 w-5 text-deep-blue-dark" strokeWidth={3} />
          </div>
          <span
            className="font-heading text-xl tracking-tight text-white"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            PYTHON CLUB
          </span>
        </div>

        {/* Nav links — desktop */}
        <div className="hidden items-center gap-8 md:flex">
          {[
            { label: "Dashboard", href: "#hero" },
            { label: "Curriculum", href: "#curriculum" },
            { label: "Projects", href: "#projects" },
            { label: "Community", href: "#footer" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-white/60 transition-colors duration-200 hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Connect GitHub CTA */}
        <motion.button
          className="glass-card flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/20"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <GitHubIcon className="h-4 w-4" />
          Connect GitHub
        </motion.button>
      </motion.nav>

      {/* ═══════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════ */}
      <section className="relative z-10 px-6 pb-20 pt-8 md:px-10 md:pt-12 lg:pt-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_420px] lg:gap-16">
            {/* ─── LEFT: Hero Text ─── */}
            <div className="flex flex-col">
              {/* Eyebrow pill */}
              <motion.div
                className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-neon/30 bg-neon/10 px-4 py-1.5"
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                custom={0}
              >
                <span className="h-2 w-2 rounded-full bg-neon animate-pulse" />
                <span
                  className="text-xs font-semibold uppercase tracking-widest text-neon"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Now Tracking · 68 Topics
                </span>
              </motion.div>

              {/* Massive stacked headline */}
              <motion.div
                className="mb-6"
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                custom={0.1}
              >
                <h1
                  className="font-heading leading-[0.9] tracking-tight"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  <span className="text-shadow-brutal block text-[clamp(3.2rem,10vw,8rem)] uppercase text-white">
                    #PYTHON
                  </span>
                  <span className="text-shadow-brutal-neon block text-[clamp(3.2rem,10vw,8rem)] uppercase text-neon">
                    MASTERY
                  </span>
                  <span className="text-shadow-brutal block text-[clamp(3.2rem,10vw,8rem)] uppercase text-white">
                    TRACKER
                  </span>
                </h1>
              </motion.div>

              {/* Subtitle */}
              <motion.p
                className="mb-8 max-w-lg text-base leading-relaxed text-white/60 md:text-lg"
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                custom={0.25}
              >
                Track your Python journey from zero to mastery.{" "}
                <span className="text-white/90">68 topics. 8 phases. 6 real projects.</span>{" "}
                Built for builders who don&apos;t do half measures.
              </motion.p>

              {/* CTA Row */}
              <motion.div
                className="mb-10 flex flex-wrap items-center gap-4"
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                custom={0.35}
              >
                <motion.a
                  href="#curriculum"
                  className="group flex items-center gap-2 rounded-full bg-neon px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-deep-blue-dark transition-all duration-200"
                  whileHover={{ scale: 1.04, boxShadow: "0 0 40px rgba(204,255,0,0.4)" }}
                  whileTap={{ scale: 0.97 }}
                >
                  Start Tracking
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </motion.a>

                <motion.a
                  href="#curriculum"
                  className="glass-card rounded-full px-7 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/20"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  View Curriculum
                </motion.a>
              </motion.div>

              {/* Community avatars */}
              <motion.div
                className="flex items-center gap-4"
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                custom={0.45}
              >
                <div className="flex -space-x-3">
                  {communityAvatars.map((src, i) => (
                    <motion.img
                      key={i}
                      src={src}
                      alt={`Community member ${i + 1}`}
                      className="h-9 w-9 rounded-full border-2 border-deep-blue object-cover"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.08, duration: 0.4 }}
                    />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-3.5 w-3.5 fill-neon text-neon"
                      />
                    ))}
                  </div>
                  <p className="text-xs text-white/50">
                    Joined by{" "}
                    <span className="font-semibold text-white/80">
                      {communitySize}
                    </span>
                  </p>
                </div>
              </motion.div>
            </div>

            {/* ─── RIGHT: Floating Glass Cards ─── */}
            <div className="relative flex min-h-[480px] items-center justify-center lg:min-h-[560px]">
              {/* ───── CARD 1: Current Streak ───── */}
              <motion.div
                className="glass-card neon-pulse absolute left-0 top-4 z-30 w-[240px] rounded-2xl p-5 md:left-4 lg:left-0 lg:top-8 animate-[float_5s_ease-in-out_infinite]"
                initial={{ opacity: 0, y: 40, rotate: -3 }}
                animate={{ opacity: 1, y: 0, rotate: -3 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
                    Current Streak
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/20">
                    <Flame className="h-4 w-4 text-orange-400" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span
                    className="text-shadow-brutal-sm text-5xl font-bold text-white"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {currentStreak}
                  </span>
                  <span className="text-lg font-medium text-white/40">
                    Days
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-neon">
                  <TrendingUp className="h-3 w-3" />
                  <span className="font-medium">Personal best: 18 days</span>
                </div>
              </motion.div>

              {/* ───── CARD 2: Learning Pace ───── */}
              <motion.div
                className="glass-card-strong absolute right-0 top-1/2 z-20 w-[260px] -translate-y-1/2 rounded-2xl p-5 md:right-0 lg:-right-2 animate-[float_6s_ease-in-out_0.5s_infinite]"
                initial={{ opacity: 0, y: 40, rotate: 2 }}
                animate={{ opacity: 1, y: 0, rotate: 2 }}
                transition={{ duration: 0.7, delay: 0.5 }}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
                    Learning Pace
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neon/20">
                    <Timer className="h-4 w-4 text-neon" />
                  </div>
                </div>
                <div className="mb-1 text-sm text-white/70">
                  At{" "}
                  <span className="font-bold text-white">{topicsPerDay} topics/day</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span
                    className="text-shadow-brutal-sm text-4xl font-bold text-neon"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {estDays}
                  </span>
                  <span className="text-sm font-medium text-white/40">
                    days to finish
                  </span>
                </div>
                {/* Mini progress bar */}
                <div className="mt-4">
                  <div className="mb-1.5 flex justify-between text-[0.7rem] text-white/40">
                    <span>Progress</span>
                    <span>{percentage}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#0C101D]">
                    <motion.div
                      className="h-full rounded-full bg-neon"
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{
                        duration: 1.2,
                        delay: 0.8,
                        ease: EASE_OUT_EXPO,
                      }}
                    />
                  </div>
                </div>
              </motion.div>

              {/* ───── CARD 3: Total Progress ───── */}
              <motion.div
                className="glass-card absolute bottom-0 left-8 z-20 w-[200px] rounded-2xl p-5 md:left-12 lg:bottom-2 lg:left-6 animate-[float_7s_ease-in-out_1s_infinite]"
                initial={{ opacity: 0, y: 40, rotate: -1 }}
                animate={{ opacity: 1, y: 0, rotate: -1 }}
                transition={{ duration: 0.7, delay: 0.7 }}
              >
                <span className="mb-3 block text-xs font-semibold uppercase tracking-wider text-white/50">
                  Total Progress
                </span>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <CircularProgress percentage={percentage} size={72} strokeWidth={5} />
                    <span
                      className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {percentage}%
                    </span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
                      {completedTopics}
                      <span className="text-sm font-normal text-white/30">
                        /{totalTopics}
                      </span>
                    </div>
                    <p className="text-xs text-white/40">topics done</p>
                  </div>
                </div>
              </motion.div>

              {/* ───── Small floating accent badges ───── */}
              <motion.div
                className="absolute right-12 top-2 z-10 rounded-full bg-neon/20 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-widest text-neon animate-[float_4s_ease-in-out_0.3s_infinite]"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9, duration: 0.5 }}
              >
                PHASE 3
              </motion.div>

              <motion.div
                className="absolute bottom-16 right-4 z-10 rounded-full bg-[#0C101D] px-3 py-1 text-[0.65rem] font-semibold text-white/50 animate-[float_5s_ease-in-out_0.6s_infinite]"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1, duration: 0.5 }}
              >
                🐍 PY-24
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
