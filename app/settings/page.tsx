"use client";

import React, { useState, useEffect } from "react";
import { AppHeader } from "@/components/ui/app-header";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useAuth } from "@/components/auth-provider";
import {
  fetchData,
  saveUserSettings,
  resetAllStorage,
  exportAllDataJSON,
  importDataJSON,
  UserSettings,
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
  User,
  Image as ImageIcon,
  Camera,
  ShieldCheck,
  Mail,
  UploadCloud,
} from "lucide-react";
import { useTheme } from "next-themes";
import curriculumData from "@/data/curriculum.json";
import { CurriculumData } from "@/lib/types";

const curriculum = curriculumData as CurriculumData;

const AVATAR_PRESETS = [
  { id: "vector", label: "Vector Dev", url: "/avatar-vector.png" },
  { id: "pixel", label: "Pixel Art", url: "/avatar-pixel.jpg" },
  { id: "dicebear1", label: "Cyberpunk", url: "https://api.dicebear.com/7.x/bottts/svg?seed=python" },
  { id: "dicebear2", label: "Coder", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=antigravity" },
];

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const { setTheme: setNextTheme, theme: currentNextTheme } = useTheme();
  
  // Profile State
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [imgError, setImgError] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSavedSuccess, setProfileSavedSuccess] = useState(false);

  // Settings State
  const [dailyGoalHours, setDailyGoalHours] = useState<number>(1);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [targetCompletionDate, setTargetCompletionDate] = useState<string>("");
  const [theme, setThemeState] = useState<"light" | "dark" | "system">("dark");
  const [reminderTime, setReminderTime] = useState<string>("19:00");
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const [studyLog, setStudyLog] = useState<string[]>([]);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const setTheme = (t: "light" | "dark" | "system") => {
    setThemeState(t);
    setNextTheme(t);
  };

  const loadData = async () => {
    const data = await fetchData();
    const s = data.settings;
    setDailyGoalHours(s.dailyGoalHours || 1);
    setStartDate(s.startDate || new Date().toISOString().slice(0, 10));
    setTargetCompletionDate(s.targetCompletionDate || "");
    const activeTheme = s.theme || "dark";
    setThemeState(activeTheme);
    setNextTheme(activeTheme);
    setReminderTime(s.reminderTime || "19:00");
    setNotificationsEnabled(s.notificationsEnabled || false);
    setStudyLog(data.studyLog || []);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name || user.email?.split("@")[0] || "");
      setAvatarUrl(user.user_metadata?.avatar_url || "");
    }
  }, [user]);

  const streak = getCurrentStreak(studyLog);

  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image file size should be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setImgError(false);
        setAvatarUrl(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    const { error } = await updateProfile({
      full_name: fullName.trim(),
      avatar_url: avatarUrl.trim(),
    });
    setProfileSaving(false);
    if (error) {
      alert(`Profile update error: ${error.message}`);
    } else {
      setProfileSavedSuccess(true);
      setTimeout(() => setProfileSavedSuccess(false), 2500);
    }
  };

  const handleSave = async () => {
    await saveUserSettings({
      dailyGoalHours,
      startDate: startDate || new Date().toISOString().slice(0, 10),
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
        await saveUserSettings({ notificationsEnabled: true });
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
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = await importDataJSON(content);
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

  const handleReset = async () => {
    await resetAllStorage();
    setConfirmResetOpen(false);
    window.location.href = "/dashboard";
  };

  if (isLoading) {
    return <LoadingScreen message="Loading Preferences & Config..." />;
  }

  return (
    <div className="min-h-screen bg-transparent dark:bg-transparent text-white selection:bg-[#CCFF00] selection:text-black font-sans transition-colors duration-300">
      <AppHeader streak={streak.current} />

      <main className="max-w-3xl mx-auto px-6 py-8 md:py-12 space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#CCFF00] dark:text-indigo-400">
            PROFILE & PREFERENCES
          </span>
          <h1
            className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white mt-1 dark:[text-shadow:0_2px_10px_rgba(0,56,255,0.4)]"
            style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}
          >
            USER PROFILE & SETTINGS
          </h1>
        </div>

        {/* ═══════════════════════════════════
            CARD 1: USER PROFILE MANAGEMENT
            ═══════════════════════════════════ */}
        <div id="profile" className="bg-white/15 backdrop-blur-xl border border-white/30 dark:bg-[#0C101D] dark:border-[#6A5AE0]/35 rounded-[2rem] p-6 md:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-[#CCFF00] dark:text-indigo-400" />
              <h3 className="text-lg font-bold uppercase text-white">
                Account & Profile Information
              </h3>
            </div>
            {user && (
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full text-xs font-bold">
                <ShieldCheck className="h-3.5 w-3.5" /> Authenticated
              </span>
            )}
          </div>

          {/* Profile Photo Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl bg-[#121829] border border-white/10">
            {/* Avatar Preview */}
            <div className="relative shrink-0 group">
              <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-[#00D4FF] shadow-[0_0_25px_rgba(129,140,248,0.4)] bg-[#001A99] flex items-center justify-center relative">
                {avatarUrl && !imgError ? (
                  <img
                    src={avatarUrl}
                    alt=""
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-black text-[#CCFF00]">
                    {(fullName || user?.email || "U").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Upload Overlay Icon */}
              <label
                htmlFor="avatar-file-input"
                title="Upload custom image file"
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-full flex items-center justify-center cursor-pointer transition-opacity text-white"
              >
                <Camera className="h-6 w-6 text-[#CCFF00]" />
              </label>
              <input
                id="avatar-file-input"
                type="file"
                accept="image/*"
                onChange={handleAvatarFileSelect}
                className="hidden"
              />
            </div>

            {/* Avatar Preset & Upload Controls */}
            <div className="space-y-3 flex-1 w-full">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-white/70">
                  Profile Avatar Picture
                </label>

                {/* Upload File Button */}
                <label
                  htmlFor="avatar-file-button"
                  className="flex items-center gap-1.5 bg-[#CCFF00] dark:bg-indigo-500 text-black font-bold text-[11px] px-3 py-1 rounded-full cursor-pointer hover:scale-105 transition-transform"
                >
                  <UploadCloud className="h-3.5 w-3.5" />
                  Upload Local Photo
                  <input
                    id="avatar-file-button"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileSelect}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex flex-wrap gap-2">
                {AVATAR_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setImgError(false);
                      setAvatarUrl(preset.url);
                    }}
                    className={`text-xs px-3 py-1.5 rounded-full font-semibold border transition-all flex items-center gap-1.5 ${
                      avatarUrl === preset.url
                        ? "bg-[#CCFF00] text-black border-[#CCFF00] font-bold shadow-md"
                        : "bg-[#0C101D] text-white/80 border-white/15 hover:bg-white/20"
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.label}
                      referrerPolicy="no-referrer"
                      className="h-4 w-4 rounded-full object-cover"
                    />
                    {preset.label}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-white/60 mb-1">
                  Or Image Web URL (e.g. Google / Unsplash)
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => {
                    setImgError(false);
                    setAvatarUrl(e.target.value);
                  }}
                  placeholder="https://example.com/my-photo.jpg"
                  className="bg-[#0C101D] dark:bg-[#121829] border border-white/20 text-white rounded-xl px-3.5 py-2 text-xs outline-none focus:ring-2 focus:ring-[#00D4FF] w-full"
                />
              </div>
            </div>
          </div>

          {/* Full Name & Email Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
                Display Name / Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Uttkarsh Chambiyal"
                className="bg-[#0C101D] dark:bg-[#121829] border border-white/20 text-white rounded-2xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#00D4FF] w-full font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
                Account Email (Primary Identity)
              </label>
              <div className="flex items-center gap-2 bg-[#121829] border border-white/15 rounded-2xl px-4 py-3 text-xs text-white/70 font-mono">
                <Mail className="h-4 w-4 text-[#CCFF00]" />
                <span className="truncate">{user?.email || "Guest User (Not logged in)"}</span>
              </div>
            </div>
          </div>

          {/* Save Profile Button */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSaveProfile}
              disabled={profileSaving}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold transition-all ${
                profileSavedSuccess
                  ? "bg-emerald-500 text-white"
                  : "bg-[#CCFF00] dark:bg-indigo-500 text-black hover:scale-105"
              }`}
            >
              {profileSavedSuccess ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {profileSavedSuccess ? "Profile Updated ✓" : profileSaving ? "Saving..." : "Save Profile Details"}
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════
            CARD 2: TRACKER PREFERENCES FORM
            ═══════════════════════════════════ */}
        <div className="bg-white/15 backdrop-blur-xl border border-white/30 dark:bg-[#0C101D] dark:border-[#6A5AE0]/35 rounded-[2rem] p-6 md:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-2 border-b border-white/10 pb-4">
            <Settings className="h-5 w-5 text-[#CCFF00] dark:text-indigo-400" />
            <h3 className="text-lg font-bold uppercase text-white">
              Tracker Preferences
            </h3>
          </div>

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
                      ? "bg-[#CCFF00] text-black dark:bg-indigo-500 dark:text-black shadow-lg"
                      : "bg-[#0C101D] dark:bg-[#121829] text-white hover:bg-white/20 dark:hover:bg-[#0C101D]"
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
                      ? "bg-[#CCFF00] text-black dark:bg-indigo-500 dark:text-black shadow-lg"
                      : "bg-[#0C101D] dark:bg-[#121829] text-white hover:bg-white/20 dark:hover:bg-[#0C101D]"
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
              className="bg-[#0C101D] dark:bg-[#121829] border border-white/20 dark:border-slate-700/50 text-white rounded-2xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#00D4FF] w-full md:w-auto"
            />
          </div>

          {/* Reminders & Browser Notifications */}
          <div className="pt-4 border-t border-white/10 dark:border-[#6A5AE0]/35">
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
                  className="bg-[#0C101D] dark:bg-[#121829] border border-white/20 dark:border-slate-700/50 text-white rounded-xl px-3 py-1.5 text-xs outline-none"
                />

                <button
                  type="button"
                  onClick={handleEnableNotifications}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    notificationsEnabled
                      ? "bg-emerald-500 text-white"
                      : "bg-[#CCFF00] dark:bg-indigo-500 text-black hover:scale-105"
                  }`}
                >
                  <Bell className="h-3.5 w-3.5" />
                  {notificationsEnabled ? "Enabled ✓" : "Enable Push"}
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-white/10 dark:border-[#6A5AE0]/35 flex items-center justify-between">
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold transition-all ${
                savedSuccess
                  ? "bg-emerald-500 text-white"
                  : "bg-[#CCFF00] dark:bg-indigo-500 text-black hover:scale-105"
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
        <div className="bg-white/15 backdrop-blur-xl border border-white/30 dark:bg-[#0C101D] dark:border-[#6A5AE0]/35 rounded-[2rem] p-6 md:p-8 space-y-4 shadow-xl">
          <div>
            <h3 className="text-sm font-bold uppercase text-[#CCFF00] dark:text-indigo-400">
              Data Portability (Backup & Restore)
            </h3>
            <p className="text-xs text-white/60 dark:text-white/70 mt-1">
              Export your full progress, topics, projects, notes, and study logs into a JSON file to transfer between browsers or devices.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={handleExportBackup}
              className="flex items-center gap-2 bg-[#CCFF00] dark:bg-indigo-500 text-black font-bold text-xs px-5 py-2.5 rounded-full hover:scale-105 transition-transform"
            >
              <Download className="h-4 w-4" />
              Export Full Backup (.JSON)
            </button>

            <label className="flex items-center gap-2 bg-[#0C101D] dark:bg-[#121829] border border-white/20 dark:border-slate-700/50 text-white font-semibold text-xs px-5 py-2.5 rounded-full cursor-pointer hover:bg-white/20 dark:hover:bg-[#0C101D] transition-colors">
              <Upload className="h-4 w-4 text-[#CCFF00] dark:text-indigo-400" />
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
              className="px-4 py-2 rounded-full text-xs font-semibold bg-[#0C101D] hover:bg-white/20 text-white"
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
