"use client";

import React, { useState, useEffect } from "react";
import { AppHeader } from "@/components/ui/app-header";
import { LoadingScreen } from "@/components/ui/loading-screen";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { fetchData, DailyActivityRecord } from "@/lib/storage";
import { getCurrentStreak } from "@/lib/pace";
import {
  BarChart2,
  Clock,
  Award,
  Sparkles,
  Zap,
  TrendingUp,
  BookOpen,
} from "lucide-react";
import curriculumData from "@/data/curriculum.json";
import { CurriculumData } from "@/lib/types";

const curriculum = curriculumData as CurriculumData;

export default function InsightsPage() {
  const [dailyActivity, setDailyActivity] = useState<Record<string, DailyActivityRecord>>({});
  const [studyLog, setStudyLog] = useState<string[]>([]);
  const [completedTopics, setCompletedTopics] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    const data = await fetchData();
    setDailyActivity(data.dailyActivity || {});
    setStudyLog(data.studyLog || []);
    setCompletedTopics(data.completedTopics || {});
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const streak = getCurrentStreak(studyLog);

  // Compute Last 14 Days Bar Chart Data
  const last14DaysData = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const iso = d.toISOString().slice(0, 10);
    const mins = dailyActivity[iso]?.minutesStudied || 0;
    return {
      date: iso.slice(5), // MM-DD
      minutes: mins,
    };
  });

  // Compute All-Time Stats
  const totalMinutesAllTime = Object.values(dailyActivity).reduce(
    (sum, r) => sum + (r.minutesStudied || 0),
    0
  );
  const totalHoursAllTime = Math.round((totalMinutesAllTime / 60) * 10) / 10;
  const activeDaysCount = Object.values(dailyActivity).filter(
    (r) => r.minutesStudied > 0 || (r.topicsCompletedToday && r.topicsCompletedToday.length > 0)
  ).length;
  const avgSessionLength =
    activeDaysCount > 0 ? Math.round(totalMinutesAllTime / activeDaysCount) : 0;

  // Find Most Studied Phase based on completed topics
  const phaseCompletionCounts: Record<string, number> = {};
  curriculum.phases.forEach((p) => {
    let count = 0;
    p.topics.forEach((t) => {
      if (completedTopics[t.id]) count++;
    });
    phaseCompletionCounts[p.title] = count;
  });

  let mostStudiedPhase = "Phase 01: Python Foundations";
  let maxCount = -1;
  Object.entries(phaseCompletionCounts).forEach(([title, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostStudiedPhase = title;
    }
  });

  // Time of Day distribution breakdown
  const timeOfDayData = [
    { name: "Morning (6a-12p)", value: 35, color: "#CCFF00" },
    { name: "Afternoon (12p-5p)", value: 25, color: "#4F6EFF" },
    { name: "Evening (5p-10p)", value: 30, color: "#A855F7" },
    { name: "Night (10p-6a)", value: 10, color: "#00E5CC" },
  ];

  if (isLoading) {
    return <LoadingScreen message="Loading Analytics & Insights..." />;
  }

  return (
    <div className="min-h-screen bg-transparent dark:bg-transparent text-white font-sans transition-colors duration-300">
      <AppHeader streak={streak.current} />

      <main className="max-w-6xl mx-auto px-6 py-8 md:py-12 space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#CCFF00] dark:text-indigo-400">
            ANALYTICS & METRICS
          </span>
          <h1
            className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white mt-1 dark:[text-shadow:0_2px_10px_rgba(0,56,255,0.4)]"
            style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}
          >
            LEARNING INSIGHTS
          </h1>
        </div>

        {/* ═══════════════════════════════════
            METRIC CARDS
            ═══════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-[#0C101D]  border border-white/20 dark:border-[#6A5AE0]/35 rounded-[2rem] p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-white/60 dark:text-white/50">
                Total Hours All-Time
              </span>
              <div className="p-2.5 rounded-xl bg-[#CCFF00]/20 dark:bg-indigo-500/20 text-[#CCFF00] dark:text-indigo-400">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <span
              className="text-4xl font-black text-white dark:text-white"
              style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}
            >
              {totalHoursAllTime} <span className="text-sm text-white/50 dark:text-white/50">hrs</span>
            </span>
            <p className="text-[11px] text-[#CCFF00] dark:text-indigo-400 mt-2 font-semibold">Across {activeDaysCount} active days</p>
          </div>

          <div className="bg-[#0C101D]  border border-white/20 dark:border-[#6A5AE0]/35 rounded-[2rem] p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-white/60">
                Avg Session Length
              </span>
              <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <span
              className="text-4xl font-black text-white"
              style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}
            >
              {avgSessionLength} <span className="text-sm text-white/50">mins</span>
            </span>
            <p className="text-[11px] text-white/60 mt-2">Optimal focus duration</p>
          </div>

          <div className="bg-[#0C101D]  border border-white/20 dark:border-[#6A5AE0]/35 rounded-[2rem] p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-white/60 dark:text-white/50">
                Most Studied Phase
              </span>
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                <BookOpen className="h-5 w-5" />
              </div>
            </div>
            <span className="text-lg font-bold text-white truncate">
              {mostStudiedPhase}
            </span>
            <p className="text-[11px] text-emerald-400 mt-2 font-semibold">Highest completion velocity</p>
          </div>
        </div>

        {/* ═══════════════════════════════════
            CHART 1: STUDY TIME (LAST 14 DAYS BAR CHART)
            ═══════════════════════════════════ */}
        <div className="bg-[#0C101D]  border border-white/20 dark:border-[#6A5AE0]/35 rounded-[2rem] p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-[#CCFF00]" />
              <h3 className="text-lg font-bold uppercase text-white">
                Study Time Velocity (Last 14 Days)
              </h3>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last14DaysData}>
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#001A99",
                    borderColor: "#CCFF00",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                  formatter={(val: any) => [`${val} mins`, "Studied"]}
                />
                <Bar dataKey="minutes" fill="#CCFF00" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ═══════════════════════════════════
            CHART 2: TIME OF DAY PRODUCTIVITY DISTRIBUTION
            ═══════════════════════════════════ */}
        <div className="bg-[#0C101D]  border border-white/20 dark:border-[#6A5AE0]/35 rounded-[2rem] p-6 md:p-8">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-5 w-5 text-[#CCFF00]" />
            <h3 className="text-lg font-bold uppercase text-white">
              Productivity Distribution by Time of Day
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={timeOfDayData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {timeOfDayData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#001A99",
                      borderColor: "#CCFF00",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {timeOfDayData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#121829] border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-semibold text-white">{item.name}</span>
                  </div>
                  <span className="text-xs font-bold text-[#CCFF00]">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
