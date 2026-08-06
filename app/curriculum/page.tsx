"use client";

import React, { useState, useEffect } from "react";
import { AppHeader } from "@/components/ui/app-header";
import { TopicModal } from "@/components/ui/topic-modal";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronDown,
  BookOpen,
  CheckCircle2,
  Filter,
  Sparkles,
  Flame,
  Clock,
  FileText,
  RotateCcw,
} from "lucide-react";
import curriculumData from "@/data/curriculum.json";
import { CurriculumData, Phase, Topic } from "@/lib/types";
import {
  getCompletedTopics,
  getStudyLogDates,
  getTopicDetailStates,
  toggleTopicCompleted,
} from "@/lib/storage";
import { getCurrentStreak } from "@/lib/pace";
import { Checkbox } from "@/components/ui/checkbox";

const curriculum = curriculumData as CurriculumData;

type FilterType = "all" | "done" | "remaining";

export default function CurriculumPage() {
  const [completedTopics, setCompletedTopics] = useState<Record<string, string>>({});
  const [studyLog, setStudyLog] = useState<string[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(
    new Set([curriculum.phases[0].id])
  );
  const [selectedTopic, setSelectedTopic] = useState<{ topic: Topic; phaseTitle: string } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadData = () => {
    setCompletedTopics(getCompletedTopics());
    setStudyLog(getStudyLogDates());
    setIsLoaded(true);
  };

  useEffect(() => {
    loadData();
  }, []);

  const streak = getCurrentStreak(studyLog);
  const completedCount = Object.keys(completedTopics).length;
  const totalTopicsCount = curriculum.phases.reduce(
    (acc, p) => acc + p.topics.length,
    0
  );
  const percentComplete = Math.round((completedCount / totalTopicsCount) * 100);

  const togglePhase = (phaseId: string) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phaseId)) next.delete(phaseId);
      else next.add(phaseId);
      return next;
    });
  };

  const handleOpenTopicModal = (topic: Topic, phaseTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTopic({ topic, phaseTitle });
    setModalOpen(true);
  };

  const handleToggleTopic = (topicId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTopicCompleted(topicId);
    loadData();
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-[#0038FF] dark:bg-[#02040A] text-white font-sans transition-colors duration-300">
      <AppHeader streak={streak.current} />

      <main className="max-w-6xl mx-auto px-6 py-8 md:py-12 space-y-8">
        {/* Header & Filter Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#CCFF00] dark:text-[#00D4FF]">
              END-TO-END ROADMAP
            </span>
            <h1
              className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white mt-1 dark:[text-shadow:0_2px_10px_rgba(0,56,255,0.4)]"
              style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}
            >
              PYTHON CURRICULUM
            </h1>
            <p className="text-xs text-white/60 dark:text-white/70 mt-1">
              {completedCount} of {totalTopicsCount} topics completed ({percentComplete}%)
            </p>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-2 bg-white/10 dark:bg-white/5 p-1.5 rounded-full border border-white/20 dark:border-white/10">
            <span className="text-xs text-white/40 px-2 font-semibold">Filter:</span>
            {(["all", "remaining", "done"] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${
                  filter === f
                    ? "bg-[#CCFF00] text-black dark:bg-[#00D4FF] dark:text-black shadow-md"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="bg-white/10 dark:bg-[#0038FF]/[0.02] backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-white/70 dark:text-white/70">Overall Curriculum Progress</span>
            <span className="font-bold text-[#CCFF00] dark:text-[#00D4FF]">{percentComplete}%</span>
          </div>
          <div className="w-full bg-white/10 dark:bg-white/10 h-3 rounded-full overflow-hidden">
            <div
              className="bg-[#CCFF00] dark:bg-[#00D4FF] h-full rounded-full transition-all duration-500"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        </div>

        {/* Phases Accordion List */}
        <div className="space-y-4">
          {curriculum.phases.map((phase) => {
            const isExpanded = expandedPhases.has(phase.id);
            const phaseCompletedCount = phase.topics.filter(
              (t) => completedTopics[t.id]
            ).length;
            const phaseTotalCount = phase.topics.length;
            const phasePct = Math.round(
              (phaseCompletedCount / phaseTotalCount) * 100
            );

            const visibleTopics = phase.topics.filter((t) => {
              const isDone = !!completedTopics[t.id];
              if (filter === "done") return isDone;
              if (filter === "remaining") return !isDone;
              return true;
            });

            if (filter !== "all" && visibleTopics.length === 0) {
              return null;
            }

            return (
              <div
                key={phase.id}
                className="bg-white/10 dark:bg-[#0038FF]/[0.02] backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2rem] overflow-hidden transition-all"
              >
                <button
                  onClick={() => togglePhase(phase.id)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-10 w-10 shrink-0 rounded-2xl bg-[#CCFF00]/10 border border-[#CCFF00]/30 dark:bg-[#00D4FF]/10 dark:border-[#00D4FF]/30 text-[#CCFF00] dark:text-[#00D4FF] flex items-center justify-center font-black text-sm">
                      0{phase.order}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-white truncate dark:text-white">
                        {phase.title}
                      </h3>
                      <p className="text-xs text-white/50 dark:text-white/50 truncate mt-0.5">
                        {phase.why}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="hidden sm:flex flex-col items-end">
                      <span className="text-xs font-bold text-[#CCFF00] dark:text-[#00D4FF]">
                        {phaseCompletedCount}/{phaseTotalCount} Done
                      </span>
                      <div className="w-24 bg-white/20 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div
                          className="bg-[#CCFF00] dark:bg-[#00D4FF] h-full rounded-full"
                          style={{ width: `${phasePct}%` }}
                        />
                      </div>
                    </div>

                    <ChevronDown
                      className={`h-5 w-5 text-white/50 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="border-t border-white/10 dark:border-white/10 px-6 py-4 space-y-2"
                    >
                      {visibleTopics.map((topic) => {
                        const isDone = !!completedTopics[topic.id];
                        const detailsMap = getTopicDetailStates();
                        const tState = detailsMap[topic.id];
                        const hasSRS = !!tState?.nextReviewDate;
                        const hasNotes = !!tState?.notes && tState.notes.trim().length > 0;

                        return (
                          <div
                            key={topic.id}
                            onClick={(e) => handleOpenTopicModal(topic, phase.title, e)}
                            className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all ${
                              isDone
                                ? "bg-[#CCFF00]/10 border border-[#CCFF00]/30"
                                : "hover:bg-white/5 dark:hover:bg-white/5"
                            }`}
                          >
                            <div className="flex items-start gap-4 flex-1 min-w-0">
                              <div onClick={(e) => handleToggleTopic(topic.id, e)}>
                                <Checkbox
                                  checked={isDone}
                                  onCheckedChange={() => {}}
                                  className="mt-0.5 h-5 w-5 rounded border-2 border-white/30 data-[state=checked]:bg-[#CCFF00] data-[state=checked]:border-[#CCFF00] data-[state=checked]:text-black"
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span
                                    className={`text-sm font-semibold ${
                                      isDone ? "text-[#CCFF00] line-through" : "text-white"
                                    }`}
                                  >
                                    {topic.title}
                                  </span>

                                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                                    {topic.difficulty}
                                  </span>

                                  {hasSRS && (
                                    <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                      <RotateCcw className="h-3 w-3" /> Review Scheduled
                                    </span>
                                  )}

                                  {hasNotes && (
                                    <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                      <FileText className="h-3 w-3" /> Notes
                                    </span>
                                  )}
                                </div>

                                <p className="text-xs text-white/60 mt-1 leading-relaxed truncate">
                                  {topic.description}
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={(e) => handleOpenTopicModal(topic, phase.title, e)}
                              className="shrink-0 text-xs font-bold text-[#CCFF00] hover:underline px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10"
                            >
                              Notes & SRS →
                            </button>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </main>

      {/* Topic Detail Modal */}
      <TopicModal
        topic={selectedTopic?.topic || null}
        phaseTitle={selectedTopic?.phaseTitle}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onStateChanged={loadData}
      />
    </div>
  );
}
