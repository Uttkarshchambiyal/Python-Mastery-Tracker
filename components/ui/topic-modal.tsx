"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  FileText,
  RotateCcw,
  Check,
} from "lucide-react";
import { Topic } from "@/lib/types";
import {
  getTopicDetailStates,
  setTopicNotesAndSRS,
  toggleTopicCompleted,
  getCompletedTopics,
} from "@/lib/storage";
import { addDays } from "date-fns";

export interface TopicModalProps {
  topic: Topic | null;
  phaseTitle?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStateChanged?: () => void;
}

export function TopicModal({
  topic,
  phaseTitle,
  open,
  onOpenChange,
  onStateChanged,
}: TopicModalProps) {
  const [notes, setNotes] = useState("");
  const [nextReviewDate, setNextReviewDate] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (open && topic) {
      const loadTopicData = async () => {
        const detailsMap = await getTopicDetailStates();
        const topicState = detailsMap[topic.id];
        const completedMap = await getCompletedTopics();

        setNotes(topicState?.notes || "");
        setNextReviewDate(topicState?.nextReviewDate || null);
        setIsCompleted(!!completedMap[topic.id]);
        setActiveTab("edit");
        setSavedSuccess(false);
      };
      loadTopicData();
    }
  }, [open, topic]);

  if (!topic) return null;

  const handleToggleComplete = async () => {
    await toggleTopicCompleted(topic.id);
    setIsCompleted((prev) => !prev);
    onStateChanged?.();
  };

  const handleSetSRSReview = async (days: number) => {
    const targetDate = addDays(new Date(), days).toISOString().slice(0, 10);
    await setTopicNotesAndSRS(topic.id, { nextReviewDate: targetDate });
    setNextReviewDate(targetDate);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
    onStateChanged?.();
  };

  const handleClearSRS = async () => {
    await setTopicNotesAndSRS(topic.id, { nextReviewDate: null });
    setNextReviewDate(null);
    onStateChanged?.();
  };

  const handleSaveNotes = async () => {
    await setTopicNotesAndSRS(topic.id, { notes });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
    onStateChanged?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#001A99] dark:bg-[#111a2e] border-white/25 text-white sm:max-w-2xl p-6 rounded-3xl max-h-[85vh] overflow-y-auto shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#CCFF00]/15 border border-[#CCFF00]/40 text-[#CCFF00] px-3 py-0.5 rounded-full">
              {topic.difficulty} • Est. {topic.estimatedHours} hrs
            </span>
            {phaseTitle && (
              <span className="text-xs text-white/60">{phaseTitle}</span>
            )}
          </div>

          <DialogTitle
            className="text-2xl font-bold uppercase tracking-tight text-white"
            style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}
          >
            {topic.title}
          </DialogTitle>
          <DialogDescription className="text-xs text-white/75 leading-relaxed mt-1">
            {topic.description}
          </DialogDescription>
        </DialogHeader>

        {/* Action Bar: Toggle Complete & SRS Review Picker */}
        <div className="my-4 p-4 rounded-2xl bg-white/10 dark:bg-white/5 border border-white/15 flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={handleToggleComplete}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
              isCompleted
                ? "bg-[#CCFF00] text-black shadow-lg"
                : "bg-white/15 text-white hover:bg-white/25"
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            {isCompleted ? "Completed ✓" : "Mark as Completed"}
          </button>

          {/* Spaced Repetition (SRS) Review Picker */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/70 font-semibold">SRS Review:</span>
            {[3, 7, 14].map((days) => (
              <button
                key={days}
                onClick={() => handleSetSRSReview(days)}
                className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/15 hover:bg-[#CCFF00] hover:text-black text-white/90 transition-colors"
              >
                +{days}d
              </button>
            ))}
          </div>
        </div>

        {/* Current Review Date Indicator */}
        {nextReviewDate && (
          <div className="flex items-center justify-between text-xs bg-purple-500/20 border border-purple-400/40 p-3 rounded-xl text-purple-200">
            <span className="flex items-center gap-2 font-semibold">
              <RotateCcw className="h-4 w-4" />
              Scheduled for Spaced Review on {nextReviewDate}
            </span>
            <button
              onClick={handleClearSRS}
              className="text-[10px] underline hover:text-white"
            >
              Clear Review
            </button>
          </div>
        )}

        {/* Reference Notes Section */}
        <div className="space-y-3 mt-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/80">
              <FileText className="h-4 w-4 text-[#CCFF00]" />
              My Reference Notes (Markdown Supported)
            </label>

            <div className="flex items-center gap-1 bg-white/15 p-1 rounded-full text-[10px]">
              <button
                onClick={() => setActiveTab("edit")}
                className={`px-3 py-1 rounded-full font-semibold ${
                  activeTab === "edit"
                    ? "bg-[#CCFF00] text-black"
                    : "text-white/70"
                }`}
              >
                Edit
              </button>
              <button
                onClick={() => setActiveTab("preview")}
                className={`px-3 py-1 rounded-full font-semibold ${
                  activeTab === "preview"
                    ? "bg-[#CCFF00] text-black"
                    : "text-white/70"
                }`}
              >
                Preview
              </button>
            </div>
          </div>

          {activeTab === "edit" ? (
            <textarea
              rows={8}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Remember to avoid mutable default parameters when defining functions in Python..."
              className="w-full bg-white/10 dark:bg-white/5 border border-white/20 dark:border-slate-700/50 rounded-2xl p-4 text-xs font-mono text-white outline-none focus:ring-2 focus:ring-[#CCFF00] resize-none leading-relaxed placeholder:text-white/40"
            />
          ) : (
            <div className="w-full bg-white/10 dark:bg-white/5 border border-white/20 rounded-2xl p-4 min-h-[160px] text-xs leading-relaxed text-white/90 font-mono whitespace-pre-wrap">
              {notes ? notes : <span className="text-white/40 italic">No notes written yet. Switch to Edit mode.</span>}
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleSaveNotes}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                savedSuccess
                  ? "bg-emerald-500 text-white"
                  : "bg-[#CCFF00] text-black hover:scale-105"
              }`}
            >
              {savedSuccess ? <Check className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
              {savedSuccess ? "Saved Notes!" : "Save Notes"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
