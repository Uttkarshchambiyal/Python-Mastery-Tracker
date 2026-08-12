"use client";

export type ProjectStatusType = "not-started" | "in-progress" | "completed";

export interface ProjectState {
  status: ProjectStatusType;
  completedAt?: string;
}

export interface UserSettings {
  dailyGoalHours: number;
  startDate: string;
  targetCompletionDate?: string;
  theme: "light" | "dark" | "system";
  reminderTime?: string;
  notificationsEnabled: boolean;
}

export interface DailyActivityRecord {
  minutesStudied: number;
  timerMode?: "stopwatch" | "pomodoro";
  topicsCompletedToday: string[];
  note?: string;
  noteUpdatedAt?: string;
}

export interface StreakFreezeState {
  available: number;
  usedOn: string[];
}

export interface ActiveTimerSession {
  mode: "stopwatch" | "pomodoro";
  startedAt: string;
  accumulatedSeconds: number;
  status: "running" | "paused";
  pomodoroPhase?: "work" | "break";
  cyclesCompleted?: number;
}

export interface TopicDetailState {
  status: "not-started" | "in-progress" | "completed";
  completedAt?: string;
  notes?: string;
  nextReviewDate?: string;
}

export interface UnlockedBadge {
  badgeId: string;
  unlockedAt: string;
}

export interface FullUserDataPayload {
  completedTopics: Record<string, string>;
  projectStatus: Record<string, ProjectState>;
  dailyActivity: Record<string, DailyActivityRecord>;
  topicState: Record<string, TopicDetailState>;
  badges: UnlockedBadge[];
  settings: UserSettings;
  streakFreezes: StreakFreezeState;
  activeTimer: ActiveTimerSession | null;
  studyLog: string[];
}

const API_BASE_URL = "http://localhost:8000/api";

const DEFAULT_SETTINGS: UserSettings = {
  dailyGoalHours: 1,
  startDate: new Date().toISOString().slice(0, 10),
  targetCompletionDate: undefined,
  theme: "light",
  reminderTime: "19:00",
  notificationsEnabled: false,
};

const DEFAULT_FREEZES: StreakFreezeState = {
  available: 1,
  usedOn: [],
};

const STORAGE_KEYS = {
  COMPLETED_TOPICS: "pmt_completed_topics_map",
  PROJECT_STATUS: "pmt_project_status_map",
  STUDY_LOG: "pmt_study_log_dates",
  DAILY_ACTIVITY: "pmt_daily_activity_map",
  STREAK_FREEZES: "pmt_streak_freezes_v2",
  ACTIVE_TIMER: "pmt_active_timer_session",
  TOPIC_STATE: "pmt_topic_detail_state_map",
  BADGES: "pmt_unlocked_badges_map",
  SETTINGS: "pmt_user_settings",
};

/* Helper for localStorage reads */
function getStorageItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

/* Helper for localStorage writes */
function setStorageItem<T>(key: string, val: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    /* fail silently */
  }
}

/* Reads full local storage state */
function getLocalFullState(): FullUserDataPayload {
  const activityMap = getStorageItem<Record<string, DailyActivityRecord>>(STORAGE_KEYS.DAILY_ACTIVITY, {});
  const activeDates = Object.keys(activityMap).filter(
    (d) =>
      activityMap[d].minutesStudied > 0 ||
      activityMap[d].topicsCompletedToday?.length > 0 ||
      (activityMap[d].note && activityMap[d].note!.trim().length > 0)
  ).sort();

  return {
    completedTopics: getStorageItem<Record<string, string>>(STORAGE_KEYS.COMPLETED_TOPICS, {}),
    projectStatus: getStorageItem<Record<string, ProjectState>>(STORAGE_KEYS.PROJECT_STATUS, {}),
    dailyActivity: activityMap,
    topicState: getStorageItem<Record<string, TopicDetailState>>(STORAGE_KEYS.TOPIC_STATE, {}),
    badges: getStorageItem<UnlockedBadge[]>(STORAGE_KEYS.BADGES, []),
    settings: { ...DEFAULT_SETTINGS, ...getStorageItem<UserSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS) },
    streakFreezes: getStorageItem<StreakFreezeState>(STORAGE_KEYS.STREAK_FREEZES, DEFAULT_FREEZES),
    activeTimer: getStorageItem<ActiveTimerSession | null>(STORAGE_KEYS.ACTIVE_TIMER, null),
    studyLog: activeDates,
  };
}

