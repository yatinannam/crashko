"use client";

import type { BurnoutResult } from "@/types";

interface ScoreCardProps {
  result: BurnoutResult;
}

const riskConfig = {
  Safe: {
    bg: "from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20",
    border: "border-emerald-200 dark:border-emerald-700",
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    score: "text-emerald-600 dark:text-emerald-400",
  },
  "At Risk": {
    bg: "from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20",
    border: "border-amber-200 dark:border-amber-700",
    badge:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    score: "text-amber-600 dark:text-amber-400",
  },
  "High Risk": {
    bg: "from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20",
    border: "border-red-200 dark:border-red-700",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    score: "text-red-600 dark:text-red-400",
  },
};

export default function ScoreCard({ result }: ScoreCardProps) {
  const cfg = riskConfig[result.risk];

  return (
    <div
      className={`w-full rounded-2xl border bg-linear-to-br p-6 shadow-sm ${cfg.bg} ${cfg.border}`}
    >
      <div className="flex items-start justify-between">
        {/* Score */}
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-widest text-slate-400">
            Burnout Score
          </p>
          <div className={`text-7xl font-extrabold leading-none ${cfg.score}`}>
            {result.score}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            out of 100
          </div>
        </div>

        {/* Risk badge */}
        <div className="flex flex-col items-end gap-2">
          <span
            className={`rounded-full px-3 py-1 text-sm font-semibold ${cfg.badge}`}
          >
            {result.risk}
          </span>
        </div>
      </div>

      {/* Crash Probability */}
      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Crash Probability</span>
          <span className="font-semibold">{result.crashProbability}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className={`h-2 rounded-full transition-all duration-700 ${
              result.crashProbability > 60
                ? "bg-red-500"
                : result.crashProbability > 30
                  ? "bg-amber-400"
                  : "bg-emerald-400"
            }`}
            style={{ width: `${result.crashProbability}%` }}
          />
        </div>
      </div>

      {/* Focus Mode */}
      <div className="mt-4 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <span className="text-base">⏱️</span>
        <span>
          Recommended focus block:{" "}
          <strong className="text-slate-800 dark:text-slate-100">
            {result.focusMode} min
          </strong>{" "}
          Pomodoro
        </span>
      </div>

      {/* Flags */}
      {result.flags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {result.flags.map((f) => (
            <span
              key={f}
              className="rounded-full bg-white/60 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:ring-slate-600"
            >
              {f}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
