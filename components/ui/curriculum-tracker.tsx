"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronDown,
  Sparkles,
  BookOpen,
  Code2,
  Braces,
  Database,
  Package,
  Layers,
  Wand2,
  ShieldAlert,
  Zap,
  Globe,
  Trophy,
  Flame,
  Clock,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

/* ═══════════════════════════════════════════════════════════
   DATA — FULL PYTHON CURRICULUM
   ═══════════════════════════════════════════════════════════ */

export interface SubTopic {
  id: string;
  title: string;
  isCompleted?: boolean;
}

export interface Module {
  id: string | number;
  title: string;
  icon: React.ReactNode;
  color: string;
  topics: SubTopic[];
}

const CURRICULUM: Module[] = [
  {
    id: "module-1",
    title: "Module 1: Python Basics",
    icon: <BookOpen className="h-5 w-5" />,
    color: "#4F6EFF",
    topics: [
      { id: "m1-t1", title: "Variables and Naming Conventions" },
      { id: "m1-t2", title: "Primitive Data Types (int, float, str, bool)" },
      { id: "m1-t3", title: "Operators (Arithmetic, Relational, Logical)" },
      { id: "m1-t4", title: "Type Casting and User Input" },
      { id: "m1-t5", title: "String Manipulation & F-Strings" },
    ],
  },
  {
    id: "module-2",
    title: "Module 2: Control Flow",
    icon: <Code2 className="h-5 w-5" />,
    color: "#7B4FFF",
    topics: [
      { id: "m2-t1", title: "If, Elif, and Else Statements" },
      { id: "m2-t2", title: "For Loops and the range() Function" },
      { id: "m2-t3", title: "While Loops" },
      { id: "m2-t4", title: "Break, Continue, and Pass Statements" },
      { id: "m2-t5", title: "Match-Case (Python 3.10+)" },
    ],
  },
  {
    id: "module-3",
    title: "Module 3: Functions",
    icon: <Braces className="h-5 w-5" />,
    color: "#A855F7",
    topics: [
      { id: "m3-t1", title: "Defining and Calling Functions (def)" },
      { id: "m3-t2", title: "Positional and Keyword Arguments" },
      { id: "m3-t3", title: "Default Parameters & Return Values" },
      { id: "m3-t4", title: "Variable-Length Args (*args & **kwargs)" },
      { id: "m3-t5", title: "Lambda Functions & Anonymous Functions" },
      { id: "m3-t6", title: "Variable Scope (Local, Global, Nonlocal)" },
    ],
  },
  {
    id: "module-4",
    title: "Module 4: Data Structures",
    icon: <Database className="h-5 w-5" />,
    color: "#00E5CC",
    topics: [
      { id: "m4-t1", title: "Lists (Indexing, Slicing, Methods)" },
      { id: "m4-t2", title: "Tuples (Immutability & Unpacking)" },
      { id: "m4-t3", title: "Dictionaries (Keys, Values, Methods)" },
      { id: "m4-t4", title: "Sets (Uniqueness & Set Operations)" },
      { id: "m4-t5", title: "List & Dictionary Comprehensions" },
    ],
  },
  {
    id: "module-5",
    title: "Module 5: Modules & Packages",
    icon: <Package className="h-5 w-5" />,
    color: "#F59E0B",
    topics: [
      { id: "m5-t1", title: "Importing Standard Libraries (math, random, os)" },
      { id: "m5-t2", title: "Creating and Importing Custom Modules" },
      { id: "m5-t3", title: "Understanding __name__ == '__main__'" },
      { id: "m5-t4", title: "Package Management (pip)" },
      { id: "m5-t5", title: "Virtual Environments (venv)" },
    ],
  },
  {
    id: "module-6",
    title: "Module 6: Object-Oriented Programming (OOP)",
    icon: <Layers className="h-5 w-5" />,
    color: "#EF4444",
    topics: [
      { id: "m6-t1", title: "Classes and Objects" },
      { id: "m6-t2", title: "The __init__ Method & Self" },
      { id: "m6-t3", title: "Instance vs. Class Attributes" },
      { id: "m6-t4", title: "Inheritance and the super() Function" },
      { id: "m6-t5", title: "Polymorphism & Method Overriding" },
      { id: "m6-t6", title: "Encapsulation (Private & Protected Members)" },
      { id: "m6-t7", title: "Magic / Dunder Methods (__str__, __len__)" },
    ],
  },
  {
    id: "module-7",
    title: "Module 7: Advanced Python Concepts",
    icon: <Wand2 className="h-5 w-5" />,
    color: "#10B981",
    topics: [
      { id: "m7-t1", title: "Decorators and Higher-Order Functions" },
      { id: "m7-t2", title: "Generators & the yield Keyword" },
      { id: "m7-t3", title: "Iterables and Iterators (__iter__, __next__)" },
      { id: "m7-t4", title: "Context Managers & the 'with' Statement" },
      { id: "m7-t5", title: "Type Hinting (typing module)" },
    ],
  },
  {
    id: "module-8",
    title: "Module 8: Error Handling & File I/O",
    icon: <ShieldAlert className="h-5 w-5" />,
    color: "#F97316",
    topics: [
      { id: "m8-t1", title: "Exceptions & Tracebacks" },
      { id: "m8-t2", title: "Try, Except, Else, and Finally blocks" },
      { id: "m8-t3", title: "Raising Custom Exceptions" },
      { id: "m8-t4", title: "Reading and Writing Text Files" },
      { id: "m8-t5", title: "Working with CSV and JSON Data" },
    ],
  },
  {
    id: "module-9",
    title: "Module 9: Async Python & Concurrency",
    icon: <Zap className="h-5 w-5" />,
    color: "#8B5CF6",
    topics: [
      { id: "m9-t1", title: "Understanding Concurrency vs. Parallelism" },
      { id: "m9-t2", title: "Threading basics (threading module)" },
      { id: "m9-t3", title: "Multiprocessing basics" },
      { id: "m9-t4", title: "Asyncio: async and await keywords" },
      { id: "m9-t5", title: "Creating & Gathering Async Tasks" },
    ],
  },
  {
    id: "module-10",
    title: "Module 10: Web & APIs (Ecosystem Setup)",
    icon: <Globe className="h-5 w-5" />,
    color: "#06B6D4",
    topics: [
      { id: "m10-t1", title: "Understanding HTTP (GET, POST, PUT, DELETE)" },
      { id: "m10-t2", title: "Using the 'requests' Library" },
      { id: "m10-t3", title: "Web Scraping with BeautifulSoup" },
      { id: "m10-t4", title: "Building a Basic API with FastAPI" },
      { id: "m10-t5", title: "Connecting to a Database (SQLite / SQLAlchemy)" },
    ],
  },
];

