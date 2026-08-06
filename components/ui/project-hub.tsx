"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Trophy,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  Terminal,
  CloudSun,
  Globe,
  Server,
  Layers,
  Sparkles,
  Award,
  Zap,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

/* ═══════════════════════════════════════════════════════════
   TYPES & DATA
   ═══════════════════════════════════════════════════════════ */

export type DifficultyLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "MASTER";

export interface Project {
  id: string;
  questNumber: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  xp: number;
  icon: React.ReactNode;
  tags: string[];
  concepts: string[];
  templatePost: string;
}

export const PROJECTS: Project[] = [
  {
    id: "cli-todo",
    questNumber: "QUEST #01",
    title: "CLI To-Do App",
    description:
      "Build a feature-packed command-line task manager with input validation, local JSON storage, and priority tags.",
    difficulty: "BEGINNER",
    xp: 150,
    icon: <Terminal className="h-6 w-6" />,
    tags: ["Python", "CLI", "JSON", "File I/O"],
    concepts: [
      "File persistence with json module",
      "Robust user input validation & exception handling",
      "Functions and clean dictionary data structures",
    ],
    templatePost: `🚀 MILESTONE UNLOCKED: Built a CLI To-Do App in Python!

Just completed my first major hands-on project in my Python Mastery Journey. I built a command-line task manager that persists data to JSON files.

💡 Key Concepts Mastered:
• Data persistence with JSON file handling
• Exception handling & input validation
• Modular function design & data structures

Every line of code brings me one step closer to Python mastery. On to the next quest!

#Python #BuildInPublic #100DaysOfCode #SoftwareEngineering #PythonDeveloper`,
  },
  {
    id: "weather-api",
    questNumber: "QUEST #02",
    title: "Weather API Dashboard",
    description:
      "Fetch real-time weather metrics using OpenWeatherMap API with async requests and format output into a slick terminal readout.",
    difficulty: "INTERMEDIATE",
    xp: 300,
    icon: <CloudSun className="h-6 w-6" />,
    tags: ["Requests", "REST API", "JSON Parsing"],
    concepts: [
      "Consuming external RESTful HTTP APIs with requests",
      "Parsing nested JSON responses",
      "Handling API rate limits and HTTP status codes",
    ],
    templatePost: `🌍 MILESTONE UNLOCKED: Weather API Dashboard!

Just finished building a real-time Weather API Dashboard in Python! The tool fetches live meteorological data from RESTful APIs and outputs formatted metrics.

💡 Key Concepts Mastered:
• HTTP requests & REST API integration
• Handling nested JSON payloads
• HTTP status code validation & error handling

Building real-world projects is where theory turns into actual engineering skills.

#Python #APIs #RESTful #100DaysOfCode #BuildInPublic #SoftwareDeveloper`,
  },
  {
    id: "web-scraper",
    questNumber: "QUEST #03",
    title: "Web Scraper (BeautifulSoup)",
    description:
      "Automate data extraction from web pages, parse HTML document trees, and export structured datasets into CSV/JSON files.",
    difficulty: "INTERMEDIATE",
    xp: 450,
    icon: <Globe className="h-6 w-6" />,
    tags: ["BeautifulSoup", "HTML Parsing", "CSV Export"],
    concepts: [
      "Parsing HTML DOM trees using BeautifulSoup4",
      "Handling pagination and dynamic web structures",
      "Exporting clean datasets into CSV & JSON formats",
    ],
    templatePost: `🕷️ MILESTONE UNLOCKED: Automated Web Scraper!

Just completed my Web Scraper project built with Python & BeautifulSoup. I automated data extraction across multi-page sites and formatted data into structured CSV files.

💡 Key Concepts Mastered:
• DOM parsing & element selector strategies
• Handling pagination & rate limiting
• Data cleaning and CSV/JSON export workflows

Python automation feels like a superpower.

#Python #WebScraping #DataEngineering #Automation #BuildInPublic #100DaysOfCode`,
  },
  {
    id: "rest-api-fastapi",
    questNumber: "QUEST #04",
    title: "REST API (FastAPI)",
    description:
      "Design and deploy a high-performance backend API with automatic Swagger docs, Pydantic data validation, and CRUD operations.",
    difficulty: "ADVANCED",
    xp: 750,
    icon: <Server className="h-6 w-6" />,
    tags: ["FastAPI", "Pydantic", "Async", "REST CRUD"],
    concepts: [
      "Building async RESTful endpoints with FastAPI",
      "Strict request/response validation using Pydantic",
      "CRUD database operations and OpenAPI Swagger generation",
    ],
    templatePost: `⚡ MILESTONE UNLOCKED: Production-Ready REST API with FastAPI!

Shipped my REST API backend project built with Python and FastAPI! Featuring full CRUD functionality, Pydantic type safety, and automatic OpenAPI documentation.

💡 Key Concepts Mastered:
• Asynchronous request handlers in FastAPI
• Type validation & schemas via Pydantic
• Designing scalable RESTful architecture

FastAPI's speed and developer experience are unreal. Ready for full-stack integration!

#FastAPI #Python #BackendDev #API #BuildInPublic #SoftwareEngineering`,
  },
  {
    id: "fullstack-app",
    questNumber: "QUEST #05",
    title: "Full-Stack App (Python + React)",
    description:
      "Connect a Python FastAPI backend with a React & Tailwind frontend via CORS, implementing JWT auth and real-time state sync.",
    difficulty: "MASTER",
    xp: 1200,
    icon: <Layers className="h-6 w-6" />,
    tags: ["FastAPI", "React", "JWT Auth", "Tailwind"],
    concepts: [
      "Decoupled Full-Stack Architecture (Python API + React UI)",
      "Authentication using JWT Tokens & Passlib hashing",
      "CORS configuration, state management, and deployment",
    ],
    templatePost: `🏆 ULTIMATE MILESTONE UNLOCKED: Full-Stack App (Python + React)!

I just shipped my Full-Stack Web Application! Powered by a Python FastAPI backend, JWT authentication, and a sleek React + Tailwind CSS user interface.

💡 Key Concepts Mastered:
• Full-stack integration with CORS & JWT Auth
• React frontend state management with Python API endpoints
• End-to-end architecture from data persistence to UI rendering

From zero to full-stack Python engineer. This is just the beginning!

#FullStack #Python #ReactJS #FastAPI #WebDevelopment #BuildInPublic #SoftwareEngineer`,
  },
];

