"use client";

import React from "react";
import HeroComponent from "@/components/ui/hero";
import { motion } from "motion/react";
import { BookOpen, Flame, Trophy, ArrowRight, Sparkles } from "lucide-react";
import curriculumData from "@/data/curriculum.json";
import { CurriculumData } from "@/lib/types";

const curriculum = curriculumData as CurriculumData;

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0038FF] dark:bg-[#09090B] text-white selection:bg-[#CCFF00] selection:text-black transition-colors duration-300">
      {/* ═══════════════════════════════════
          STEP 0: LANDING HERO COMPONENT
          ═══════════════════════════════════ */}
      <HeroComponent />

      {/* ═══════════════════════════════════
          CURRICULUM PREVIEW STRIP
          ═══════════════════════════════════ */}
      <section className="relative z-10 border-t border-white/10 dark:border-white/10 bg-[#0038FF] dark:bg-[#02040A] py-12 px-6 md:px-10 overflow-hidden transition-colors">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#CCFF00]">
                ROADMAP PREVIEW
              </span>
              <h2
                className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white mt-1"
                style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}
              >
                10 Curriculum Phases
              </h2>
            </div>
            <a
              href="/curriculum"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#CCFF00] hover:underline"
            >
              Explore Full Curriculum ({curriculum.meta.totalEstimatedHours} Hours) <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          {/* Horizontally scrollable phase pills */}
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
            {curriculum.phases.map((phase) => (
              <a
                key={phase.id}
                href="/curriculum"
                className="flex-shrink-0 w-64 bg-white/10 dark:bg-[#0038FF]/[0.02] backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-5 hover:bg-white/20 dark:hover:bg-[#0038FF]/[0.05] hover:border-[#CCFF00]/50 dark:hover:border-[#00D4FF]/40 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#CCFF00] dark:text-[#00D4FF] bg-[#CCFF00]/10 dark:bg-[#00D4FF]/10 px-2.5 py-1 rounded-full border border-[#CCFF00]/30 dark:border-[#00D4FF]/30">
                    Phase 0{phase.order}
                  </span>
                  <span className="text-xs text-white/50">{phase.topics.length} topics</span>
                </div>
                <h3 className="font-bold text-sm text-white mb-2 group-hover:text-[#CCFF00] dark:group-hover:text-[#00D4FF] transition-colors">
                  {phase.title}
                </h3>
                <p className="text-[11px] text-white/60 dark:text-white/70 line-clamp-2 leading-relaxed">
                  {phase.why}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          CLOSING CTA SECTION
          ═══════════════════════════════════ */}
      <section className="relative z-10 border-t border-white/10 dark:border-white/10 bg-[#001A99] dark:bg-[#050714] py-20 px-6 text-center transition-colors">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="w-16 h-16 bg-[#CCFF00] rounded-2xl flex items-center justify-center text-black mb-6 shadow-xl"
          >
            <Sparkles className="h-8 w-8 text-[#0038FF]" />
          </motion.div>

          <h2
            className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white mb-4"
            style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}
          >
            READY TO BREAK FREE FROM GRAVITY?
          </h2>

          <p className="text-sm md:text-base text-white/70 mb-8 max-w-xl">
            Start tracking your Python journey today. Complete topics, maintain streaks, build portfolio projects, and share your milestones.
          </p>

          <a
            href="/dashboard"
            className="inline-flex items-center gap-3 bg-[#CCFF00] text-black font-black uppercase text-sm md:text-base px-8 py-4 rounded-full shadow-2xl hover:scale-105 transition-transform"
          >
            Launch Python Tracker →
          </a>
        </div>
      </section>
    </div>
  );
}
