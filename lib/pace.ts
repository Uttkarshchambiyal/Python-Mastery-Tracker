import { differenceInCalendarDays, addDays, format, subDays, startOfWeek, endOfWeek } from "date-fns";
import { CurriculumData } from "./types";
import { UserSettings, DailyActivityRecord, StreakFreezeState } from "./storage";

export interface StreakInfo {
  current: number;
  longest: number;
  freezesAvailable: number;
  freezeConsumedToday: boolean;
  usedFreezeDates: string[];
}

export interface CompletionStats {
  totalHours: number;
  completedHours: number;
  remainingHours: number;
  percentComplete: number;
  totalTopicsCount: number;
  completedTopicsCount: number;
}

export interface ProjectedPace {
  averageHoursPerDay: number;
  projectedDaysRemaining: number;
  projectedCompletionDate: string;
  status: "ahead" | "on-track" | "behind";
}

export interface WeeklyRecap {
  weekLabel: string;
  hoursThisWeek: number;
  hoursLastWeek: number;
  topicsCompletedThisWeek: number;
  noteHighlight?: string;
  streakCurrent: number;
  freezesAvailable: number;
}

const DEFAULT_FREEZES: StreakFreezeState = {
  available: 1,
  usedOn: [],
};

/**
 * Calculates current and longest streak from active study dates with streak freeze protection.
 */
