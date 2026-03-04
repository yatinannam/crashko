"use client";

import { useSession } from "next-auth/react";
import { useBurnoutForm } from "@/hooks/useBurnoutForm";
import { useTrends } from "@/hooks/useTrends";
import BurnoutForm from "@/components/BurnoutForm";
import ScoreCard from "@/components/ScoreCard";
import ChatbotPanel from "@/components/ChatbotPanel";
import TrendGraph from "@/components/TrendGraph";
import FocusModeCard from "@/components/FocusModeCard";
import CrashAlertBanner from "@/components/CrashAlertBanner";

export default function Home() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";
  const { loading, error, response, submitted, submitForm, lastInput, reset } =
    useBurnoutForm(userId);
  const {
    data: trendData,
    loading: trendLoading,
    refetch: refetchTrends,
  } = useTrends(userId, 7);

  const handleSubmit = async (data: Parameters<typeof submitForm>[0]) => {
    await submitForm(data);
    // Small delay so MongoDB has committed the new log before we query trends
    setTimeout(() => refetchTrends(), 800);
  };

  const handleReset = () => {
    reset();
    refetchTrends(); // refresh chart with the log we just saved
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
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
            {error}
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
                onClick={handleReset}
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
