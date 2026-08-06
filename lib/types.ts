export interface PaceTableItem {
  hoursPerDay: number;
  totalDays: number;
  totalWeeks: number;
}

export interface MetaData {
  title: string;
  totalEstimatedHours: number;
  paceTable: PaceTableItem[];
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedHours: number;
  prerequisites: string[];
  exercises: string[];
  resources: string[];
}

export interface Phase {
  id: string;
  order: number;
  title: string;
  why: string;
  topics: Topic[];
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  phaseIds: string[];
  topicIds: string[];
  estimatedHours: number;
  stretchGoals: string[];
}

export interface CurriculumData {
  meta: MetaData;
  phases: Phase[];
  projects: ProjectItem[];
}
