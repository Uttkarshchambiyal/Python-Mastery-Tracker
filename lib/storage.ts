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

const DEFAULT_SETTINGS: UserSettings = {
  dailyGoalHours: 1,
  startDate: new Date().toISOString().slice(0, 10),
  targetCompletionDate: undefined,
  theme: "dark",
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

function getStorageItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setStorageItem<T>(key: string, val: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    /* fail silently */
  }
}

/* ═══════════════════════════════════════════════════════════
   COMPLETED TOPICS & TOPIC DETAILS (SRS & NOTES)
   ═══════════════════════════════════════════════════════════ */

export function getCompletedTopics(): Record<string, string> {
  return getStorageItem<Record<string, string>>(STORAGE_KEYS.COMPLETED_TOPICS, {});
}

export function saveCompletedTopics(data: Record<string, string>): void {
  setStorageItem(STORAGE_KEYS.COMPLETED_TOPICS, data);
}

export function getTopicDetailStates(): Record<string, TopicDetailState> {
  return getStorageItem<Record<string, TopicDetailState>>(STORAGE_KEYS.TOPIC_STATE, {});
}

export function saveTopicDetailStates(data: Record<string, TopicDetailState>): void {
  setStorageItem(STORAGE_KEYS.TOPIC_STATE, data);
}

export function setTopicNotesAndSRS(
  topicId: string,
  updates: { notes?: string; nextReviewDate?: string | null; status?: "not-started" | "in-progress" | "completed" }
): Record<string, TopicDetailState> {
  const map = getTopicDetailStates();
  const current = map[topicId] || { status: "not-started" };

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

  map[topicId] = updated;
  saveTopicDetailStates(map);
  return map;
}

export function toggleTopicCompleted(topicId: string): {
  completedTopics: Record<string, string>;
  studyLog: string[];
  isCompleted: boolean;
} {
  const topics = getCompletedTopics();
  const today = new Date().toISOString().slice(0, 10);
  const isCompleted = !topics[topicId];

  if (isCompleted) {
    topics[topicId] = new Date().toISOString();
  } else {
    delete topics[topicId];
  }

  // Update topicDetailStates
  const detailMap = getTopicDetailStates();
  detailMap[topicId] = {
    ...(detailMap[topicId] || {}),
    status: isCompleted ? "completed" : "not-started",
    completedAt: isCompleted ? new Date().toISOString() : undefined,
  };
  saveTopicDetailStates(detailMap);

  // Update daily activity
  const activityMap = getDailyActivity();
  const todayRecord: DailyActivityRecord = activityMap[today] || {
    minutesStudied: 0,
    topicsCompletedToday: [],
  };

  let updatedTopicsToday = [...todayRecord.topicsCompletedToday];
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

  saveCompletedTopics(topics);
  saveDailyActivity(activityMap);

  // Sync legacy key
  try {
    localStorage.setItem("pmt_checked_topics", JSON.stringify(Object.keys(topics)));
  } catch {
    /* ignore */
  }

  return {
    completedTopics: topics,
    studyLog: getStudyLogDates(),
    isCompleted,
  };
}

/* ═══════════════════════════════════════════════════════════
   PROJECT STATUS
   ═══════════════════════════════════════════════════════════ */

export function getProjectStatuses(): Record<string, ProjectState> {
  return getStorageItem<Record<string, ProjectState>>(STORAGE_KEYS.PROJECT_STATUS, {});
}

export function saveProjectStatuses(data: Record<string, ProjectState>): void {
  setStorageItem(STORAGE_KEYS.PROJECT_STATUS, data);
}

export function setProjectStatus(
  projectId: string,
  status: ProjectStatusType
): { projectStatus: Record<string, ProjectState>; studyLog: string[] } {
  const statuses = getProjectStatuses();
  const today = new Date().toISOString().slice(0, 10);

  statuses[projectId] = {
    status,
    completedAt: status === "completed" ? new Date().toISOString() : undefined,
  };

  const activityMap = getDailyActivity();
  if (!activityMap[today]) {
    activityMap[today] = {
      minutesStudied: 0,
      topicsCompletedToday: [],
    };
    saveDailyActivity(activityMap);
  }

  saveProjectStatuses(statuses);

  try {
    const completedIds = Object.entries(statuses)
      .filter(([, val]) => val.status === "completed")
      .map(([id]) => id);
    localStorage.setItem("pmt_completed_projects", JSON.stringify(completedIds));
  } catch {
    /* ignore */
  }

  return { projectStatus: statuses, studyLog: getStudyLogDates() };
}

/* ═══════════════════════════════════════════════════════════
   DAILY ACTIVITY & JOURNAL
   ═══════════════════════════════════════════════════════════ */

export function getDailyActivity(): Record<string, DailyActivityRecord> {
  const activityMap = getStorageItem<Record<string, DailyActivityRecord>>(
    STORAGE_KEYS.DAILY_ACTIVITY,
    {}
  );
  const oldLog = getStorageItem<string[]>(STORAGE_KEYS.STUDY_LOG, []);

  let migrated = false;
  oldLog.forEach((dateStr) => {
    if (!activityMap[dateStr]) {
      activityMap[dateStr] = {
        minutesStudied: 0,
        topicsCompletedToday: [],
      };
      migrated = true;
    }
  });

  if (migrated) {
    setStorageItem(STORAGE_KEYS.DAILY_ACTIVITY, activityMap);
  }

  return activityMap;
}