/* Saves full state payload into localStorage cache */
function setLocalFullState(data: Partial<FullUserDataPayload>): void {
  if (data.completedTopics !== undefined) setStorageItem(STORAGE_KEYS.COMPLETED_TOPICS, data.completedTopics);
  if (data.projectStatus !== undefined) setStorageItem(STORAGE_KEYS.PROJECT_STATUS, data.projectStatus);
  if (data.dailyActivity !== undefined) setStorageItem(STORAGE_KEYS.DAILY_ACTIVITY, data.dailyActivity);
  if (data.topicState !== undefined) setStorageItem(STORAGE_KEYS.TOPIC_STATE, data.topicState);
  if (data.badges !== undefined) setStorageItem(STORAGE_KEYS.BADGES, data.badges);
  if (data.settings !== undefined) setStorageItem(STORAGE_KEYS.SETTINGS, data.settings);
  if (data.streakFreezes !== undefined) setStorageItem(STORAGE_KEYS.STREAK_FREEZES, data.streakFreezes);
  if (data.activeTimer !== undefined) {
    if (data.activeTimer === null) {
      if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEYS.ACTIVE_TIMER);
    } else {
      setStorageItem(STORAGE_KEYS.ACTIVE_TIMER, data.activeTimer);
    }
  }
  if (data.studyLog !== undefined) setStorageItem(STORAGE_KEYS.STUDY_LOG, data.studyLog);
}

import { createClient } from "@/lib/supabase/client";

/**
 * Attempts to fetch progress from Supabase cloud database if user is authenticated.
 */
async function fetchFromSupabase(): Promise<FullUserDataPayload | null> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error || !data) return null;

    const payload: Partial<FullUserDataPayload> = {
      completedTopics: data.completed_topics || {},
      projectStatus: data.project_status || {},
      dailyActivity: data.daily_activity || {},
      topicState: data.topic_state || {},
      badges: data.badges || [],
      settings: { ...DEFAULT_SETTINGS, ...(data.settings || {}) },
      streakFreezes: { ...DEFAULT_FREEZES, ...(data.streak_freezes || {}) },
    };

    setLocalFullState(payload);
    return getLocalFullState();
  } catch (err) {
    return null;
  }
}

/**
 * Attempts to push progress payload to Supabase cloud database if user is authenticated.
 */
async function syncToSupabase(payload: FullUserDataPayload): Promise<void> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("user_progress").upsert({
      user_id: user.id,
      completed_topics: payload.completedTopics,
      project_status: payload.projectStatus,
      daily_activity: payload.dailyActivity,
      topic_state: payload.topicState,
      badges: payload.badges,
      settings: payload.settings,
      streak_freezes: payload.streakFreezes,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    /* fail silently, local cache preserved */
  }
}

/* ═══════════════════════════════════════════════════════════
   ASYNC API BRIDGE: fetchData & syncData WITH SUPABASE & LOCALSTORAGE
   ═══════════════════════════════════════════════════════════ */

/**
 * Fetches user progress data. Priorities:
 * 1. Supabase Cloud DB (if logged in)
 * 2. FastAPI backend (if running locally)
 * 3. localStorage cache fallback
 */
