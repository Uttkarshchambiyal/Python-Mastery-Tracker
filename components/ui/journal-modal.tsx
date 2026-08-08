"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { BookOpen, Sparkles, Tag, Check, Save } from "lucide-react";
import { getDailyActivity, saveJournalNote, getCompletedTopics } from "@/lib/storage";
import curriculumData from "@/data/curriculum.json";
import { CurriculumData } from "@/lib/types";

const curriculum = curriculumData as CurriculumData;

export interface JournalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date?: string; // default today
  onSaved?: () => void;
}

export function JournalModal({
  open,
  onOpenChange,
  date = new Date().toISOString().slice(0, 10),
  onSaved,
}: JournalModalProps) {
  const [noteText, setNoteText] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  // Collect all topic items for tagging
  const allTopics = curriculum.phases.flatMap((p) => p.topics);

  useEffect(() => {
    if (open) {
      const loadJournalData = async () => {
        const activityMap = await getDailyActivity();
        const current = activityMap[date];
        if (current && current.note) {
          setNoteText(current.note);
        } else {
          setNoteText("");
        }
        if (current && current.topicsCompletedToday) {
          setSelectedTopics(current.topicsCompletedToday);
        } else {
          setSelectedTopics([]);
        }
        setIsSaved(false);
      };
      loadJournalData();
    }
  }, [open, date]);

  const toggleTopicTag = (topicId: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    await saveJournalNote(date, noteText.trim(), selectedTopics);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onOpenChange(false);
      onSaved?.();
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#001A99] dark:bg-[#111a2e] border-white/20 dark:border-slate-700/50 text-white sm:max-w-lg p-6 rounded-3xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="h-5 w-5 text-[#CCFF00] dark:text-indigo-400" />
            <DialogTitle className="text-xl font-bold uppercase text-[#CCFF00] dark:text-indigo-400">
              Daily Learning Journal
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-white/70">
            Log your insights, code snippets, or reflections for <span className="font-semibold text-white">{date}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 mt-2">
          {/* Note Field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
              What did you learn or build today?
            </label>
            <textarea
              rows={5}
              required
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="e.g. Practiced list comprehensions and optimized file parsing with context managers..."
              className="w-full bg-white/10 dark:bg-white/5 border border-white/20 dark:border-slate-700/50 rounded-2xl p-4 text-xs text-white outline-none focus:ring-2 focus:ring-[#CCFF00] dark:focus:ring-[#00D4FF] focus:border-[#CCFF00] dark:focus:border-[#00D4FF] resize-none leading-relaxed"
            />
          </div>

          {/* Tag Topics Chip List */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
              <Tag className="h-3.5 w-3.5 text-[#CCFF00]" />
              Tag Curriculum Topics (Optional)
            </label>

            <div className="max-h-36 overflow-y-auto flex flex-wrap gap-1.5 p-2 bg-white/5 border border-white/10 rounded-xl">
              {allTopics.map((t) => {
                const isSelected = selectedTopics.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTopicTag(t.id)}
                    className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                      isSelected
                        ? "bg-[#CCFF00] text-black font-bold border-[#CCFF00]"
                        : "bg-white/10 text-white/70 border-white/20 hover:bg-white/20 hover:text-white"
                    }`}
                  >
                    {t.title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 rounded-full text-xs font-semibold text-white/60 hover:text-white"
            >
              Skip / Cancel
            </button>
            <button
              type="submit"
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold transition-all ${
                isSaved
                  ? "bg-emerald-500 text-white"
                  : "bg-[#CCFF00] text-black hover:scale-105"
              }`}
            >
              {isSaved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {isSaved ? "Saved!" : "Save Journal Entry"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