export function getCurrentStreak(
  studyLog: string[],
  freezeState: StreakFreezeState = DEFAULT_FREEZES
): StreakInfo {
  let availableFreezes = freezeState?.available ?? 1;
  const usedFreezeDates = [...(freezeState?.usedOn || [])];
  let freezeConsumedToday = false;

  if (!studyLog || studyLog.length === 0) {
    return {
      current: 0,
      longest: 0,
      freezesAvailable: availableFreezes,
      freezeConsumedToday: false,
      usedFreezeDates,
    };
  }

  const activeSet = new Set(studyLog);
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  // Walk backward from today
  let currentStreak = 0;
  let checkDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  // If today is not active yet, check yesterday to allow streak to continue today
  if (!activeSet.has(todayStr)) {
    const yesterday = subDays(checkDate, 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    if (!activeSet.has(yesterdayStr) && availableFreezes > 0) {
      // Use freeze for yesterday if missing
      availableFreezes--;
      usedFreezeDates.push(yesterdayStr);
      freezeConsumedToday = true;
      activeSet.add(yesterdayStr);
      checkDate = yesterday;
    } else if (activeSet.has(yesterdayStr)) {
      checkDate = yesterday;
    }
  }

  // Count consecutive active days
  while (true) {
    const dateStr = checkDate.toISOString().slice(0, 10);
    if (activeSet.has(dateStr)) {
      currentStreak++;
      checkDate = subDays(checkDate, 1);
    } else if (availableFreezes > 0) {
      availableFreezes--;
      usedFreezeDates.push(dateStr);
      activeSet.add(dateStr);
      currentStreak++;
      checkDate = subDays(checkDate, 1);
    } else {
      break;
    }
  }

  // Check 7-day streak milestone reward (+1 freeze per 7 days milestone, max 3)
  if (currentStreak > 0 && currentStreak % 7 === 0 && availableFreezes < 3) {
    availableFreezes = Math.min(3, availableFreezes + 1);
  }

  return {
    current: currentStreak,
    longest: Math.max(currentStreak, studyLog.length),
    freezesAvailable: availableFreezes,
    freezeConsumedToday,
    usedFreezeDates,
  };
}

/**
 * Calculates curriculum completion metrics.
 */
export function getCompletionStats(
  curriculum: CurriculumData,
  completedTopics: Record<string, string>
): CompletionStats {
  let totalHours = 0;
  let completedHours = 0;
  let totalTopicsCount = 0;
  let completedTopicsCount = 0;

  curriculum.phases.forEach((phase) => {
    phase.topics.forEach((topic) => {
      totalTopicsCount++;
      totalHours += topic.estimatedHours || 2;

      if (completedTopics[topic.id]) {
        completedTopicsCount++;
        completedHours += topic.estimatedHours || 2;
      }
    });
  });

  const remainingHours = Math.max(0, totalHours - completedHours);
  const percentComplete =
    totalHours > 0 ? Math.round((completedHours / totalHours) * 100) : 0;

  return {
    totalHours,
    completedHours,
    remainingHours,
    percentComplete,
    totalTopicsCount,
    completedTopicsCount,
  };
}

/**
 * Projects learning pace over active days.
 */
export function getProjectedPace(
  studyLog: string[],
  stats: CompletionStats,
  settings: UserSettings
): ProjectedPace {
  const goalPace = settings.dailyGoalHours || 1;
  const remainingHours = stats.remainingHours;

  const today = new Date();
  const activeDays14 = studyLog.filter((dateStr) => {
    const d = new Date(dateStr + "T00:00:00");
    return differenceInCalendarDays(today, d) <= 14;
  }).length;

  const averageHoursPerDay =
    activeDays14 > 0
      ? Math.min(3, Math.max(0.5, (activeDays14 / 14) * goalPace * 1.5))
      : goalPace;
  const projectedDaysRemaining =
    remainingHours > 0 ? Math.ceil(remainingHours / averageHoursPerDay) : 0;
  const projectedDateObj = addDays(today, projectedDaysRemaining);
  const projectedCompletionDate = format(projectedDateObj, "MMM d, yyyy");

  let status: "ahead" | "on-track" | "behind" = "on-track";
  if (settings.targetCompletionDate) {
    const targetObj = new Date(settings.targetCompletionDate + "T00:00:00");
    const diffDays = differenceInCalendarDays(targetObj, projectedDateObj);
    if (diffDays >= 3) status = "ahead";
    else if (diffDays < -3) status = "behind";
  }

  return {
    averageHoursPerDay: Math.round(averageHoursPerDay * 10) / 10,
    projectedDaysRemaining,
    projectedCompletionDate,
    status,
  };
}

/**
 * Calculates weekly recap metrics for a specified week offset (0 = current week, 1 = 1 week ago, etc.).
 */
export function getWeeklyRecap(
  dailyActivity: Record<string, DailyActivityRecord>,
  weekOffset: number = 0,
  studyLog: string[] = []
): WeeklyRecap {
  const now = new Date();
  const targetWeekStart = startOfWeek(subDays(now, weekOffset * 7), { weekStartsOn: 1 });
  const targetWeekEnd = endOfWeek(targetWeekStart, { weekStartsOn: 1 });

  const prevWeekStart = subDays(targetWeekStart, 7);
  const prevWeekEnd = subDays(targetWeekEnd, 7);

  let minutesThisWeek = 0;
  let minutesLastWeek = 0;
  let topicsThisWeek = 0;
  let longestNoteThisWeek = "";

  Object.entries(dailyActivity).forEach(([dateStr, record]) => {
    const dateObj = new Date(dateStr + "T00:00:00");

    // This week check
    if (dateObj >= targetWeekStart && dateObj <= targetWeekEnd) {
      minutesThisWeek += record.minutesStudied || 0;
      topicsThisWeek += record.topicsCompletedToday?.length || 0;

      if (record.note && record.note.length > longestNoteThisWeek.length) {
        longestNoteThisWeek = record.note;
      }
    }

    // Last week check
    if (dateObj >= prevWeekStart && dateObj <= prevWeekEnd) {
      minutesLastWeek += record.minutesStudied || 0;
    }
  });

  const streak = getCurrentStreak(studyLog);

  return {
    weekLabel: `${format(targetWeekStart, "MMM d")} - ${format(targetWeekEnd, "MMM d, yyyy")}`,
    hoursThisWeek: Math.round((minutesThisWeek / 60) * 10) / 10,
    hoursLastWeek: Math.round((minutesLastWeek / 60) * 10) / 10,
    topicsCompletedThisWeek: topicsThisWeek,
    noteHighlight: longestNoteThisWeek ? longestNoteThisWeek.slice(0, 140) + "..." : undefined,
    streakCurrent: streak.current,
    freezesAvailable: streak.freezesAvailable,
  };
}