export function saveDailyActivity(data: Record<string, DailyActivityRecord>): void {
  setStorageItem(STORAGE_KEYS.DAILY_ACTIVITY, data);
  const activeDates = Object.keys(data).filter(
    (d) =>
      data[d].minutesStudied > 0 ||
      data[d].topicsCompletedToday.length > 0 ||
      (data[d].note && data[d].note!.trim().length > 0)
  );
  setStorageItem(STORAGE_KEYS.STUDY_LOG, activeDates);
}

export function logStudyMinutes(
  date: string,
  minutes: number,
  mode?: "stopwatch" | "pomodoro"
): Record<string, DailyActivityRecord> {
  const activityMap = getDailyActivity();
  const current = activityMap[date] || {
    minutesStudied: 0,
    topicsCompletedToday: [],
  };

  activityMap[date] = {
    ...current,
    minutesStudied: current.minutesStudied + Math.max(0, minutes),
    timerMode: mode || current.timerMode,
  };

  saveDailyActivity(activityMap);
  return activityMap;
}

export function saveJournalNote(
  date: string,
  noteText: string,
  taggedTopicIds?: string[]
): Record<string, DailyActivityRecord> {
  const activityMap = getDailyActivity();
  const current = activityMap[date] || {
    minutesStudied: 0,
    topicsCompletedToday: [],
  };

  const updatedTopics = taggedTopicIds
    ? Array.from(new Set([...current.topicsCompletedToday, ...taggedTopicIds]))
    : current.topicsCompletedToday;

  activityMap[date] = {
    ...current,
    note: noteText,
    noteUpdatedAt: new Date().toISOString(),
    topicsCompletedToday: updatedTopics,
  };

  saveDailyActivity(activityMap);
  return activityMap;
}

export function getStudyLogDates(): string[] {
  const activityMap = getDailyActivity();
  return Object.keys(activityMap).filter(
    (d) =>
      activityMap[d].minutesStudied > 0 ||
      activityMap[d].topicsCompletedToday.length > 0 ||
      (activityMap[d].note && activityMap[d].note!.trim().length > 0)
  ).sort();
}

/* ═══════════════════════════════════════════════════════════
   STREAK FREEZES & BADGES
   ═══════════════════════════════════════════════════════════ */

export function getStreakFreezes(): StreakFreezeState {
  return getStorageItem<StreakFreezeState>(STORAGE_KEYS.STREAK_FREEZES, DEFAULT_FREEZES);
}

export function saveStreakFreezes(freezes: StreakFreezeState): void {
  setStorageItem(STORAGE_KEYS.STREAK_FREEZES, freezes);
}

export function getUnlockedBadges(): UnlockedBadge[] {
  return getStorageItem<UnlockedBadge[]>(STORAGE_KEYS.BADGES, []);
}

export function unlockBadge(badgeId: string): UnlockedBadge[] {
  const badges = getUnlockedBadges();
  if (!badges.some((b) => b.badgeId === badgeId)) {
    const updated = [...badges, { badgeId, unlockedAt: new Date().toISOString() }];
    setStorageItem(STORAGE_KEYS.BADGES, updated);
    return updated;
  }
  return badges;
}

/* ═══════════════════════════════════════════════════════════
   ACTIVE TIMER SESSION
   ═══════════════════════════════════════════════════════════ */

export function getActiveTimerSession(): ActiveTimerSession | null {
  return getStorageItem<ActiveTimerSession | null>(STORAGE_KEYS.ACTIVE_TIMER, null);
}

export function saveActiveTimerSession(session: ActiveTimerSession | null): void {
  if (!session) {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_TIMER);
    }
  } else {
    setStorageItem(STORAGE_KEYS.ACTIVE_TIMER, session);
  }
}

/* ═══════════════════════════════════════════════════════════
   SETTINGS, BACKUP & RESTORE
   ═══════════════════════════════════════════════════════════ */

export const getStudyLog = getStudyLogDates;

export function getUserSettings(): UserSettings {
  const settings = getStorageItem<UserSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  return { ...DEFAULT_SETTINGS, ...settings };
}

export function saveUserSettings(settings: Partial<UserSettings>): UserSettings {
  const current = getUserSettings();
  const updated = { ...current, ...settings };
  setStorageItem(STORAGE_KEYS.SETTINGS, updated);

  // Apply dark mode class to html document
  if (typeof window !== "undefined") {
    if (updated.theme === "dark" || (updated.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  return updated;
}

export function exportAllDataJSON(): string {
  if (typeof window === "undefined") return "{}";
  const exportObject: Record<string, unknown> = {};
  Object.values(STORAGE_KEYS).forEach((key) => {
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        exportObject[key] = JSON.parse(raw);
      } catch {
        exportObject[key] = raw;
      }
    }
  });
  return JSON.stringify(exportObject, null, 2);
}

export function importDataJSON(jsonString: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const parsed = JSON.parse(jsonString);
    if (typeof parsed !== "object" || parsed === null) return false;

    Object.entries(parsed).forEach(([key, value]) => {
      localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
    });
    return true;
  } catch {
    return false;
  }
}

export function resetAllStorage(): void {
  if (typeof window === "undefined") return;
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  localStorage.removeItem("pmt_checked_topics");
  localStorage.removeItem("pmt_completed_projects");
  localStorage.removeItem("ag_streak_current");
}
