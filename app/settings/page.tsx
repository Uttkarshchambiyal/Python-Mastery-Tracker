"use client";

import React, { useState, useEffect } from "react";
import { AppHeader } from "@/components/ui/app-header";
import {
  getUserSettings,
  saveUserSettings,
  resetAllStorage,
  getStudyLogDates,
  getDailyActivity,
  exportAllDataJSON,
  importDataJSON,
} from "@/lib/storage";
import { getCurrentStreak } from "@/lib/pace";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Settings,
  Save,
  RotateCcw,
  AlertTriangle,
  Check,
  Download,
  Upload,
  Moon,
  Sun,
  Bell,
  Sparkles,
} from "lucide-react";
import curriculumData from "@/data/curriculum.json";
import { CurriculumData } from "@/lib/types";

const curriculum = curriculumData as CurriculumData;

export default function SettingsPage() {
  const [dailyGoalHours, setDailyGoalHours] = useState<number>(1);
  const [targetCompletionDate, setTargetCompletionDate] = useState<string>("");
  const [theme, setTheme] = useState<"light" | "dark" | "system">("dark");
  const [reminderTime, setReminderTime] = useState<string>("19:00");
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const [studyLog, setStudyLog] = useState<string[]>([]);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const s = getUserSettings();
    setDailyGoalHours(s.dailyGoalHours || 1);
    setTargetCompletionDate(s.targetCompletionDate || "");
    setTheme(s.theme || "dark");
    setReminderTime(s.reminderTime || "19:00");
    setNotificationsEnabled(s.notificationsEnabled || false);
    setStudyLog(getStudyLogDates());
    setIsLoaded(true);
  }, []);

  const streak = getCurrentStreak(studyLog);

  const handleSave = () => {
    saveUserSettings({
      dailyGoalHours,
      startDate: getUserSettings().startDate || new Date().toISOString().slice(0, 10),
      targetCompletionDate: targetCompletionDate || undefined,
      theme,
      reminderTime,
      notificationsEnabled,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleEnableNotifications = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotificationsEnabled(true);
        saveUserSettings({ notificationsEnabled: true });
        new Notification("Python Mastery Tracker", {
          body: "Notifications enabled! We will remind you to keep your streak alive. 🐍",
        });
      } else {
        alert("Notification permission was denied in browser settings.");
      }
    }
  };

  const handleExportBackup = () => {
    const jsonStr = exportAllDataJSON();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `python-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDataJSON(content);
        if (success) {
          alert("Backup data restored successfully! Reloading page...");
          window.location.reload();
        } else {
          alert("Invalid backup file format. Restore failed.");
        }
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    resetAllStorage();
    setConfirmResetOpen(false);
    window.location.href = "/dashboard";
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-[#0038FF] dark:bg-[#02040A] text-white selection:bg-[#CCFF00] selection:text-black font-sans transition-colors duration-300">
      <AppHeader streak={streak.current} />

      <main className="max-w-3xl mx-auto px-6 py-8 md:py-12 space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#CCFF00] dark:text-[#00D4FF]">
            PREFERENCES & CONFIG
          </span>
          <h1
            className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white mt-1 dark:[text-shadow:0_2px_10px_rgba(0,56,255,0.4)]"
            style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}
          >
            TRACKER SETTINGS
          </h1>
        </div>

        {/* Form Card */}
        <div className="bg-white/10 dark:bg-[#0038FF]/[0.02] backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2rem] p-6 md:p-8 space-y-6">
          {/* Theme Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
              Appearance Theme
            </label>
            <div className="flex items-center gap-3">
              {(["dark", "light", "system"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold capitalize transition-all ${
                    theme === t
                      ? "bg-[#CCFF00] text-black dark:bg-[#00D4FF] dark:text-black shadow-lg"
                      : "bg-white/10 dark:bg-white/5 text-white hover:bg-white/20 dark:hover:bg-white/10"
                  }`}
                >
                  {t === "dark" ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Daily Goal Hours */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
              Daily Goal (Hours/Day)
            </label>
            <div className="flex items-center gap-3">
              {[0.5, 1, 2, 3].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setDailyGoalHours(val)}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                    dailyGoalHours === val
                      ? "bg-[#CCFF00] text-black dark:bg-[#00D4FF] dark:text-black shadow-lg"
                      : "bg-white/10 dark:bg-white/5 text-white hover:bg-white/20 dark:hover:bg-white/10"
                  }`}
                >
                  {val} hr{val > 1 ? "s" : ""}
                </button>
              ))}
            </div>
          </div>

          {/* Target Completion Date */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
              Target Completion Date (Optional)
            </label>
            <input
              type="date"
              value={targetCompletionDate}
              onChange={(e) => setTargetCompletionDate(e.target.value)}
              className="bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/15 text-white rounded-2xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#00D4FF] w-full md:w-auto"
            />
          </div>

          {/* Reminders & Browser Notifications */}
          <div className="pt-4 border-t border-white/10 dark:border-white/10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-white block">
                  Daily Study Reminder
                </span>
                <span className="text-[11px] text-white/50">
                  Receive browser notifications if you haven&apos;t logged study time by reminder hour.
                </span>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/15 text-white rounded-xl px-3 py-1.5 text-xs outline-none"
                />

                <button
                  type="button"
                  onClick={handleEnableNotifications}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    notificationsEnabled
                      ? "bg-emerald-500 text-white"
                      : "bg-[#CCFF00] dark:bg-[#00D4FF] text-black hover:scale-105"
                  }`}
                >
                  <Bell className="h-3.5 w-3.5" />
                  {notificationsEnabled ? "Enabled ✓" : "Enable Push"}
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-white/10 dark:border-white/10 flex items-center justify-between">
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold transition-all ${
                savedSuccess
                  ? "bg-emerald-500 text-white"
                  : "bg-[#CCFF00] dark:bg-[#00D4FF] text-black hover:scale-105"
              }`}
            >
              {savedSuccess ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {savedSuccess ? "Saved Successfully!" : "Save Settings"}
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════
            DATA PORTABILITY: BACKUP & RESTORE
            ═══════════════════════════════════ */}
        <div className="bg-white/10 dark:bg-[#0038FF]/[0.02] backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2rem] p-6 md:p-8 space-y-4">
          <div>
            <h3 className="text-sm font-bold uppercase text-[#CCFF00] dark:text-[#00D4FF]">
              Data Portability (Backup & Restore)
            </h3>
            <p className="text-xs text-white/60 dark:text-white/70 mt-1">
              Export your full progress, topics, projects, notes, and study logs into a JSON file to transfer between browsers or devices.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={handleExportBackup}
              className="flex items-center gap-2 bg-[#CCFF00] dark:bg-[#00D4FF] text-black font-bold text-xs px-5 py-2.5 rounded-full hover:scale-105 transition-transform"
            >
              <Download className="h-4 w-4" />
              Export Full Backup (.JSON)
            </button>

            <label className="flex items-center gap-2 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/15 text-white font-semibold text-xs px-5 py-2.5 rounded-full cursor-pointer hover:bg-white/20 dark:hover:bg-white/10 transition-colors">
              <Upload className="h-4 w-4 text-[#CCFF00] dark:text-[#00D4FF]" />
              Import Backup (.JSON)
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Reset Danger Zone */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="font-bold text-sm uppercase">Reset All Progress</h3>
            </div>
            <p className="text-xs text-white/60 mt-1">
              Erases completed topics, project statuses, study log, and streaks stored in this browser.
            </p>
          </div>

          <button
            onClick={() => setConfirmResetOpen(true)}
            className="shrink-0 flex items-center gap-2 bg-red-500/20 border border-red-500/50 text-red-300 font-bold text-xs px-5 py-2.5 rounded-full hover:bg-red-500/30 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Progress
          </button>
        </div>
      </main>

      {/* Confirm Reset Dialog */}
      <Dialog open={confirmResetOpen} onOpenChange={setConfirmResetOpen}>
        <DialogContent className="bg-[#001A99] border-red-500/50 text-white sm:max-w-md p-6 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold uppercase text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Confirm Reset
            </DialogTitle>
            <DialogDescription className="text-xs text-white/70 mt-2">
              Are you sure you want to reset all your progress data? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setConfirmResetOpen(false)}
              className="px-4 py-2 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-white"
            >
              Cancel
            </button>

            <button
              onClick={handleReset}
              className="px-5 py-2 rounded-full text-xs font-bold bg-red-500 text-white hover:bg-red-600"
            >
              Yes, Erase Everything
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