const TOTAL_TOPICS = CURRICULUM.reduce((sum, m) => sum + m.topics.length, 0);

/* ═══════════════════════════════════════════════════════════
   HELPER — PACE CALCULATION
   ═══════════════════════════════════════════════════════════ */

/**
 * Calculates estimated days remaining to complete the curriculum.
 * @param checkedCount - Number of topics already completed
 * @param totalCount - Total topics in the curriculum
 * @param pacePerDay - Assumed topics completed per day (default: 2)
 * @returns Estimated days remaining (0 if all complete)
 */
export function calculateEstimatedDays(
  checkedCount: number,
  totalCount: number = TOTAL_TOPICS,
  pacePerDay: number = 2
): number {
  const remaining = totalCount - checkedCount;
  if (remaining <= 0) return 0;
  return Math.ceil(remaining / pacePerDay);
}

/* ═══════════════════════════════════════════════════════════
   PARTICLE BURST — Gamification Micro-interaction
   ═══════════════════════════════════════════════════════════ */

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
}

let particleIdCounter = 0;

function ParticleBurst({
  particles,
  onComplete,
}: {
  particles: Particle[];
  onComplete: (id: number) => void;
}) {
  return (
    <>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="pointer-events-none fixed z-[9999]"
          style={{ left: p.x, top: p.y }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          onAnimationComplete={() => onComplete(p.id)}
        >
          {[...Array(8)].map((_, i) => {
            const angle = (i / 8) * 360;
            const rad = (angle * Math.PI) / 180;
            const dist = 20 + Math.random() * 25;
            return (
              <motion.div
                key={i}
                className="absolute h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: p.color }}
                initial={{ x: 0, y: 0, scale: 1 }}
                animate={{
                  x: Math.cos(rad) * dist,
                  y: Math.sin(rad) * dist,
                  scale: 0,
                }}
                transition={{
                  duration: 0.5 + Math.random() * 0.3,
                  ease: "easeOut",
                }}
              />
            );
          })}
        </motion.div>
      ))}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT — CURRICULUM TRACKER
   ═══════════════════════════════════════════════════════════ */

