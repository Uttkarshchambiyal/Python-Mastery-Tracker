import {
  getUnlockedBadges,
  unlockBadge,
  getDailyActivity,
  getCompletedTopics,
  getStudyLogDates,
  UnlockedBadge,
} from "./storage";
import { getCurrentStreak } from "./pace";
import curriculumData from "@/data/curriculum.json";
import { CurriculumData } from "./types";

const curriculum = curriculumData as CurriculumData;

export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: "first-blood",
    title: "First Blood",
    description: "Log your very first study session",
    iconName: "Zap",
  },
  {
    id: "night-owl",
    title: "Night Owl",
    description: "Complete a timer session between 10 PM and 4 AM",
    iconName: "Moon",
  },
  {
    id: "deep-work",
    title: "Deep Work",
    description: "Log a single study session longer than 90 minutes",
    iconName: "Clock",
  },
  {
    id: "streak-master",
    title: "Streak Master",
    description: "Hit a 7-day active study streak",
    iconName: "Flame",
  },
  {
    id: "curriculum-crusher",
    title: "Curriculum Crusher",
    description: "Mark 25% of all curriculum topics complete",
    iconName: "Trophy",
  },
];

/**
 * Checks all badge criteria against user activity and unlocks any newly earned badges.
 * Returns array of newly unlocked badge IDs for toast triggers.
 */
export function checkAndUnlockBadges(lastSessionMinutes?: number, lastSessionTime?: Date): string[] {
  const currentUnlocked = getUnlockedBadges().map((b) => b.badgeId);
  const newlyUnlocked: string[] = [];

  const activityMap = getDailyActivity();
  const completedTopics = getCompletedTopics();
  const studyDates = getStudyLogDates();
  const streak = getCurrentStreak(studyDates);

  const totalTopics = curriculum.phases.reduce((acc, p) => acc + p.topics.length, 0);
  const completedCount = Object.keys(completedTopics).length;

  // 1. First Blood
  if (!currentUnlocked.includes("first-blood")) {
    const hasAnyMinutes = Object.values(activityMap).some((r) => r.minutesStudied > 0);
    if (hasAnyMinutes || (lastSessionMinutes && lastSessionMinutes > 0)) {
      unlockBadge("first-blood");
      newlyUnlocked.push("first-blood");
    }
  }

  // 2. Night Owl (between 22:00 and 04:00)
  if (!currentUnlocked.includes("night-owl")) {
    const checkTime = lastSessionTime || new Date();
    const hour = checkTime.getHours();
    if (hour >= 22 || hour < 4) {
      if (lastSessionMinutes && lastSessionMinutes > 0) {
        unlockBadge("night-owl");
        newlyUnlocked.push("night-owl");
      }
    }
  }

  // 3. Deep Work (> 90 mins single session)
  if (!currentUnlocked.includes("deep-work")) {
    if (lastSessionMinutes && lastSessionMinutes >= 90) {
      unlockBadge("deep-work");
      newlyUnlocked.push("deep-work");
    }
  }

  // 4. Streak Master (7-day streak)
  if (!currentUnlocked.includes("streak-master")) {
    if (streak.current >= 7) {
      unlockBadge("streak-master");
      newlyUnlocked.push("streak-master");
    }
  }

  // 5. Curriculum Crusher (>= 25% complete)
  if (!currentUnlocked.includes("curriculum-crusher")) {
    if (totalTopics > 0 && completedCount / totalTopics >= 0.25) {
      unlockBadge("curriculum-crusher");
      newlyUnlocked.push("curriculum-crusher");
    }
  }

  return newlyUnlocked;
}
