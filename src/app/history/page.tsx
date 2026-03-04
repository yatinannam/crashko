"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";

interface LogEntry {
  _id: string;
  createdAt: string;
  sleepHours: number;
  studyHours: number;
  stressLevel: number;
  tasksPending: number;
  deadlinesSoon: number;
  burnoutScore: number;
  risk: string;
  flags: string[];
  crashProbability: number;
  focusMode: number;
}

const RISK_COLOR: Record<string, string> = {
  "High Risk":
    "bg-red-50 text-red-600 ring-red-200 dark:bg-red-900/20 dark:text-red-400 dark:ring-red-800",
  "At Risk":
    "bg-amber-50 text-amber-600 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:ring-amber-800",
  Safe: "bg-emerald-50 text-emerald-600 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:ring-emerald-800",
};

const SCORE_BAR: Record<string, string> = {
  "High Risk": "bg-red-500",
  "At Risk": "bg-amber-500",
  Safe: "bg-emerald-500",
};

export default function HistoryPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchLogs = useCallback(
    async (p: number) => {
      setLoading(true);
      try {
        const res = await fetch(`/api/history?page=${p}&limit=10`);
        const json = await res.json();
        setLogs(json.logs ?? []);
        setTotal(json.total ?? 0);
        setPages(json.pages ?? 1);
        setPage(p);
      } catch {
        setLogs([]);
      } finally {
        setLoading(false);
      }
    },
    [userId],
  );

  useEffect(() => {
    if (userId) fetchLogs(1);
  }, [fetchLogs, userId]);

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            History
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {total > 0
              ? `${total} burnout log${total !== 1 ? "s" : ""} saved`
              : "No logs yet"}
          </p>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-900">
            Loading history…
          </div>
        ) : logs.length === 0 ? (
          <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-900">
            No logs yet — log a day from the Dashboard first.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {logs.map((log) => {
              const isOpen = expanded === log._id;
              return (
                <div
                  key={log._id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all dark:border-slate-700 dark:bg-slate-900"
                >
                  {/* Row header */}
                  <button
                    type="button"
                    className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    onClick={() => setExpanded(isOpen ? null : log._id)}
                  >
                    {/* Score bar */}
                    <div className="relative h-10 w-10 shrink-0">
                      <svg viewBox="0 0 36 36" className="-rotate-90">
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          stroke="#e2e8f0"
                          strokeWidth="3.5"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          stroke={
                            log.risk === "High Risk"
                              ? "#ef4444"
                              : log.risk === "At Risk"
                                ? "#f59e0b"
                                : "#10b981"
                          }
                          strokeWidth="3.5"
                          strokeDasharray={`${(log.burnoutScore / 100) * 87.96} 87.96`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200">
                        {log.burnoutScore}
                      </span>
                    </div>

                    {/* Date + risk */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {fmtDate(log.createdAt)}
                      </p>
                      <div className="mt-0.5 flex flex-wrap gap-1.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${RISK_COLOR[log.risk]}`}
                        >
                          {log.risk}
                        </span>
                        {log.flags.slice(0, 2).map((f) => (
                          <span
                            key={f}
                            className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                          >
                            {f}
                          </span>
                        ))}
                        {log.flags.length > 2 && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-400 dark:bg-slate-800">
                            +{log.flags.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick metrics */}
                    <div className="hidden shrink-0 gap-4 text-right sm:flex">
                      <Metric label="Sleep" value={`${log.sleepHours}h`} />
                      <Metric label="Stress" value={`${log.stressLevel}/10`} />
                      <Metric
                        label="Crash"
                        value={`${log.crashProbability}%`}
                      />
                    </div>

                    {/* Chevron */}
                    <svg
                      className={`ml-2 h-4 w-4 shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div className="border-t border-slate-100 px-5 py-4 dark:border-slate-800">
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <DetailItem
                          label="Sleep"
                          value={`${log.sleepHours} hrs`}
                        />
                        <DetailItem
                          label="Study"
                          value={`${log.studyHours} hrs`}
                        />
                        <DetailItem
                          label="Stress"
                          value={`${log.stressLevel} / 10`}
                        />
                        <DetailItem
                          label="Tasks"
                          value={String(log.tasksPending)}
                        />
                        <DetailItem
                          label="Deadlines"
                          value={String(log.deadlinesSoon)}
                        />
                        <DetailItem
                          label="Crash %"
                          value={`${log.crashProbability}%`}
                        />
                        <DetailItem
                          label="Focus Block"
                          value={`${log.focusMode} min`}
                        />
                        <DetailItem
                          label="Burnout Score"
                          value={`${log.burnoutScore} / 100`}
                        />
                      </div>

                      {/* Score bar */}
                      <div className="mt-4">
                        <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                          <span>Burnout</span>
                          <span>{log.burnoutScore}/100</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className={`h-full rounded-full transition-all ${SCORE_BAR[log.risk]}`}
                            style={{ width: `${log.burnoutScore}%` }}
                          />
                        </div>
                      </div>

                      {log.flags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {log.flags.map((f) => (
                            <span
                              key={f}
                              className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Pagination */}
            {pages > 1 && (
              <div className="mt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => fetchLogs(page - 1)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  ← Prev
                </button>
                <span className="text-sm text-slate-400">
                  {page} / {pages}
                </span>
                <button
                  type="button"
                  disabled={page >= pages}
                  onClick={() => fetchLogs(page + 1)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
        {value}
      </p>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-slate-800 dark:text-slate-100">
        {value}
      </p>
    </div>
  );
}