/* Difficulty Badge Styling helper */
const DIFFICULTY_STYLES: Record<
  DifficultyLevel,
  { bg: string; border: string; text: string }
> = {
  BEGINNER: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    text: "text-blue-400",
  },
  INTERMEDIATE: {
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    text: "text-purple-400",
  },
  ADVANCED: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-400",
  },
  MASTER: {
    bg: "bg-neon/10",
    border: "border-neon/40",
    text: "text-neon",
  },
};

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT — PROJECT HUB
   ═══════════════════════════════════════════════════════════ */

export interface ProjectHubProps {
  onProjectsChange?: (completedIds: string[]) => void;
}

export default function ProjectHub({ onProjectsChange }: ProjectHubProps) {
  const [completed, setCompleted] = useState<string[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [postText, setPostText] = useState("");
  const [copied, setCopied] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  /* Load completed projects from localStorage */
  useEffect(() => {
    try {
      const saved = localStorage.getItem("pmt_completed_projects");
      if (saved) {
        setCompleted(JSON.parse(saved));
      }
    } catch {
      /* start fresh */
    }
    setIsLoaded(true);
  }, []);

  /* Save to localStorage on change */
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("pmt_completed_projects", JSON.stringify(completed));
    } catch {
      /* fail silent */
    }
    onProjectsChange?.(completed);
  }, [completed, isLoaded, onProjectsChange]);

  /* Handle toggling project completion & opening LinkedIn modal */
  const handleMarkComplete = useCallback((project: Project) => {
    setCompleted((prev) => {
      if (!prev.includes(project.id)) {
        return [...prev, project.id];
      }
      return prev;
    });

    /* Prepare and open LinkedIn modal */
    setActiveProject(project);
    setPostText(project.templatePost);
    setCopied(false);
    setDialogOpen(true);
  }, []);

  const handleOpenModal = useCallback((project: Project) => {
    setActiveProject(project);
    setPostText(project.templatePost);
    setCopied(false);
    setDialogOpen(true);
  }, []);

  /* Handle Clipboard Copy */
  const handleCopyPost = useCallback(() => {
    if (!postText) return;
    navigator.clipboard.writeText(postText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }, [postText]);

  /* Calculate Stats */
  const completedCount = completed.length;
  const totalXP = PROJECTS.reduce(
    (sum, p) => (completed.includes(p.id) ? sum + p.xp : sum),
    0
  );
  const maxXP = PROJECTS.reduce((sum, p) => sum + p.xp, 0);

  if (!isLoaded) {
    return null;
  }

  return (
    <section className="w-full py-8">
      {/* ═══════════════════════════════════
          SECTION HEADER — BOUNTY BOARD STATS
          ═══════════════════════════════════ */}
      <motion.div
        className="mb-8 flex flex-wrap items-center justify-between gap-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-neon animate-ping" />
            <span
              className="text-xs font-bold uppercase tracking-widest text-neon"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Quest Log & Bounties
            </span>
          </div>
          <h2
            className="text-shadow-brutal-sm text-3xl font-bold uppercase tracking-tight text-white md:text-4xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Milestone Projects
          </h2>
        </div>

        {/* Stats Pills */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="glass-card flex items-center gap-2 rounded-full px-4 py-2">
            <Award className="h-4 w-4 text-neon" />
            <span className="text-sm font-semibold text-white">
              {completedCount}
              <span className="text-white/40">/{PROJECTS.length}</span>
            </span>
            <span className="text-xs text-white/40">Completed</span>
          </div>

          <div className="glass-card flex items-center gap-2 rounded-full px-4 py-2">
            <Zap className="h-4 w-4 text-neon" />
            <span className="text-sm font-bold text-neon">{totalXP}</span>
            <span className="text-xs text-white/40">/ {maxXP} XP</span>
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════
          PROJECT CARDS — GRID
          ═══════════════════════════════════ */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {PROJECTS.map((project, idx) => {
          const isDone = completed.includes(project.id);
          const diffStyle = DIFFICULTY_STYLES[project.difficulty];

          return (
            <motion.div
              key={project.id}
              className={`glass-card relative flex flex-col justify-between overflow-hidden rounded-2xl p-6 transition-all duration-300 ${
                isDone
                  ? "border-neon/40 shadow-[0_0_30px_rgba(204,255,0,0.15)]"
                  : "hover:border-white/40 hover:bg-white/15"
              }`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: idx * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {/* Completed Watermark Badge */}
              {isDone && (
                <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-neon/10 blur-xl" />
              )}

              <div>
                {/* Header Row: Quest # & Difficulty */}
                <div className="mb-4 flex items-center justify-between">
                  <span
                    className="text-xs font-bold uppercase tracking-wider text-white/40"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {project.questNumber}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[0.65rem] font-bold tracking-wider ${diffStyle.bg} ${diffStyle.border} ${diffStyle.text}`}
                    >
                      {project.difficulty}
                    </span>
                    <span className="rounded-full bg-neon/10 px-2 py-0.5 text-[0.65rem] font-bold text-neon">
                      +{project.xp} XP
                    </span>
                  </div>
                </div>

                {/* Icon & Title */}
                <div className="mb-3 flex items-start gap-3">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
                      isDone
                        ? "bg-neon text-deep-blue-dark"
                        : "bg-white/10 text-white"
                    }`}
                  >
                    {project.icon}
                  </div>
                  <div>
                    <h3
                      className="text-xl font-bold uppercase tracking-tight text-white"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {project.title}
                    </h3>
                  </div>
                </div>

                {/* Description */}
                <p className="mb-5 text-xs leading-relaxed text-white/60">
                  {project.description}
                </p>

                {/* Tech Tags */}
                <div className="mb-6 flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-white/5 px-2 py-1 text-[0.65rem] font-medium text-white/50"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                {isDone ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(project)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-neon/15 border border-neon/30 px-4 py-2.5 text-xs font-bold uppercase text-neon transition-all duration-200 hover:bg-neon/25"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      Share Post
                    </button>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neon text-deep-blue-dark">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  </div>
                ) : (
                  <motion.button
                    onClick={() => handleMarkComplete(project)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-neon px-4 py-3 text-xs font-bold uppercase tracking-wider text-deep-blue-dark transition-all duration-200 hover:brightness-110"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Trophy className="h-4 w-4" />
                    Mark as Complete
                  </motion.button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ═══════════════════════════════════
          LINKEDIN POST GENERATOR MODAL
          ═══════════════════════════════════ */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border border-white/20 bg-deep-blue/95 p-6 backdrop-blur-2xl sm:max-w-xl">
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-neon/20">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 15,
                }}
              >
                <Trophy className="h-8 w-8 text-neon" />
              </motion.div>
            </div>

            <DialogTitle
              className="text-center text-2xl font-bold uppercase tracking-tight text-white"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              🎉 BOUNTY CLAIMED!
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-white/60">
              You&apos;ve completed{" "}
              <span className="font-bold text-neon">
                {activeProject?.title}
              </span>{" "}
              (+{activeProject?.xp} XP). Share your achievement on LinkedIn to celebrate in public!
            </DialogDescription>
          </DialogHeader>

          {/* Post Editor Textarea */}
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/70">
                <Sparkles className="h-3.5 w-3.5 text-neon" />
                Auto-Generated LinkedIn Post
              </label>
              <span
                className="text-[0.7rem] text-white/40"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {postText.length} chars
              </span>
            </div>

            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              rows={8}
              className="w-full resize-none rounded-xl border border-white/20 bg-white/5 p-4 text-xs leading-relaxed text-white/90 outline-none transition-colors duration-200 focus:border-neon focus:ring-1 focus:ring-neon"
              style={{ fontFamily: "var(--font-mono)" }}
            />
          </div>

          {/* Modal Actions */}
          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              onClick={() => setDialogOpen(false)}
              className="rounded-xl border border-white/20 px-4 py-2.5 text-xs font-semibold text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              Close
            </button>

            <motion.button
              onClick={handleCopyPost}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                copied
                  ? "bg-emerald-500 text-white"
                  : "bg-neon text-deep-blue-dark hover:brightness-110"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied to Clipboard!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Post to Clipboard
                </>
              )}
            </motion.button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