export interface CurriculumTrackerProps {
  /** Override the default pace assumption (topics/day) */
  pacePerDay?: number;
  /** Callback when completion data changes */
  onProgressChange?: (checked: string[], total: number) => void;
}

export default function CurriculumTracker({
  pacePerDay = 2,
  onProgressChange,
}: CurriculumTrackerProps) {
  /* ── State: checked topic IDs persisted to localStorage ── */
  const [checked, setChecked] = useState<string[]>([]);
  const [expandedModules, setExpandedModules] = useState<Set<string | number>>(
    new Set()
  );
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  /* Refs for particle positioning */
  const checkboxRefs = useRef<Map<string, HTMLElement>>(new Map());

  /* ── Load from localStorage on mount ── */
  useEffect(() => {
    try {
      const saved = localStorage.getItem("pmt_checked_topics");
      if (saved) {
        setChecked(JSON.parse(saved));
      }
    } catch {
      /* localStorage unavailable — start fresh */
    }
    setIsLoaded(true);
  }, []);

  /* ── Persist to localStorage on change ── */
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("pmt_checked_topics", JSON.stringify(checked));
    } catch {
      /* localStorage full or unavailable */
    }
    onProgressChange?.(checked, TOTAL_TOPICS);
  }, [checked, isLoaded, onProgressChange]);

  /* ── Toggle a topic ── */
  const toggleTopic = useCallback(
    (topicId: string, event?: React.MouseEvent) => {
      setChecked((prev) => {
        const isChecking = !prev.includes(topicId);
        const next = isChecking
          ? [...prev, topicId]
          : prev.filter((id) => id !== topicId);

        /* Spawn particle burst on check (not uncheck) */
        if (isChecking) {
          const targetEl =
            (event?.currentTarget as HTMLElement | null) ||
            checkboxRefs.current.get(topicId);
          if (targetEl && typeof targetEl.getBoundingClientRect === "function") {
            const rect = targetEl.getBoundingClientRect();
            const newParticle: Particle = {
              id: ++particleIdCounter,
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2,
              color: "#CCFF00",
            };
            setParticles((prev) => [...prev, newParticle]);
          }
        }

        return next;
      });
    },
    []
  );

  const removeParticle = useCallback((id: number) => {
    setParticles((prev) => prev.filter((p) => p.id !== id));
  }, []);

  /* ── Toggle module accordion ── */
  const toggleModule = useCallback((moduleId: string | number) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  }, []);

  /* ── Derived data ── */
  const checkedCount = checked.length;
  const percentage = Math.round((checkedCount / TOTAL_TOPICS) * 100);
  const estDays = calculateEstimatedDays(checkedCount, TOTAL_TOPICS, pacePerDay);
  const isComplete = checkedCount === TOTAL_TOPICS;

  const getModuleProgress = (mod: Module) => {
    const done = mod.topics.filter((t) => checked.includes(t.id)).length;
    return { done, total: mod.topics.length, pct: Math.round((done / mod.topics.length) * 100) };
  };

  /* ── Prevent hydration mismatch ── */
  if (!isLoaded) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neon border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      {/* Particle burst layer */}
      <ParticleBurst particles={particles} onComplete={removeParticle} />

      <section className="w-full">
        {/* ═══════════════════════════════════
            HEADER — Stats Strip
            ═══════════════════════════════════ */}
        <motion.div
          className="mb-8 flex flex-wrap items-center justify-between gap-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Title */}
          <div>
            <h2
              className="text-shadow-brutal-sm text-3xl font-bold uppercase tracking-tight text-white md:text-4xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Curriculum
            </h2>
            <p className="mt-1 text-sm text-white/60 dark:text-white/50">
              {TOTAL_TOPICS} topics across {CURRICULUM.length} modules
            </p>
          </div>

          {/* Stats pills */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Completion */}
            <div className="glass-card flex items-center gap-2 rounded-full px-4 py-2">
              <Trophy className="h-4 w-4 text-[#CCFF00] dark:text-neon" />
              <span className="text-sm font-semibold text-white">
                {checkedCount}
                <span className="text-white/40">/{TOTAL_TOPICS}</span>
              </span>
              <span className="text-xs text-white/50 dark:text-white/40">done</span>
            </div>

            {/* Streak / Pace */}
            <div className="glass-card flex items-center gap-2 rounded-full px-4 py-2">
              <Clock className="h-4 w-4 text-[#CCFF00] dark:text-neon" />
              <span className="text-sm font-semibold text-white">
                {isComplete ? (
                  <span className="text-[#CCFF00] dark:text-neon">Complete! 🎉</span>
                ) : (
                  <>
                    ~{estDays} days
                    <span className="ml-1 text-xs text-white/50 dark:text-white/40">left</span>
                  </>
                )}
              </span>
            </div>

            {/* Progress percentage */}
            <div className="glass-card flex items-center gap-2 rounded-full px-4 py-2">
              <Flame className="h-4 w-4 text-[#CCFF00] dark:text-neon" />
              <span
                className="text-sm font-bold text-[#CCFF00]"
              >
                {percentage}%
              </span>
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════
            OVERALL PROGRESS BAR
            ═══════════════════════════════════ */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, scaleX: 0.8 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ transformOrigin: "left" }}
        >
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#0C101D] dark:bg-white/10 border border-white/15">
            <motion.div
              className="h-full rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, #4F6EFF 0%, #CCFF00 100%)",
              }}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{
                duration: 0.8,
                delay: 0.2,
                ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
              }}
            />
          </div>
        </motion.div>

        {/* ═══════════════════════════════════
            MODULE CARDS — Accordion Grid
            ═══════════════════════════════════ */}
        <div className="grid gap-4 md:grid-cols-2">
          {CURRICULUM.map((mod, idx) => {
            const progress = getModuleProgress(mod);
            const isExpanded = expandedModules.has(mod.id);
            const isModuleComplete = progress.done === progress.total;

            return (
              <motion.div
                key={mod.id}
                className={`glass-card overflow-hidden rounded-xl transition-all duration-300 ${
                  isModuleComplete
                    ? "border-[#CCFF00]/40 dark:border-neon/30 shadow-[0_0_24px_rgba(204,255,0,0.15)]"
                    : ""
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: 0.05 * idx,
                  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
                }}
              >
                {/* ── Module Header (Click to expand) ── */}
                <button
                  className="flex w-full items-center gap-3 p-5 text-left transition-colors duration-150 hover:bg-white/10 dark:hover:bg-white/5"
                  onClick={() => toggleModule(mod.id)}
                  aria-expanded={isExpanded}
                  aria-controls={`module-${mod.id}-body`}
                >
                  {/* Icon */}
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${mod.color}25`, color: mod.color }}
                  >
                    {mod.icon}
                  </div>

                  {/* Title + progress */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">
                        {mod.title}
                      </span>
                      {isModuleComplete && (
                        <motion.span
                          className="rounded-full bg-[#CCFF00]/20 text-[#CCFF00] dark:bg-neon/20 dark:text-neon px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 15,
                          }}
                        >
                          ✓ Done
                        </motion.span>
                      )}
                    </div>

                    {/* Mini progress bar */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/15 dark:bg-white/10">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: mod.color }}
                          initial={false}
                          animate={{ width: `${progress.pct}%` }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                        />
                      </div>
                      <span
                        className="text-[0.65rem] font-medium tabular-nums text-white/60 dark:text-white/40"
                        style={{
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {progress.done}/{progress.total}
                      </span>
                    </div>
                  </div>

                  {/* Chevron */}
                  <motion.div
                    className="shrink-0 text-white/50 dark:text-white/30"
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.div>
                </button>

                {/* ── Module Body (Topics list) ── */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      id={`module-${mod.id}-body`}
                      role="region"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-white/15 dark:border-white/5 px-5 py-3">
                        {mod.topics.map((topic, tIdx) => {
                          const isDone = checked.includes(topic.id);

                          return (
                            <motion.div
                              key={topic.id}
                              className={`group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-colors duration-150 ${
                                isDone
                                  ? "bg-[#CCFF00]/10 border border-[#CCFF00]/30"
                                  : "hover:bg-white/10 dark:hover:bg-white/5"
                              }`}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                duration: 0.2,
                                delay: tIdx * 0.03,
                              }}
                              onClick={(e) => toggleTopic(topic.id, e)}
                            >
                              {/* Custom-styled Checkbox */}
                              <div
                                ref={(el) => {
                                  if (el) checkboxRefs.current.set(topic.id, el);
                                }}
                              >
                                <Checkbox
                                  checked={isDone}
                                  onCheckedChange={() => {}}
                                  className={`h-5 w-5 rounded border-2 transition-all duration-200 ${
                                    isDone
                                      ? "border-[#CCFF00] bg-[#CCFF00] text-[#001A99] data-[state=checked]:border-[#CCFF00] data-[state=checked]:bg-[#CCFF00] dark:border-neon dark:bg-neon dark:text-deep-blue-dark"
                                      : "border-white/30 bg-transparent hover:border-white/60"
                                  }`}
                                  aria-label={`Mark "${topic.title}" as ${isDone ? "incomplete" : "complete"}`}
                                />
                              </div>

                              {/* Topic ID badge */}
                              <span
                                className={`text-[0.65rem] font-medium tabular-nums transition-colors duration-200 ${
                                  isDone
                                    ? "text-[#CCFF00]"
                                    : "text-white/40 group-hover:text-white/70"
                                }`}
                                style={{ fontFamily: "var(--font-mono)" }}
                              >
                                {topic.id}
                              </span>

                              {/* Topic title */}
                              <span
                                className={`flex-1 text-sm transition-all duration-200 ${
                                  isDone
                                    ? "text-[#CCFF00] line-through decoration-[#CCFF00]/40"
                                    : "text-white/85 group-hover:text-white"
                                }`}
                              >
                                {topic.title}
                              </span>

                              {/* Sparkle icon on completion */}
                              <AnimatePresence>
                                {isDone && (
                                  <motion.div
                                    initial={{ scale: 0, rotate: -30 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    exit={{ scale: 0 }}
                                    transition={{
                                      type: "spring",
                                      stiffness: 500,
                                      damping: 20,
                                    }}
                                  >
                                    <Sparkles className="h-3.5 w-3.5 text-[#CCFF00]" />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* ═══════════════════════════════════
            COMPLETION BANNER
            ═══════════════════════════════════ */}
        <AnimatePresence>
          {isComplete && (
            <motion.div
              className="mt-8 overflow-hidden rounded-2xl border border-[#CCFF00]/40 bg-[#CCFF00]/10 p-8 text-center"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
              }}
            >
              <motion.div
                className="mb-3 text-5xl"
                animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                🚀
              </motion.div>
              <h3
                className="text-shadow-brutal-neon mb-2 text-2xl font-bold uppercase text-[#CCFF00]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Mission Complete
              </h3>
              <p className="text-sm text-white/80">
                You&apos;ve conquered all {TOTAL_TOPICS} topics. You are now
                officially in orbit.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </>
  );
}
