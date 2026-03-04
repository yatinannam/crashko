"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useTrends } from "@/hooks/useTrends";
import TrendGraph from "@/components/TrendGraph";

const RANGES = [
  { label: "7 days", value: 7 },
  { label: "14 days", value: 14 },
  { label: "30 days", value: 30 },
];

const RISK_COLOR: Record<string, string> = {
  "High Risk":
    "text-red-600 bg-red-50 ring-red-200 dark:bg-red-900/20 dark:text-red-400 dark:ring-red-800",
  "At Risk":
    "text-amber-600 bg-amber-50 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:ring-amber-800",
  Safe: "text-emerald-600 bg-emerald-50 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:ring-emerald-800",
};

export default function TrendsPage() {
  const [days, setDays] = useState(7);
  const { data: session } = useSession();
  const { data, loading } = useTrends(session?.user?.id ?? "", days);

  // Compute summary stats from trend data
  const avg = (arr: number[]) =>
    arr.length
      ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10
      : 0;

  const scores = data.map((d) => d.burnoutScore);
  const sleeps = data.map((d) => d.sleepHours);
  const stresses = data.map((d) => d.stressLevel);
  const crashes = data.map((d) => d.crashProbability ?? 0);

  const avgScore = avg(scores);
  const avgSleep = avg(sleeps);
  const avgStress = avg(stresses);
  const avgCrash = avg(crashes);

  const riskLabel =
    avgScore > 60 ? "High Risk" : avgScore > 30 ? "At Risk" : "Safe";

  const bestDay = data.reduce(
    (best, d) => (!best || d.burnoutScore < best.burnoutScore ? d : best),
    data[0] ?? null,
  );
  const worstDay = data.reduce(
    (worst, d) => (!worst || d.burnoutScore > worst.burnoutScore ? d : worst),
    data[0] ?? null,
  );

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Header row */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Trends
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Your burnout patterns over time
            </p>
          </div>

          {/* Range pills */}
          <div className="flex gap-1 self-start rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            {RANGES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setDays(r.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  days === r.value
                    ? "bg-white text-slate-800 shadow-sm dark:bg-slate-700 dark:text-white"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-900">
            Loading trends…
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-900">
            No data yet — log a day from the Dashboard to get started.
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard
                label="Avg Burnout"
                value={avgScore}
                suffix="/100"
                badge={riskLabel}
                badgeClass={RISK_COLOR[riskLabel]}
              />
              <StatCard
                label="Avg Sleep"
                value={avgSleep}
                suffix="h"
                sub={avgSleep < 6 ? "Low" : avgSleep >= 7 ? "Good" : "Okay"}
              />
              <StatCard label="Avg Stress" value={avgStress} suffix="/10" />
              <StatCard label="Avg Crash %" value={avgCrash} suffix="%" />
            </div>

            {/* Best / worst day */}
            {(bestDay || worstDay) && (
              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {bestDay && (
                  <div className="flex items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 dark:border-emerald-800 dark:bg-emerald-900/20">
                    <div>
                      <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        Best day in range
                      </p>
                      <p className="text-base font-bold text-slate-800 dark:text-slate-100">
                        {fmtDate(bestDay.date)}
                      </p>
                      <p className="text-xs text-slate-500">
                        Score {bestDay.burnoutScore} · {bestDay.sleepHours}h
                        sleep
                      </p>
                    </div>
                  </div>
                )}
                {worstDay && (
                  <div className="flex items-center gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 dark:border-red-800 dark:bg-red-900/20">
                    <div>
                      <p className="text-xs font-medium text-red-600 dark:text-red-400">
                        Hardest day in range
                      </p>
                      <p className="text-base font-bold text-slate-800 dark:text-slate-100">
                        {fmtDate(worstDay.date)}
                      </p>
                      <p className="text-xs text-slate-500">
                        Score {worstDay.burnoutScore} · stress{" "}
                        {worstDay.stressLevel}/10
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <TrendGraph data={data} />
          </>
        )}
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  suffix,
  sub,
  badge,
  badgeClass,
}: {
  label: string;
  value: number;
  suffix: string;
  sub?: string;
  badge?: string;
  badgeClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-extrabold tabular-nums text-slate-900 dark:text-white">
        {value}
        <span className="text-sm font-medium text-slate-400">{suffix}</span>
      </p>
      {badge && (
        <span
          className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${badgeClass}`}
        >
          {badge}
        </span>
      )}
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}
