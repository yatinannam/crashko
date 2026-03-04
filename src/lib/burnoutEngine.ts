import type { BurnoutInput, BurnoutResult } from "@/types";

interface LastDayEntry {
  sleepHours: number;
  studyHours?: number;
  stressLevel?: number;
  burnoutScore?: number;
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

  // ── Sub-scores (each 0–100) ───────────────────────────────────────────────

  // Sleep: each hour under 8 is weighted progressively harder
  const sleepDeficit = Math.max(0, 8 - sleepHours);
  const sleepScore = clamp((sleepDeficit / 8) * 100 * (sleepDeficit > 3 ? 1.2 : 1));

  // Study: relative to 10h ceiling, with steep jump above 8h
  const studyScore = clamp(
    studyHours <= 8
      ? (studyHours / 10) * 100
      : 80 + ((studyHours - 8) / 2) * 20,
  );

  // Deadlines: exponential pressure — 1 deadline = 40, 2 = 80, 3+ = 100
  const deadlineScore = clamp(deadlinesSoon === 0 ? 0 : Math.min(100, 40 + (deadlinesSoon - 1) * 40));

  // Stress: non-linear — upper range (8–10) hits harder
  const stressScore = clamp(
    stressLevel <= 7
      ? ((stressLevel - 1) / 9) * 80
      : 80 + ((stressLevel - 7) / 3) * 20,
  );

  // Tasks: logarithmic — first 5 tasks add a lot, then diminishing
  const tasksScore = clamp(Math.log1p(tasksPending) / Math.log1p(20) * 100);

  // ── Trend multiplier (consecutive bad days amplify today's score) ─────────
  const recentScores = lastNdays
    .map((d) => d.burnoutScore)
    .filter((s): s is number => s !== undefined)
    .slice(0, 3);

  const avgRecentScore =
    recentScores.length > 0
      ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length
      : 0;

  // If average of last 3 days was already High Risk, amplify by up to 15%
  const trendMultiplier = avgRecentScore > 60 ? 1 + (avgRecentScore - 60) / 400 : 1;

  // ── Weighted composite score ──────────────────────────────────────────────
  const rawScore =
    studyScore * 0.28 +
    sleepScore * 0.27 +
    stressScore * 0.20 +
    deadlineScore * 0.15 +
    tasksScore * 0.10;

  const score = clamp(Math.round(rawScore * trendMultiplier));

  // ── Risk category ─────────────────────────────────────────────────────────
  const risk: BurnoutResult["risk"] =
    score > 60 ? "High Risk" : score > 30 ? "At Risk" : "Safe";

  // ── Flags ─────────────────────────────────────────────────────────────────
  const flags: string[] = [];
  if (sleepHours < 5) flags.push("Severe Sleep Deprivation");
  else if (sleepHours < 6) flags.push("Low Sleep");
  else if (sleepHours < 7) flags.push("Suboptimal Sleep");
  if (deadlinesSoon >= 3) flags.push("Critical Deadline Cluster");
  else if (deadlinesSoon >= 2) flags.push("Deadline Cluster");
  if (studyHours > 10) flags.push("Extreme Study Load");
  else if (studyHours > 8) flags.push("High Study Load");
  if (stressLevel >= 9) flags.push("Critical Stress");
  else if (stressLevel >= 8) flags.push("High Stress");
  if (tasksPending > 15) flags.push("Task Overload");
  if (recentScores.length >= 2 && recentScores.every((s) => s > 60))
    flags.push("Consecutive High Risk Days");

  // ── Crash probability (trend-aware) ──────────────────────────────────────
  const consecutiveLowSleep = lastNdays.filter((d) => d.sleepHours < 6).length;

  // Base crash probability from score + stress
  let crashProbability = clamp(
    Math.round((score / 100) * 45 + (stressScore / 100) * 25),
  );

  // Heavy amplifier when multiple crisis signals align
  if (consecutiveLowSleep >= 3 && stressLevel > 7 && deadlinesSoon >= 2) {
    crashProbability = clamp(
      60 + (consecutiveLowSleep - 2) * 8 + (stressLevel - 7) * 4 + deadlinesSoon * 3,
    );
  }

  // Trend direction bonus: if trending worse, push crash probability up
  if (recentScores.length >= 2) {
    const trendDelta = score - recentScores[0];
    if (trendDelta > 15) crashProbability = clamp(crashProbability + 10); // worsening
    if (trendDelta < -15) crashProbability = clamp(crashProbability - 8);  // improving
  }

  // ── Dynamic Pomodoro recommendation ──────────────────────────────────────
  // Continuous formula: high burnout → shorter blocks; well-rested → longer
  // Range: 15 min (score 100) to 60 min (score 0), adjusted by sleep quality
  // Pomodoro range: 45 min (low burnout) → 15 min (high burnout), sleep-adjusted
  const baseFocus = Math.round(45 - (score / 100) * 30);
  const sleepBonus = sleepHours >= 7 ? 3 : sleepHours < 5 ? -3 : 0;
  const focusMode = clamp(baseFocus + sleepBonus, 15, 45);

  return { score, risk, flags, crashProbability, focusMode };
}
