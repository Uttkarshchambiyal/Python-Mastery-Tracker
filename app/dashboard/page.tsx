"use client";

import React, { useState, useEffect } from "react";
import { AppHeader } from "@/components/ui/app-header";
import { StudyTimer } from "@/components/ui/study-timer";
import { JournalModal } from "@/components/ui/journal-modal";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { motion, AnimatePresence } from "motion/react";
import {
  Flame,
  Trophy,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  Snowflake,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Plus,
  RotateCcw,
  Maximize2,
  Minimize2,
  Award,
  Zap,
  Moon,
} from "lucide-react";
import curriculumData from "@/data/curriculum.json";
import { CurriculumData, Topic } from "@/lib/types";
import {
  fetchData,
  toggleTopicCompleted,
  setTopicNotesAndSRS,
  DailyActivityRecord,
  TopicDetailState,
  UserSettings,
} from "@/lib/storage";
import {
  getCurrentStreak,
  getCompletionStats,
  getProjectedPace,
  getWeeklyRecap,
} from "@/lib/pace";
import { BADGE_DEFINITIONS, checkAndUnlockBadges } from "@/lib/badges";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const curriculum = curriculumData as CurriculumData;

export default function DashboardPage() {
  const [completedTopics, setCompletedTopics] = useState<Record<string, string>>({});
  const [studyLog, setStudyLog] = useState<string[]>([]);
  const [dailyActivity, setDailyActivity] = useState<Record<string, DailyActivityRecord>>({});
  const [topicDetailStates, setTopicDetailStates] = useState<Record<string, TopicDetailState>>({});
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [newlyUnlockedToast, setNewlyUnlockedToast] = useState<string | null>(null);
  const [settings, setSettings] = useState<UserSettings>({
    dailyGoalHours: 1,
    startDate: new Date().toISOString().slice(0, 10),
    theme: "dark",
    reminderTime: "19:00",
    notificationsEnabled: false,
  });
  const [weekOffset, setWeekOffset] = useState(0);

  // Modals & Zen mode state
  const [zenModeActive, setZenModeActive] = useState(false);
  const [journalModalOpen, setJournalModalOpen] = useState(false);
  const [journalDate, setJournalDate] = useState<string | undefined>(undefined);
  const [selectedHeatmapDay, setSelectedHeatmapDay] = useState<{
    date: string;
    record?: DailyActivityRecord;
  } | null>(null);
  const [showFreezeToast, setShowFreezeToast] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const loadAllState = async () => {
    const data = await fetchData();
    setCompletedTopics(data.completedTopics || {});
    setStudyLog(data.studyLog || []);
    setDailyActivity(data.dailyActivity || {});
    setTopicDetailStates(data.topicState || {});
    setSettings(data.settings);
    setUnlockedBadges((data.badges || []).map((b) => b.badgeId));
    setIsLoading(false);
  };

  useEffect(() => {
    loadAllState();
  }, []);

  // Esc key listener for Zen Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && zenModeActive) {
        setZenModeActive(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [zenModeActive]);

  const streak = getCurrentStreak(studyLog);
  const stats = getCompletionStats(curriculum, completedTopics);
  const pace = getProjectedPace(studyLog, stats, settings);
  const weeklyRecap = getWeeklyRecap(dailyActivity, weekOffset, studyLog);

  useEffect(() => {
    if (streak.freezeConsumedToday) {
      setShowFreezeToast(true);
    }
  }, [streak.freezeConsumedToday]);

  // Topic map helper
  const topicMap: Record<string, Topic> = {};
  curriculum.phases.forEach((p) => {
    p.topics.forEach((t) => {
      topicMap[t.id] = t;
    });
  });

  // Collect topics needing SRS review today
  const todayStr = new Date().toISOString().slice(0, 10);
  const needsReviewTopics = Object.entries(topicDetailStates)
    .filter(([_, state]) => state.nextReviewDate && todayStr >= state.nextReviewDate)
    .map(([id]) => topicMap[id])
    .filter(Boolean);

  // Find next incomplete topic
  let nextTopic: { topic: Topic; phaseTitle: string } | null = null;
  for (const phase of curriculum.phases) {
    for (const t of phase.topics) {
      if (!completedTopics[t.id]) {
        nextTopic = { topic: t, phaseTitle: phase.title };
        break;
      }
    }
    if (nextTopic) break;
  }

  const handleToggleNextTopic = async (topicId: string) => {
    await toggleTopicCompleted(topicId);
    triggerBadgeCheck();
    await loadAllState();
  };

  const handleClearReviewTopic = async (topicId: string) => {
    await setTopicNotesAndSRS(topicId, { nextReviewDate: null });
    await loadAllState();
  };

  const triggerBadgeCheck = async (sessionMins?: number) => {
    const newBadges = await checkAndUnlockBadges(sessionMins);
    if (newBadges.length > 0) {
      setNewlyUnlockedToast(newBadges[0]);
      setTimeout(() => setNewlyUnlockedToast(null), 4000);
    }
  };

  const handleTimerComplete = async (minutes: number) => {
    await triggerBadgeCheck(minutes);
    await loadAllState();
    setJournalDate(new Date().toISOString().slice(0, 10));
    setJournalModalOpen(true);
  };

  // Generate 26-week heatmap data
  const heatmapDays = Array.from({ length: 182 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (181 - i));
    const iso = d.toISOString().slice(0, 10);
    const record = dailyActivity[iso];
    const isActive =
      record &&
      (record.minutesStudied > 0 ||
        record.topicsCompletedToday?.length > 0 ||
        (record.note && record.note.trim().length > 0));
    return { date: iso, active: isActive, record };
  });

  if (isLoading) {
    return <LoadingScreen message="Loading Learner Dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-[#0038FF] dark:bg-transparent text-white font-sans transition-colors duration-300">
      {/* App Header (Hidden during Zen Mode) */}
      {!zenModeActive && <AppHeader streak={streak.current} />}

      {/* Badge Unlock Toast */}
      <AnimatePresence>
        {newlyUnlockedToast && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-[#CCFF00] dark:bg-indigo-500 text-black px-6 py-4 rounded-full font-black shadow-[0_0_40px_rgba(129,140,248,0.6)] flex items-center gap-3 border-2 border-black"
          >
            <Trophy className="h-6 w-6 text-[#001A99] dark:text-black" />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-black/60 font-bold">Achievement Unlocked!</div>
              <div className="text-sm uppercase font-black">
                {BADGE_DEFINITIONS.find((b) => b.id === newlyUnlockedToast)?.title || "New Badge!"}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Freeze Toast */}
      <AnimatePresence>
        {showFreezeToast && !zenModeActive && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-[#001A99] dark:bg-[#111a2e] border-2 border-[#CCFF00] dark:border-indigo-500 text-[#CCFF00] dark:text-indigo-400 px-6 py-3 rounded-full text-xs font-bold shadow-2xl flex items-center justify-between max-w-xl mx-auto mt-4"
          >
            <span className="flex items-center gap-2">
              <Snowflake className="h-4 w-4" />
              Your streak was protected by a freeze ❄️ ({streak.freezesAvailable} left)
            </span>
            <button onClick={() => setShowFreezeToast(false)} className="text-white/60 hover:text-white">
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════
          ZEN MODE OVERLAY
          ═══════════════════════════════════ */}
      {zenModeActive ? (
        <div className="fixed inset-0 z-50 bg-[#0038FF] grid-overlay p-8 flex flex-col justify-between items-center text-white">
          <div className="w-full max-w-4xl flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-[#CCFF00] dark:text-indigo-400 flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> ZEN FOCUS MODE
            </span>
            <button
              onClick={() => setZenModeActive(false)}
              className="flex items-center gap-2 bg-[#001A99]/80 border border-white/25 px-4 py-2 rounded-full text-xs font-semibold hover:bg-white/20 text-white"
            >
              <Minimize2 className="h-4 w-4 text-[#CCFF00] dark:text-indigo-400" /> Exit Zen Mode (Esc)
            </button>
          </div>

          <div className="w-full max-w-2xl text-center space-y-8 my-auto">
            {nextTopic && (
              <div>
                <span className="text-xs uppercase tracking-wider text-white/50">{nextTopic.phaseTitle}</span>
                <h2 className="text-3xl font-black text-[#CCFF00] dark:text-indigo-400 uppercase mt-1" style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}>
                  {nextTopic.topic.title}
                </h2>
                <p className="text-xs text-white/70 mt-2 max-w-xl mx-auto">{nextTopic.topic.description}</p>
              </div>
            )}

            <div className="w-full max-w-md mx-auto">
              <StudyTimer onSessionComplete={handleTimerComplete} />
            </div>
          </div>

          <div className="text-[11px] text-white/40">Press Esc or click top right to exit Focus Mode</div>
        </div>
      ) : (
        <main className="max-w-6xl mx-auto px-6 py-8 md:py-12 space-y-8">
          {/* Dashboard Title & Zen Mode Trigger */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#CCFF00] dark:text-indigo-400">
                MISSION CONTROL
              </span>
              <h1
                className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white mt-1 dark:[text-shadow:0_2px_10px_rgba(0,56,255,0.4)]"
                style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}
              >
                LEARNER DASHBOARD
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setZenModeActive(true)}
                className="flex items-center gap-2 bg-[#0C101D] dark:bg-[#121829] border border-white/20 dark:border-[#6A5AE0]/35 text-xs font-semibold text-white px-4 py-2.5 rounded-full hover:bg-white/20 dark:hover:bg-[#0C101D] transition-all"
              >
                <Maximize2 className="h-4 w-4 text-[#CCFF00] dark:text-indigo-400" />
                Zen Mode
              </button>

              <button
                onClick={() => {
                  setJournalDate(new Date().toISOString().slice(0, 10));
                  setJournalModalOpen(true);
                }}
                className="flex items-center gap-2 bg-[#CCFF00] dark:bg-indigo-500 text-black font-bold text-xs px-5 py-2.5 rounded-full hover:scale-105 transition-transform shadow-lg"
              >
                <Plus className="h-4 w-4" />
                + Add Today&apos;s Note
              </button>
            </div>
          </div>

          {/* Study Timer Component */}
          <StudyTimer onSessionComplete={handleTimerComplete} />

          {/* Pace Banner */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl p-6 border  flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${pace.status === "ahead"
                ? "bg-[#CCFF00]/15 dark:bg-indigo-500/15 border-[#CCFF00]/40 dark:border-indigo-500/40 text-[#CCFF00] dark:text-indigo-400"
                : pace.status === "behind"
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                  : "bg-white/15 backdrop-blur-xl border-white/30 dark:bg-[#0C101D] dark:border-[#6A5AE0]/35 text-white"
              }`}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-[#0C101D] shrink-0">
                <TrendingUp className="h-6 w-6 text-[#CCFF00] dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm md:text-base">
                  {stats.remainingHours === 0 ? (
                    "🎉 Curriculum Completed! You are fully job-ready!"
                  ) : (
                    <>
                      At your pace of ~{pace.averageHoursPerDay} hrs/day, you&apos;ll finish in{" "}
                      <span className="font-black underline">{pace.projectedDaysRemaining} days</span> ({pace.projectedCompletionDate}).
                    </>
                  )}
                </h3>
                <p className="text-xs text-white/70 dark:text-white/70 mt-1">
                  {stats.completedTopicsCount} of {stats.totalTopicsCount} topics done ({stats.percentComplete}% total curriculum)
                </p>
              </div>
            </div>

            <a
              href="/curriculum"
              className="shrink-0 bg-[#CCFF00] dark:bg-indigo-500 text-black text-xs font-bold px-5 py-2.5 rounded-full hover:scale-105 transition-transform"
            >
              Continue Learning →
            </a>
          </motion.div>

          {/* 4 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white/15 backdrop-blur-xl border border-white/30 dark:bg-[#0C101D] dark:border-[#6A5AE0]/35 rounded-[2rem] p-6 flex flex-col justify-between relative overflow-hidden shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-white/80 dark:text-slate-400">Current Streak</span>
                <div className="p-2.5 rounded-xl bg-orange-500/20 text-orange-400">
                  <Flame className="h-5 w-5" />
                </div>
              </div>
              <div>
                <span className="text-4xl font-black text-white" style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}>
                  {streak.current}
                </span>
                <span className="text-sm font-semibold text-white/70 dark:text-slate-400 ml-2">Days</span>
              </div>
              <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/20 dark:border-[#6A5AE0]/25 text-[11px]">
                <span className="text-[#CCFF00] dark:text-[#F3C4FB] font-semibold">Keep the flame alive!</span>
                <span className="flex items-center gap-1 bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/40 font-bold">
                  <Snowflake className="h-3 w-3" /> {streak.freezesAvailable} Freeze{streak.freezesAvailable !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            <div className="bg-white/15 backdrop-blur-xl border border-white/30 dark:bg-[#0C101D] dark:border-[#6A5AE0]/35 rounded-[2rem] p-6 flex flex-col justify-between shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-white/80 dark:text-slate-400">Longest Streak</span>
                <div className="p-2.5 rounded-xl bg-[#CCFF00]/20 dark:bg-[#6A5AE0]/20 text-[#CCFF00] dark:text-[#F3C4FB]">
                  <Trophy className="h-5 w-5" />
                </div>
              </div>
              <div>
                <span className="text-4xl font-black text-[#CCFF00] dark:text-[#F3C4FB]" style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}>
                  {streak.longest}
                </span>
                <span className="text-sm font-semibold text-white/70 dark:text-slate-400 ml-2">Days</span>
              </div>
              <p className="text-[11px] text-white/70 dark:text-slate-400 mt-3">Personal All-Time Record</p>
            </div>

            <div className="bg-white/15 backdrop-blur-xl border border-white/30 dark:bg-[#0C101D] dark:border-[#6A5AE0]/35 rounded-[2rem] p-6 flex flex-col justify-between shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-white/80 dark:text-slate-400">% Complete</span>
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>
              <div>
                <span className="text-4xl font-black text-white" style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}>
                  {stats.percentComplete}%
                </span>
              </div>
              <div className="w-full bg-white/20 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                <div className="bg-gradient-to-r from-[#4F6EFF] to-[#CCFF00] dark:from-[#6A5AE0] dark:to-[#F3C4FB] h-full rounded-full transition-all duration-500" style={{ width: `${stats.percentComplete}%` }} />
              </div>
            </div>

            <div className="bg-white/15 backdrop-blur-xl border border-white/30 dark:bg-[#0C101D] dark:border-[#6A5AE0]/35 rounded-[2rem] p-6 flex flex-col justify-between shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-white/80 dark:text-slate-400">Target Finish</span>
                <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
              <div>
                <span className="text-xl font-bold text-white">
                  {pace.projectedCompletionDate}
                </span>
              </div>
              <p className="text-[11px] text-white/70 dark:text-slate-400 mt-3">~{pace.projectedDaysRemaining} days remaining</p>
            </div>
          </div>

          {/* ═══════════════════════════════════
              SPACED REPETITION "NEEDS REVIEW" QUEUE
              ═══════════════════════════════════ */}
          {needsReviewTopics.length > 0 && (
            <div className="bg-purple-500/15 border border-purple-500/40 rounded-[2rem] p-6 md:p-8">
              <div className="flex items-center gap-2 mb-4">
                <RotateCcw className="h-5 w-5 text-purple-300" />
                <h3 className="text-lg font-bold uppercase text-purple-200">
                  Spaced Repetition Queue ({needsReviewTopics.length} Needs Review)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {needsReviewTopics.map((topic) => (
                  <div
                    key={topic.id}
                    className="flex items-center justify-between bg-white/15 dark:bg-[#121829] p-3.5 rounded-xl border border-white/20 dark:border-white/15"
                  >
                    <div>
                      <span className="text-xs font-bold text-white block">{topic.title}</span>
                      <span className="text-[10px] text-[#CCFF00] dark:text-indigo-400 font-semibold">
                        Due for review today
                      </span>
                    </div>

                    <button
                      onClick={() => handleClearReviewTopic(topic.id)}
                      className="text-xs font-bold bg-[#CCFF00] dark:bg-indigo-500 text-black px-3.5 py-1.5 rounded-full hover:scale-105"
                    >
                      Reviewed ✓
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════
              TROPHY CASE (ACHIEVEMENT BADGES)
              ═══════════════════════════════════ */}
          <div className="bg-[#001A99]/70 border border-white/20 dark:bg-[#0C101D] dark:border-[#6A5AE0]/35 rounded-[2rem] p-6 md:p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-[#CCFF00] dark:text-indigo-400" />
                <h3 className="text-lg font-bold uppercase text-white">Trophy Case</h3>
              </div>
              <span className="text-xs font-bold text-[#CCFF00] dark:text-indigo-400">
                {unlockedBadges.length}/{BADGE_DEFINITIONS.length} Unlocked
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
              {BADGE_DEFINITIONS.map((badge) => {
                const isUnlocked = unlockedBadges.includes(badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`p-3.5 rounded-2xl border text-center flex flex-col items-center justify-between transition-all ${isUnlocked
                        ? "bg-[#CCFF00]/20 border-[#CCFF00]/50 text-[#CCFF00] dark:bg-indigo-500/15 dark:border-indigo-500/40 dark:text-indigo-400 shadow-[0_0_20px_rgba(204,255,0,0.2)]"
                        : "bg-white/10 border-white/15 text-white/50 grayscale"
                      }`}
                  >
                    <Trophy className={`h-4 w-4 mb-1 ${isUnlocked ? "text-[#CCFF00] dark:text-indigo-400" : "text-white/40"}`} />
                    <span className="text-[11px] font-bold uppercase block line-clamp-1 text-white">{badge.title}</span>
                    <span className="text-[9px] text-white/60 block mt-1 line-clamp-2">{badge.description}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weekly Recap Card */}
          <div className="bg-[#001A99]/70 border border-white/20 dark:bg-[#0C101D] dark:border-[#6A5AE0]/35 rounded-[2rem] p-6 md:p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#CCFF00] dark:text-indigo-400" />
                <h3 className="text-lg font-bold uppercase text-white">
                  Weekly Recap ({weeklyRecap.weekLabel})
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setWeekOffset((prev) => prev + 1)}
                  className="p-2.5 rounded-full bg-white/15 border border-white/20 text-white hover:bg-white/25 text-xs flex items-center gap-1 font-semibold"
                >
                  <ChevronLeft className="h-4 w-4" /> Prev Week
                </button>
                {weekOffset > 0 && (
                  <button
                    onClick={() => setWeekOffset((prev) => Math.max(0, prev - 1))}
                    className="p-2.5 rounded-full bg-white/15 border border-white/20 text-white hover:bg-white/25 text-xs flex items-center gap-1 font-semibold"
                  >
                    Next Week <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 p-4 rounded-2xl border border-white/20">
                <span className="text-xs text-white/80 block mb-1">Hours Studied This Week</span>
                <div className="text-2xl font-black text-[#CCFF00] dark:text-indigo-400">
                  {weeklyRecap.hoursThisWeek} hrs
                </div>
                <span className="text-[11px] text-white/60 mt-1 block">
                  vs {weeklyRecap.hoursLastWeek} hrs previous week
                </span>
              </div>

              <div className="bg-white/10 p-4 rounded-2xl border border-white/20">
                <span className="text-xs text-white/80 block mb-1">Topics Completed This Week</span>
                <div className="text-2xl font-black text-white">
                  {weeklyRecap.topicsCompletedThisWeek} Topics
                </div>
                <span className="text-[11px] text-[#CCFF00] dark:text-indigo-400 mt-1 block font-semibold">
                  🔥 {weeklyRecap.streakCurrent} Day Streak Active
                </span>
              </div>

              <div className="bg-white/10 p-4 rounded-2xl border border-white/20">
                <span className="text-xs text-white/80 block mb-1">Journal Highlight</span>
                {weeklyRecap.noteHighlight ? (
                  <p className="text-xs text-white/90 italic leading-relaxed">
                    &ldquo;{weeklyRecap.noteHighlight}&rdquo;
                  </p>
                ) : (
                  <p className="text-xs text-white/50 italic">
                    No notes logged for this week yet.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Continue Where You Left Off */}
          {nextTopic && (
            <div className="bg-white/15 backdrop-blur-xl border border-white/30 dark:bg-[#0C101D] dark:border-[#6A5AE0]/35 rounded-[2rem] p-6 md:p-8 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-[#CCFF00] dark:text-indigo-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#CCFF00] dark:text-indigo-400">
                  CONTINUE WHERE YOU LEFT OFF
                </span>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <span className="text-xs text-white/50 uppercase tracking-wider">
                    {nextTopic.phaseTitle}
                  </span>
                  <h3 className="text-xl md:text-2xl font-bold text-white mt-1">
                    {nextTopic.topic.title}
                  </h3>
                  <p className="text-xs md:text-sm text-white/70 mt-2 max-w-2xl leading-relaxed">
                    {nextTopic.topic.description}
                  </p>

                  <div className="flex items-center gap-3 mt-4 text-xs">
                    <span className="bg-[#0C101D] px-3 py-1 rounded-full text-white/80">
                      Est. {nextTopic.topic.estimatedHours} Hours
                    </span>
                    <span className="bg-[#CCFF00]/10 border border-[#CCFF00]/30 dark:bg-indigo-500/10 dark:border-indigo-500/30 px-3 py-1 rounded-full text-[#CCFF00] dark:text-indigo-400 font-semibold uppercase">
                      {nextTopic.topic.difficulty}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleNextTopic(nextTopic!.topic.id)}
                  className="shrink-0 flex items-center justify-center gap-2 bg-[#CCFF00] dark:bg-indigo-500 text-black font-bold text-xs px-6 py-3.5 rounded-full hover:scale-105 transition-transform"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Mark Completed
                </button>
              </div>
            </div>
          )}

          {/* Heatmap Section */}
          <div className="bg-white/15 backdrop-blur-xl border border-white/30 dark:bg-[#0C101D] dark:border-[#6A5AE0]/35 rounded-[2rem] p-6 md:p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#CCFF00] dark:text-indigo-400" />
                <h3 className="text-lg font-bold uppercase text-white">
                  26-Week Study Activity Heatmap
                </h3>
              </div>
              <span className="text-xs text-white/60">
                Click any day to view details
              </span>
            </div>

            <div className="overflow-x-auto pb-2">
              <div className="grid grid-rows-7 grid-flow-col gap-1.5 min-w-[650px]">
                {heatmapDays.map((day) => (
                  <button
                    key={day.date}
                    onClick={() => setSelectedHeatmapDay({ date: day.date, record: day.record })}
                    title={`${day.date}: ${day.active ? "Click to view note & activity" : "No activity recorded"}`}
                    className={`h-3.5 w-3.5 rounded-sm transition-transform hover:scale-125 ${day.active
                        ? "bg-[#CCFF00] dark:bg-indigo-500 shadow-[0_0_8px_rgba(129,140,248,0.5)]"
                        : "bg-[#0C101D] hover:bg-white/30"
                      }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-4 text-[10px] text-white/50">
              <span>Less</span>
              <div className="h-3 w-3 rounded-sm bg-[#0C101D]" />
              <div className="h-3 w-3 rounded-sm bg-[#CCFF00] dark:bg-indigo-500" />
              <span>More</span>
            </div>
          </div>
        </main>
      )}

      {/* Heatmap Day Detail Modal */}
      <Dialog open={!!selectedHeatmapDay} onOpenChange={(open) => !open && setSelectedHeatmapDay(null)}>
        <DialogContent className="bg-[#001A99] dark:bg-[#111a2e] border-white/20 dark:border-white/15 text-white sm:max-w-md p-6 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold uppercase text-[#CCFF00] dark:text-indigo-400 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {selectedHeatmapDay?.date} Activity
            </DialogTitle>
            <DialogDescription className="text-xs text-white/70">
              Study metrics and journal entries for this calendar date.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            <div className="flex items-center justify-between bg-[#0C101D] p-4 rounded-2xl">
              <span className="text-xs text-white/70 font-semibold">Minutes Studied</span>
              <span className="text-lg font-black text-[#CCFF00]">
                {selectedHeatmapDay?.record?.minutesStudied || 0} mins
              </span>
            </div>

            {selectedHeatmapDay?.record?.topicsCompletedToday &&
              selectedHeatmapDay.record.topicsCompletedToday.length > 0 && (
                <div>
                  <span className="text-xs text-white/60 font-semibold block mb-2">
                    Topics Completed:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedHeatmapDay.record.topicsCompletedToday.map((tId) => (
                      <span
                        key={tId}
                        className="text-[10px] bg-[#CCFF00]/20 text-[#CCFF00] border border-[#CCFF00]/40 px-2.5 py-1 rounded-full font-bold"
                      >
                        #{topicMap[tId]?.title || tId}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            <div>
              <span className="text-xs text-white/60 font-semibold block mb-1">
                Journal Note:
              </span>
              {selectedHeatmapDay?.record?.note ? (
                <div className="bg-[#0C101D] p-4 rounded-2xl text-xs text-white/90 leading-relaxed whitespace-pre-wrap">
                  {selectedHeatmapDay.record.note}
                </div>
              ) : (
                <p className="text-xs text-white/40 italic bg-[#121829] p-3 rounded-xl">
                  No journal entry recorded for this date.
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => {
                const d = selectedHeatmapDay?.date;
                setSelectedHeatmapDay(null);
                if (d) {
                  setJournalDate(d);
                  setJournalModalOpen(true);
                }
              }}
              className="px-5 py-2 rounded-full text-xs font-bold bg-[#CCFF00] text-black hover:scale-105"
            >
              Edit Note for Date
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Journal Modal */}
      <JournalModal
        open={journalModalOpen}
        onOpenChange={setJournalModalOpen}
        date={journalDate}
        onSaved={loadAllState}
      />
    </div>
  );
}