export async function fetchData(): Promise<FullUserDataPayload> {
  // First priority: Supabase user cloud data
  const cloudData = await fetchFromSupabase();
  if (cloudData) return cloudData;

  // Second priority: FastAPI backend
  try {
    const res = await fetch(`${API_BASE_URL}/data`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    setLocalFullState(data);
    return getLocalFullState();
  } catch (error) {
    return getLocalFullState();
  }
}

/**
 * Syncs user progress payload to local storage, FastAPI backend, and Supabase cloud.
 */
export async function syncData(payload?: Partial<FullUserDataPayload>): Promise<FullUserDataPayload> {
  if (payload) {
    setLocalFullState(payload);
  }
  const currentFullState = getLocalFullState();

  // Async sync to Supabase Cloud DB
  syncToSupabase(currentFullState);

  // Async sync to local FastAPI backend
  try {
    await fetch(`${API_BASE_URL}/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(currentFullState),
    });
  } catch (error) {
    /* fail silently, saved locally and synced to Supabase */
  }

  return currentFullState;
}

/* ═══════════════════════════════════════════════════════════
   ASYNC DATA OPERATIONS
   ═══════════════════════════════════════════════════════════ */

export async function getCompletedTopics(): Promise<Record<string, string>> {
  const fullData = await fetchData();
  return fullData.completedTopics;
}

export async function saveCompletedTopics(data: Record<string, string>): Promise<Record<string, string>> {
  await syncData({ completedTopics: data });
  return data;
}

export async function getTopicDetailStates(): Promise<Record<string, TopicDetailState>> {
  const fullData = await fetchData();
  return fullData.topicState;
}

export async function saveTopicDetailStates(data: Record<string, TopicDetailState>): Promise<Record<string, TopicDetailState>> {
  await syncData({ topicState: data });
  return data;
}

export async function setTopicNotesAndSRS(
  topicId: string,
  updates: { notes?: string; nextReviewDate?: string | null; status?: "not-started" | "in-progress" | "completed" }
): Promise<Record<string, TopicDetailState>> {
  const currentMap = getStorageItem<Record<string, TopicDetailState>>(STORAGE_KEYS.TOPIC_STATE, {});
  const current = currentMap[topicId] || { status: "not-started" };

  const updated: TopicDetailState = {
    ...current,
    status: updates.status || current.status,
    notes: updates.notes !== undefined ? updates.notes : current.notes,
    nextReviewDate:
      updates.nextReviewDate === null
        ? undefined
        : updates.nextReviewDate !== undefined
          ? updates.nextReviewDate
          : current.nextReviewDate,
  };

  currentMap[topicId] = updated;
  await syncData({ topicState: currentMap });
  return currentMap;
}

export async function toggleTopicCompleted(topicId: string): Promise<{
  completedTopics: Record<string, string>;
  studyLog: string[];
  isCompleted: boolean;
}> {
  const topics = getStorageItem<Record<string, string>>(STORAGE_KEYS.COMPLETED_TOPICS, {});
  const today = new Date().toISOString().slice(0, 10);
  const isCompleted = !topics[topicId];

  if (isCompleted) {
    topics[topicId] = new Date().toISOString();
  } else {
    delete topics[topicId];
  }

  // Update topicDetailStates
  const detailMap = getStorageItem<Record<string, TopicDetailState>>(STORAGE_KEYS.TOPIC_STATE, {});
  detailMap[topicId] = {
    ...(detailMap[topicId] || {}),
    status: isCompleted ? "completed" : "not-started",
    completedAt: isCompleted ? new Date().toISOString() : undefined,
  };

  // Update daily activity
  const activityMap = getStorageItem<Record<string, DailyActivityRecord>>(STORAGE_KEYS.DAILY_ACTIVITY, {});
  const todayRecord: DailyActivityRecord = activityMap[today] || {
    minutesStudied: 0,
    topicsCompletedToday: [],
  };

  let updatedTopicsToday = [...(todayRecord.topicsCompletedToday || [])];
  if (isCompleted) {
    if (!updatedTopicsToday.includes(topicId)) {
      updatedTopicsToday.push(topicId);
    }
  } else {
    updatedTopicsToday = updatedTopicsToday.filter((id) => id !== topicId);
  }

  activityMap[today] = {
    ...todayRecord,
    topicsCompletedToday: updatedTopicsToday,
  };

  const activeDates = Object.keys(activityMap).filter(
    (d) =>
      activityMap[d].minutesStudied > 0 ||
      activityMap[d].topicsCompletedToday?.length > 0 ||
      (activityMap[d].note && activityMap[d].note!.trim().length > 0)
  ).sort();

  await syncData({
    completedTopics: topics,
    topicState: detailMap,
    dailyActivity: activityMap,
    studyLog: activeDates,
  });

  return {
    completedTopics: topics,
    studyLog: activeDates,
    isCompleted,
  };
}

export async function getProjectStatuses(): Promise<Record<string, ProjectState>> {
  const fullData = await fetchData();
  return fullData.projectStatus;
}

export async function saveProjectStatuses(data: Record<string, ProjectState>): Promise<Record<string, ProjectState>> {
  await syncData({ projectStatus: data });
  return data;
}

export async function setProjectStatus(
  projectId: string,
  status: ProjectStatusType
): Promise<{ projectStatus: Record<string, ProjectState>; studyLog: string[] }> {
  const statuses = getStorageItem<Record<string, ProjectState>>(STORAGE_KEYS.PROJECT_STATUS, {});
  const today = new Date().toISOString().slice(0, 10);

  statuses[projectId] = {
    status,
    completedAt: status === "completed" ? new Date().toISOString() : undefined,
  };

  const activityMap = getStorageItem<Record<string, DailyActivityRecord>>(STORAGE_KEYS.DAILY_ACTIVITY, {});
  if (!activityMap[today]) {
    activityMap[today] = {
      minutesStudied: 0,
      topicsCompletedToday: [],
    };
  }

  const activeDates = Object.keys(activityMap).filter(
    (d) =>
      activityMap[d].minutesStudied > 0 ||
      activityMap[d].topicsCompletedToday?.length > 0 ||
      (activityMap[d].note && activityMap[d].note!.trim().length > 0)
  ).sort();

  await syncData({
    projectStatus: statuses,
    dailyActivity: activityMap,
    studyLog: activeDates,
  });

  return { projectStatus: statuses, studyLog: activeDates };
}

export async function getDailyActivity(): Promise<Record<string, DailyActivityRecord>> {
  const fullData = await fetchData();
  return fullData.dailyActivity;
}

export async function saveDailyActivity(data: Record<string, DailyActivityRecord>): Promise<Record<string, DailyActivityRecord>> {
  const activeDates = Object.keys(data).filter(
    (d) =>
      data[d].minutesStudied > 0 ||
      data[d].topicsCompletedToday?.length > 0 ||
      (data[d].note && data[d].note!.trim().length > 0)
  ).sort();

  await syncData({ dailyActivity: data, studyLog: activeDates });
  return data;
}

export async function logStudyMinutes(
  date: string,
  minutes: number,
  mode?: "stopwatch" | "pomodoro"
): Promise<Record<string, DailyActivityRecord>> {
  const activityMap = getStorageItem<Record<string, DailyActivityRecord>>(STORAGE_KEYS.DAILY_ACTIVITY, {});
  const current = activityMap[date] || {
    minutesStudied: 0,
    topicsCompletedToday: [],
  };

  activityMap[date] = {
    ...current,
    minutesStudied: current.minutesStudied + Math.max(0, minutes),
    timerMode: mode || current.timerMode,
  };

  return await saveDailyActivity(activityMap);
}

export async function saveJournalNote(
  date: string,
  noteText: string,
  taggedTopicIds?: string[]
): Promise<Record<string, DailyActivityRecord>> {
  const activityMap = getStorageItem<Record<string, DailyActivityRecord>>(STORAGE_KEYS.DAILY_ACTIVITY, {});
  const current = activityMap[date] || {
    minutesStudied: 0,
    topicsCompletedToday: [],
  };

  const updatedTopics = taggedTopicIds
    ? Array.from(new Set([...(current.topicsCompletedToday || []), ...taggedTopicIds]))
    : current.topicsCompletedToday || [];

  activityMap[date] = {
    ...current,
    note: noteText,
    noteUpdatedAt: new Date().toISOString(),
    topicsCompletedToday: updatedTopics,
  };

  return await saveDailyActivity(activityMap);
}

export async function getStudyLogDates(): Promise<string[]> {
  const fullData = await fetchData();
  return fullData.studyLog;
}

export const getStudyLog = getStudyLogDates;

export async function getStreakFreezes(): Promise<StreakFreezeState> {
  const fullData = await fetchData();
  return fullData.streakFreezes;
}

export async function saveStreakFreezes(freezes: StreakFreezeState): Promise<StreakFreezeState> {
  await syncData({ streakFreezes: freezes });
  return freezes;
}

export async function getUnlockedBadges(): Promise<UnlockedBadge[]> {
  const fullData = await fetchData();
  return fullData.badges;
}

export async function unlockBadge(badgeId: string): Promise<UnlockedBadge[]> {
  const badges = getStorageItem<UnlockedBadge[]>(STORAGE_KEYS.BADGES, []);
  if (!badges.some((b) => b.badgeId === badgeId)) {
    const updated = [...badges, { badgeId, unlockedAt: new Date().toISOString() }];
    await syncData({ badges: updated });
    return updated;
  }
  return badges;
}

export async function getActiveTimerSession(): Promise<ActiveTimerSession | null> {
  const fullData = await fetchData();
  return fullData.activeTimer;
}

export async function saveActiveTimerSession(session: ActiveTimerSession | null): Promise<ActiveTimerSession | null> {
  await syncData({ activeTimer: session });
  return session;
}

export async function getUserSettings(): Promise<UserSettings> {
  const fullData = await fetchData();
  return { ...DEFAULT_SETTINGS, ...fullData.settings };
}

export async function saveUserSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
  const current = getStorageItem<UserSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  const updated = { ...DEFAULT_SETTINGS, ...current, ...settings };

  // Apply dark mode class to html document
  if (typeof window !== "undefined") {
    if (updated.theme === "dark" || (updated.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  await syncData({ settings: updated });
  return updated;
}

export function exportAllDataJSON(): string {
  if (typeof window === "undefined") return "{}";
  const exportObject = getLocalFullState();
  return JSON.stringify(exportObject, null, 2);
}

export async function importDataJSON(jsonString: string): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const parsed = JSON.parse(jsonString);
    if (typeof parsed !== "object" || parsed === null) return false;

    await syncData(parsed);
    return true;
  } catch {
    return false;
  }
}

export async function resetAllStorage(): Promise<void> {
  const emptyState: FullUserDataPayload = {
    completedTopics: {},
    projectStatus: {},
    dailyActivity: {},
    topicState: {},
    badges: [],
    settings: DEFAULT_SETTINGS,
    streakFreezes: DEFAULT_FREEZES,
    activeTimer: null,
    studyLog: [],
  };

  if (typeof window !== "undefined") {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
    localStorage.removeItem("pmt_checked_topics");
    localStorage.removeItem("pmt_completed_projects");
    localStorage.removeItem("ag_streak_current");
  }

  await syncData(emptyState);
}
