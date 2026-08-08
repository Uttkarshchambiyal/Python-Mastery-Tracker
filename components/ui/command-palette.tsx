"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  Search,
  Timer,
  BookOpen,
  Trophy,
  LayoutDashboard,
  BarChart2,
  Settings,
  Flame,
  Zap,
  X,
} from "lucide-react";
import curriculumData from "@/data/curriculum.json";
import { CurriculumData } from "@/lib/types";

const curriculum = curriculumData as CurriculumData;

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const handleSelectRoute = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  if (!open) return null;

  return (
    <div
      onClick={() => setOpen(false)}
      className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md flex items-start justify-center pt-[15vh] px-4 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-[#001A99] dark:bg-[#111a2e] border border-white/20 dark:border-slate-700/50 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.9)] text-white cursor-default"
      >
        <Command label="Global Command Palette">
          <div className="flex items-center border-b border-white/10 dark:border-slate-700/50 px-4 py-3 relative">
            <Search className="h-5 w-5 text-[#CCFF00] dark:text-indigo-400 mr-3 shrink-0" />
            <Command.Input
              autoFocus
              placeholder="Search topics, run commands, or jump to page..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40 focus:ring-0"
            />

            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              title="Close (Esc)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <Command.List className="max-h-[60vh] overflow-y-auto p-3 space-y-2 font-sans text-xs">
            <Command.Empty className="py-6 text-center text-white/50 text-xs">
              No matching commands or topics found.
            </Command.Empty>

            {/* QUICK ACTIONS GROUP */}
            <Command.Group
              heading="Navigation & Quick Commands"
              className="text-[10px] font-bold uppercase tracking-wider text-[#CCFF00] dark:text-indigo-400 px-2 py-1"
            >
              <Command.Item
                onSelect={() => handleSelectRoute("/dashboard")}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-white/10 dark:hover:bg-white/10 transition-colors"
              >
                <LayoutDashboard className="h-4 w-4 text-[#CCFF00] dark:text-indigo-400" />
                <span className="font-semibold text-white">Go to Learner Dashboard</span>
              </Command.Item>

              <Command.Item
                onSelect={() => handleSelectRoute("/curriculum")}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-white/10 dark:hover:bg-white/10 transition-colors"
              >
                <BookOpen className="h-4 w-4 text-[#CCFF00] dark:text-indigo-400" />
                <span className="font-semibold text-white">Go to Curriculum Roadmap</span>
              </Command.Item>

              <Command.Item
                onSelect={() => handleSelectRoute("/projects")}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-white/10 dark:hover:bg-white/10 transition-colors"
              >
                <Trophy className="h-4 w-4 text-[#CCFF00] dark:text-indigo-400" />
                <span className="font-semibold text-white">Go to Milestone Projects</span>
              </Command.Item>

              <Command.Item
                onSelect={() => handleSelectRoute("/insights")}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-white/10 dark:hover:bg-white/10 transition-colors"
              >
                <BarChart2 className="h-4 w-4 text-[#CCFF00] dark:text-indigo-400" />
                <span className="font-semibold text-white">Go to Analytics Insights</span>
              </Command.Item>

              <Command.Item
                onSelect={() => handleSelectRoute("/journal")}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-white/10 dark:hover:bg-white/10 transition-colors"
              >
                <Flame className="h-4 w-4 text-[#CCFF00] dark:text-indigo-400" />
                <span className="font-semibold text-white">Go to Learning Journal</span>
              </Command.Item>

              <Command.Item
                onSelect={() => handleSelectRoute("/settings")}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-white/10 dark:hover:bg-white/10 transition-colors"
              >
                <Settings className="h-4 w-4 text-[#CCFF00] dark:text-indigo-400" />
                <span className="font-semibold text-white">Go to Tracker Settings</span>
              </Command.Item>
            </Command.Group>

            {/* CURRICULUM TOPICS SEARCH */}
            <Command.Group
              heading="Curriculum Topics"
              className="text-[10px] font-bold uppercase tracking-wider text-white/50 px-2 py-1 mt-2"
            >
              {curriculum.phases.flatMap((phase) =>
                phase.topics.map((t) => (
                  <Command.Item
                    key={t.id}
                    onSelect={() => handleSelectRoute("/curriculum")}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer hover:bg-white/10 dark:hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Zap className="h-3.5 w-3.5 text-[#CCFF00] dark:text-indigo-400" />
                      <span className="font-semibold text-white">{t.title}</span>
                    </div>
                    <span className="text-[10px] text-white/40 uppercase font-mono">{t.difficulty}</span>
                  </Command.Item>
                ))
              )}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
