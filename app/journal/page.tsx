"use client";

import React, { useState, useEffect } from "react";
import { AppHeader } from "@/components/ui/app-header";
import { JournalModal } from "@/components/ui/journal-modal";
import { LoadingScreen } from "@/components/ui/loading-screen";
import {
  fetchData,
  DailyActivityRecord,
} from "@/lib/storage";
import { getCurrentStreak } from "@/lib/pace";
import {
  BookOpen,
  Search,
  Download,
  Plus,
  Calendar,
  Clock,
  Tag,
  Sparkles,
} from "lucide-react";
import curriculumData from "@/data/curriculum.json";
import { CurriculumData } from "@/lib/types";

const curriculum = curriculumData as CurriculumData;

export default function JournalPage() {
  const [dailyActivity, setDailyActivity] = useState<Record<string, DailyActivityRecord>>({});
  const [studyLog, setStudyLog] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [journalModalOpen, setJournalModalOpen] = useState(false);
  const [selectedDateForModal, setSelectedDateForModal] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // Map topic IDs to title
  const topicMap: Record<string, string> = {};
  curriculum.phases.forEach((p) => {
    p.topics.forEach((t) => {
      topicMap[t.id] = t.title;
    });
  });

  const loadData = async () => {
    const data = await fetchData();
    setDailyActivity(data.dailyActivity || {});
    setStudyLog(data.studyLog || []);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const streak = getCurrentStreak(studyLog);

  // Reverse chronological list of days with entries
  const journalEntries = Object.entries(dailyActivity)
    .filter(([_, record]) => record.note && record.note.trim().length > 0)
    .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
    .filter(([dateStr, record]) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      const matchNote = record.note?.toLowerCase().includes(query);
      const matchDate = dateStr.includes(query);
      const matchTopics = record.topicsCompletedToday?.some((tId) =>
        (topicMap[tId] || tId).toLowerCase().includes(query)
      );
      return matchNote || matchDate || matchTopics;
    });

  // Client-side Markdown export
  const handleExportMarkdown = () => {
    if (journalEntries.length === 0) return;

    let md = `# Python Mastery Learning Journal\n\n`;
    md += `*Exported on ${new Date().toLocaleDateString()} • Total Entries: ${journalEntries.length}*\n\n---\n\n`;

    journalEntries.forEach(([dateStr, record]) => {
      md += `## ${dateStr}\n\n`;
      md += `- **Minutes Studied**: ${record.minutesStudied || 0} mins\n`;
      if (record.topicsCompletedToday && record.topicsCompletedToday.length > 0) {
        const topicTitles = record.topicsCompletedToday
          .map((id) => topicMap[id] || id)
          .join(", ");
        md += `- **Tagged Topics**: ${topicTitles}\n`;
      }
      md += `\n### Note\n${record.note}\n\n---\n\n`;
    });

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `python-mastery-journal-${new Date().toISOString().slice(0, 10)}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenAddNote = (date?: string) => {
    setSelectedDateForModal(date || new Date().toISOString().slice(0, 10));
    setJournalModalOpen(true);
  };

  if (isLoading) {
    return <LoadingScreen message="Loading Learning Journal..." />;
  }

  return (
    <div className="min-h-screen bg-transparent dark:bg-transparent text-white font-sans transition-colors duration-300">
      <AppHeader streak={streak.current} />

      <main className="max-w-4xl mx-auto px-6 py-8 md:py-12 space-y-8">
        {/* Page Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#CCFF00] dark:text-indigo-400">
              REFLECTION LOGS
            </span>
            <h1
              className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white mt-1 dark:[text-shadow:0_2px_10px_rgba(0,56,255,0.4)]"
              style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}
            >
              LEARNING JOURNAL
            </h1>
          </div>

          <button
            onClick={() => handleOpenAddNote()}
            className="flex items-center gap-2 bg-[#CCFF00] dark:bg-indigo-500 text-black font-bold text-xs px-5 py-2.5 rounded-full hover:scale-105 transition-transform"
          >
            <Plus className="h-4 w-4" />
            + New Journal Entry
          </button>
        </div>

        {/* Entries List */}
        {journalEntries.length === 0 ? (
          <div className="bg-[#0C101D]  border border-white/20 dark:border-[#6A5AE0]/35 rounded-[2rem] p-12 text-center space-y-4">
            <BookOpen className="h-12 w-12 text-[#CCFF00] dark:text-indigo-400 mx-auto opacity-80" />
            <h3 className="text-xl font-bold uppercase text-white">No Journal Entries Yet</h3>
            <p className="text-xs text-white/60 dark:text-white/70 max-w-md mx-auto leading-relaxed">
              Start documenting your daily breakthroughs, code snippets, or tricky bugs to build your developer learning archive!
            </p>
            <button
              onClick={() => handleOpenAddNote()}
              className="inline-flex items-center gap-2 bg-[#CCFF00] dark:bg-indigo-500 text-black font-bold text-xs px-6 py-3 rounded-full hover:scale-105 transition-transform"
            >
              Create Your First Entry
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {journalEntries.map(([dateStr, record]) => (
              <div
                key={dateStr}
                className="bg-[#0C101D]  border border-white/20 dark:border-[#6A5AE0]/35 rounded-[2rem] p-6 space-y-4 dark:hover:border-[#00D4FF]/40 transition-colors"
              >
                {/* Entry Header */}
                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#CCFF00]" />
                    <span className="font-bold text-sm text-white">{dateStr}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-xs text-white/60">
                      <Clock className="h-3.5 w-3.5" />
                      {record.minutesStudied || 0} mins
                    </span>

                    <button
                      onClick={() => handleOpenAddNote(dateStr)}
                      className="text-[11px] font-semibold text-[#CCFF00] hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                </div>

                {/* Tagged Topics */}
                {record.topicsCompletedToday && record.topicsCompletedToday.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {record.topicsCompletedToday.map((tId) => (
                      <span
                        key={tId}
                        className="text-[10px] bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] px-2.5 py-0.5 rounded-full font-medium"
                      >
                        #{topicMap[tId] || tId}
                      </span>
                    ))}
                  </div>
                )}

                {/* Note Content */}
                <p className="text-xs text-white/90 leading-relaxed whitespace-pre-wrap font-sans">
                  {record.note}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      <JournalModal
        open={journalModalOpen}
        onOpenChange={setJournalModalOpen}
        date={selectedDateForModal}
        onSaved={loadData}
      />
    </div>
  );
}
