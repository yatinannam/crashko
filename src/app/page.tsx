"use client";

import { useBurnoutForm } from "@/hooks/useBurnoutForm";
import { useTrends } from "@/hooks/useTrends";
import BurnoutForm from "@/components/BurnoutForm";
import ScoreCard from "@/components/ScoreCard";
import ChatbotPanel from "@/components/ChatbotPanel";
import TrendGraph from "@/components/TrendGraph";
import FocusModeCard from "@/components/FocusModeCard";
import CrashAlertBanner from "@/components/CrashAlertBanner";

const USER_ID = "anon";

export default function Home() {
  const { loading, error, response, submitted, submitForm, lastInput, reset } =
    useBurnoutForm(USER_ID);
  const {
    data: trendData,
    loading: trendLoading,
    refetch: refetchTrends,
  } = useTrends(USER_ID, 7);

  const handleSubmit = async (data: Parameters<typeof submitForm>[0]) => {
    await submitForm(data);
    refetchTrends();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Nav */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💥</span>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Crashko
            </span>
          </div>
          <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-600 ring-1 ring-sky-200 dark:bg-sky-900/20 dark:text-sky-400 dark:ring-sky-800">
            Burnout Predictor
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Hero */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Know before you crash.
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Log your day → get your burnout score + AI recovery plan in seconds.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-400">
            ⚠️ {error}
          </div>
        )}

        {!submitted ? (
          /* ── Input view ──────────────────────────────── */
          <div className="mx-auto max-w-xl">
            <BurnoutForm onSubmit={handleSubmit} loading={loading} />
            <div className="mt-8">
              {trendLoading ? (
                <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-900">
                  Loading your trends…
                </div>
              ) : (
                <TrendGraph data={trendData} />
              )}
            </div>
          </div>
        ) : (
          /* ── Results view ────────────────────────────── */
          <div className="flex flex-col gap-6">
            {response?.result && (
              <CrashAlertBanner
                crashProbability={response.result.crashProbability}
                flags={response.result.flags}
              />
            )}

            <div className="grid gap-6 sm:grid-cols-2">
              {response?.result && <ScoreCard result={response.result} />}
              {response?.result && (
                <FocusModeCard minutes={response.result.focusMode} />
              )}
            </div>

            {response?.ai && response?.result && lastInput && (
              <ChatbotPanel
                ai={response.ai}
                context={{
                  ...response.result,
                  sleepHours: lastInput.sleepHours,
                  studyHours: lastInput.studyHours,
                  stressLevel: lastInput.stressLevel,
                  deadlinesSoon: lastInput.deadlinesSoon,
                  tasksPending: lastInput.tasksPending,
                }}
              />
            )}

            {trendLoading ? (
              <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-900">
                Loading trends…
              </div>
            ) : (
              <TrendGraph data={trendData} />
            )}

            <div className="text-center">
              <button
                onClick={reset}
                className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                ← Log Another Day
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-16 border-t border-slate-200 py-6 text-center text-xs text-slate-400 dark:border-slate-800">
        Crashko — AI-powered burnout prediction for students.
      </footer>
    </div>
  );
}
