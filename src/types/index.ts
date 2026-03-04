// ---------- Input ----------
export interface BurnoutInput {
  sleepHours: number;
  studyHours: number;
  stressLevel: number; // 1–10
  tasksPending: number;
  deadlinesSoon: number; // within 48 h
  userId?: string;
}

// ---------- Engine output ----------
export interface BurnoutResult {
  score: number; // 0–100
  risk: "Safe" | "At Risk" | "High Risk";
  flags: string[];
  crashProbability: number; // 0–100
  focusMode: number; // recommended pomodoro minutes
}

// ---------- Groq / AI ----------
export interface GroqAIResponse {
  shortDiagnosis: string;
  recoveryPlan: string[];
  studyRestructuring: string;
  oneMotivationalLine: string;
  recommendedPomodoroMinutes: number;
  tags: string[];
  raw?: string; // fallback when parse fails
}

// ---------- API responses ----------
export interface AnalyzeApiResponse {
  result: BurnoutResult;
  ai: GroqAIResponse;
}

// ---------- Trend data ----------
export interface TrendDay {
  date: string; // ISO string
  sleepHours: number;
  studyHours: number;
  stressLevel: number;
  burnoutScore: number;
  risk: string;
  crashProbability?: number;
}
