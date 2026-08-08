"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Play,
  Pause,
  Square,
  Timer,
  Clock,
  PlusCircle,
  RotateCcw,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import {
  ActiveTimerSession,
  getActiveTimerSession,
  saveActiveTimerSession,
  logStudyMinutes,
} from "@/lib/storage";

export interface StudyTimerProps {
  onSessionComplete?: (minutesLogged: number, mode: string) => void;
}

export function StudyTimer({ onSessionComplete }: StudyTimerProps) {
  const [session, setSession] = useState<ActiveTimerSession | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [manualMinutes, setManualMinutes] = useState("");
  const [manualDate, setManualDate] = useState(new Date().toISOString().slice(0, 10));
  const [showManualModal, setShowManualModal] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Sync with active session on mount
  useEffect(() => {
    const loadSession = async () => {
      const saved = await getActiveTimerSession();
      if (saved) {
        setSession(saved);
      }
      setIsLoaded(true);
    };
    loadSession();
  }, []);

  // Timer interval ticker
  useEffect(() => {
    if (!session || session.status !== "running") return;

    const interval = setInterval(() => {
      const startMs = new Date(session.startedAt).getTime();
      const nowMs = Date.now();
      const currentRunSeconds = Math.floor((nowMs - startMs) / 1000);
      const totalSec = session.accumulatedSeconds + currentRunSeconds;

      setElapsedSeconds(totalSec);

      // Pomodoro Phase auto-transition check (25 min work = 1500s, 5 min break = 300s)
      if (session.mode === "pomodoro") {
        const cycleSec = 1800; // 25 + 5 mins
        const inCycleSec = totalSec % cycleSec;
        const isWork = inCycleSec < 1500;
        const newPhase = isWork ? "work" : "break";

        if (session.pomodoroPhase !== newPhase) {
          const updated: ActiveTimerSession = {
            ...session,
            pomodoroPhase: newPhase,
            cyclesCompleted: Math.floor(totalSec / cycleSec),
          };
          setSession(updated);
          saveActiveTimerSession(updated);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session]);

  const handleStart = async (mode: "stopwatch" | "pomodoro") => {
    const newSession: ActiveTimerSession = {
      mode,
      startedAt: new Date().toISOString(),
      accumulatedSeconds: 0,
      status: "running",
      pomodoroPhase: mode === "pomodoro" ? "work" : undefined,
      cyclesCompleted: 0,
    };
    setSession(newSession);
    setElapsedSeconds(0);
    await saveActiveTimerSession(newSession);
  };

  const handlePause = async () => {
    if (!session) return;
    const nowMs = Date.now();
    const startMs = new Date(session.startedAt).getTime();
    const additional = Math.floor((nowMs - startMs) / 1000);
    const updated: ActiveTimerSession = {
      ...session,
      accumulatedSeconds: session.accumulatedSeconds + additional,
      status: "paused",
    };
    setSession(updated);
    await saveActiveTimerSession(updated);
  };

  const handleResume = async () => {
    if (!session) return;
    const updated: ActiveTimerSession = {
      ...session,
      startedAt: new Date().toISOString(),
      status: "running",
    };
    setSession(updated);
    await saveActiveTimerSession(updated);
  };

  const handleStop = async () => {
    if (!session) return;

    let finalSec = session.accumulatedSeconds;
    if (session.status === "running") {
      const nowMs = Date.now();
      const startMs = new Date(session.startedAt).getTime();
      finalSec += Math.floor((nowMs - startMs) / 1000);
    }

    const minutesLogged = Math.max(1, Math.round(finalSec / 60));
    const today = new Date().toISOString().slice(0, 10);

    // Save study minutes and sync
    await logStudyMinutes(today, minutesLogged, session.mode);

    // Clear active session
    setSession(null);
    setElapsedSeconds(0);
    await saveActiveTimerSession(null);

    // Notify callback (opens Journal Modal)
    onSessionComplete?.(minutesLogged, session.mode);
  };

  const handleLogManual = async (e: React.FormEvent) => {
    e.preventDefault();
    const mins = parseInt(manualMinutes, 10);
    if (!mins || mins <= 0) return;

    await logStudyMinutes(manualDate, mins, "stopwatch");
    setShowManualModal(false);
    setManualMinutes("");

    onSessionComplete?.(mins, "manual");
  };

  const formatTimeDisplay = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (!isLoaded) return null;

  return (
    <>
      {/* ═══════════════════════════════════
          MAIN TIMER CARD (SURFACED ON DASHBOARD)
          ═══════════════════════════════════ */}
      <div className="bg-[#0C101D] border border-[#6A5AE0]/35 rounded-[2rem] p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#6A5AE0]/20 text-[#F3C4FB]">
              <Timer className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white uppercase">Study Timer</h3>
              <p className="text-xs text-slate-400">Track live study sessions or log time manually</p>
            </div>
          </div>

          <button
            onClick={() => setShowManualModal(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#CCFF00] hover:underline"
          >
            <PlusCircle className="h-4 w-4" />
            Log Manually
          </button>
        </div>

        {!session ? (
          /* Mode Selector Controls */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => handleStart("stopwatch")}
              className="flex flex-col items-center justify-center p-6 rounded-2xl bg-[#121829] border border-[#6A5AE0]/35 hover:border-[#F3C4FB] hover:bg-[#161D33] transition-all group"
            >
              <Clock className="h-8 w-8 text-[#F3C4FB] mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-sm text-white">Stopwatch Mode</span>
              <span className="text-[11px] text-slate-400 mt-1">Counts up freely during study</span>
            </button>

            <button
              onClick={() => handleStart("pomodoro")}
              className="flex flex-col items-center justify-center p-6 rounded-2xl bg-[#121829] border border-[#6A5AE0]/35 hover:border-[#F3C4FB] hover:bg-[#161D33] transition-all group"
            >
              <Timer className="h-8 w-8 text-[#F3C4FB] mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-sm text-white">Pomodoro Mode</span>
              <span className="text-[11px] text-slate-400 mt-1">25 min Work • 5 min Break</span>
            </button>
          </div>
        ) : (
          /* Active Session Display */
          <div className="flex flex-col items-center justify-center py-4">
            {/* Mode badge */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#CCFF00] bg-[#CCFF00]/10 px-3 py-1 rounded-full border border-[#CCFF00]/30">
                {session.mode === "pomodoro" ? (
                  <>
                    🍅 Pomodoro • {session.pomodoroPhase === "break" ? "5 Min Break ☕" : "Work Focus ⚡"}
                  </>
                ) : (
                  "⏱ Stopwatch Running"
                )}
              </span>
            </div>

            {/* Time readout */}
            <div
              className="text-5xl md:text-6xl font-black tracking-tight text-white mb-6"
              style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}
            >
              {formatTimeDisplay(elapsedSeconds)}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {session.status === "running" ? (
                <button
                  onClick={handlePause}
                  className="flex items-center gap-2 bg-amber-500 text-black font-bold text-xs px-6 py-3 rounded-full hover:scale-105 transition-transform"
                >
                  <Pause className="h-4 w-4" /> Pause
                </button>
              ) : (
                <button
                  onClick={handleResume}
                  className="flex items-center gap-2 bg-[#CCFF00] text-black font-bold text-xs px-6 py-3 rounded-full hover:scale-105 transition-transform"
                >
                  <Play className="h-4 w-4" /> Resume
                </button>
              )}

              <button
                onClick={handleStop}
                className="flex items-center gap-2 bg-red-500 text-white font-bold text-xs px-6 py-3 rounded-full hover:scale-105 transition-transform"
              >
                <Square className="h-4 w-4" /> Stop & Log Session
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════
          FLOATING WIDGET (NAVIGATING PAGES)
          ═══════════════════════════════════ */}
      <AnimatePresence>
        {session && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 bg-[#001A99] border-2 border-[#CCFF00] p-4 rounded-2xl shadow-[0_0_30px_rgba(204,255,0,0.3)] flex items-center gap-4 text-white"
          >
            <div>
              <div className="text-[10px] font-bold text-[#CCFF00] uppercase">
                {session.mode} • {session.status}
              </div>
              <div className="text-2xl font-black font-mono">
                {formatTimeDisplay(elapsedSeconds)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {session.status === "running" ? (
                <button
                  onClick={handlePause}
                  className="p-2 rounded-xl bg-amber-500 text-black hover:scale-105"
                >
                  <Pause className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleResume}
                  className="p-2 rounded-xl bg-[#CCFF00] text-black hover:scale-105"
                >
                  <Play className="h-4 w-4" />
                </button>
              )}

              <button
                onClick={handleStop}
                className="p-2 rounded-xl bg-red-500 text-white hover:scale-105"
              >
                <Square className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════
          MANUAL TIME LOG MODAL
          ═══════════════════════════════════ */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#001A99] border border-white/20 rounded-3xl p-6 max-w-md w-full text-white">
            <h3 className="text-xl font-bold uppercase text-[#CCFF00] mb-1">
              Log Study Time Manually
            </h3>
            <p className="text-xs text-white/60 mb-4">
              Enter study duration completed offline without the active timer.
            </p>

            <form onSubmit={handleLogManual} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Minutes Studied
                </label>
                <input
                  type="number"
                  min="1"
                  max="720"
                  required
                  value={manualMinutes}
                  onChange={(e) => setManualMinutes(e.target.value)}
                  placeholder="e.g. 45"
                  className="w-full bg-[#0C101D] border border-white/20 rounded-xl p-3 text-sm text-white outline-none focus:border-[#CCFF00]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  className="w-full bg-[#0C101D] border border-white/20 rounded-xl p-3 text-sm text-white outline-none focus:border-[#CCFF00]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full text-xs font-bold bg-[#CCFF00] text-black hover:scale-105"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
