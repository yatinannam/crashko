import type { BurnoutInput, BurnoutResult } from "@/types";

interface LastDayEntry {
  sleepHours: number;
  stressLevel?: number;
}

interface ComputeInput extends BurnoutInput {
  lastNdays?: LastDayEntry[];
}

function clamp(val: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, val));
}

export function computeBurnout(input: ComputeInput): BurnoutResult {
  const {
    sleepHours,
    studyHours,
    stressLevel,
    tasksPending,
    deadlinesSoon,
    lastNdays = [],
  } = input;

  // ── Sub-scores (each maps to 0–100) ──────────────────────────────────────

  // Sleep: deficit from ideal 8h
  const sleepDeficit = Math.max(0, 8 - sleepHours);
  const sleepScore = clamp((sleepDeficit / 8) * 100);

  // Study load: relative to 10h as ceiling
  const studyScore = clamp((studyHours / 10) * 100);

  // Deadlines: 2 deadlines within 48h = 100
  const deadlineScore = clamp(deadlinesSoon * 50);

  // Stress: 1→0, 10→100
  const stressScore = clamp(((stressLevel - 1) / 9) * 100);

  // Pending tasks: 20 tasks = 100
  const tasksScore = clamp(tasksPending * 5);

  // ── Weighted composite score ──────────────────────────────────────────────
  const score = Math.round(
    studyScore * 0.3 +
      sleepScore * 0.25 +
      deadlineScore * 0.2 +
      stressScore * 0.15 +
      tasksScore * 0.1,
  );

  // ── Risk category ─────────────────────────────────────────────────────────
  const risk: BurnoutResult["risk"] =
    score > 60 ? "High Risk" : score > 30 ? "At Risk" : "Safe";

  // ── Flags ─────────────────────────────────────────────────────────────────
  const flags: string[] = [];
  if (sleepHours < 6) flags.push("Low Sleep");
  if (sleepHours >= 6 && sleepHours < 7) flags.push("Suboptimal Sleep");
  if (deadlinesSoon >= 2) flags.push("Deadline Cluster");
  if (studyHours > 8) flags.push("High Study Load");
  if (stressLevel >= 8) flags.push("High Stress");
  if (tasksPending > 10) flags.push("Task Overload");

  // ── Crash probability ─────────────────────────────────────────────────────
  const consecutiveLowSleep = lastNdays.filter((d) => d.sleepHours < 6).length;
  let crashProbability: number;

  if (consecutiveLowSleep >= 3 && stressLevel > 7 && deadlinesSoon >= 2) {
    // Elevated pattern detected
    crashProbability = clamp(
      50 + (consecutiveLowSleep - 2) * 10 + (stressLevel - 7) * 5,
    );
  } else {
    crashProbability = clamp(
      Math.round((score / 100) * 40 + (stressLevel / 10) * 20),
    );
  }

  // ── Focus mode (Pomodoro recommendation) ─────────────────────────────────
  const focusMode = score > 60 ? 25 : score > 30 ? 45 : 60;

  return { score, risk, flags, crashProbability, focusMode };
}
