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
import ShinyText from "@/components/ShinyText";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

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
    setTimeout(() => refetchTrends(), 800);
  };

  const handleReset = () => {
    reset();
    refetchTrends();
  };

  return (
    <div className="flex-1">
      <main className="mx-auto max-w-6xl px-4 py-10">
        {/* ── Hero ────────────────────────────────────────────── */}
        <motion.div
          className="mb-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <ShinyText
            as="h1"
            className="mb-3 text-4xl font-extrabold tracking-tight sm:text-5xl"
          >
            Know before you crash.
          </ShinyText>
          <p className="text-slate-400 text-base max-w-lg mx-auto leading-relaxed">
            Log your day and receive your burnout score plus an AI-generated
            recovery plan — in seconds.
          </p>
        </motion.div>

        {/* ── Error ───────────────────────────────────────────── */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-xl px-4 py-3 text-sm text-red-300"
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.25)",
            }}
          >
            {error}
          </motion.div>
        )}

        {!submitted ? (
          /* ── Input view: side-by-side ─────────────────────── */
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Today's Check-in */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <BurnoutForm onSubmit={handleSubmit} loading={loading} />
            </motion.div>

            {/* 7-Day Trend */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.2,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {trendLoading ? (
                <div
                  className="flex h-full min-h-[320px] items-center justify-center rounded-2xl text-sm text-slate-500"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px dashed rgba(255,255,255,0.1)",
                  }}
                >
                  <span className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 animate-spin text-violet-400"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                    Loading trends…
                  </span>
                </div>
              ) : (
                <TrendGraph data={trendData} />
              )}
            </motion.div>
          </div>
        ) : (
          /* ── Results view ─────────────────────────────────── */
          <div className="flex flex-col gap-6">
            {/* Back button — top of results */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-slate-300 transition-all hover:text-white"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <ArrowLeft size={14} />
                New Check-in
              </button>
            </motion.div>
            {response?.result && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <CrashAlertBanner
                  crashProbability={response.result.crashProbability}
                  flags={response.result.flags}
                />
              </motion.div>
            )}

            {/* Score + Focus side by side */}
            <div className="grid gap-6 sm:grid-cols-2">
              {response?.result && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.05 }}
                >
                  <ScoreCard result={response.result} />
                </motion.div>
              )}
              {response?.result && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.12 }}
                >
                  <FocusModeCard minutes={response.result.focusMode} />
                </motion.div>
              )}
            </div>

            {/* AI plan + Trend */}
            <div className="grid gap-6 lg:grid-cols-2">
              {response?.ai && response?.result && lastInput && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.18 }}
                >
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
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.24 }}
              >
                {trendLoading ? (
                  <div
                    className="flex h-48 items-center justify-center rounded-2xl text-sm text-slate-500"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px dashed rgba(255,255,255,0.1)",
                    }}
                  >
                    Loading trends…
                  </div>
                ) : (
                  <TrendGraph data={trendData} />
                )}
              </motion.div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className="mt-16 py-6 text-center text-xs text-slate-600"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        Crashko — AI-powered burnout prediction for students.
      </footer>
    </div>
  );
}
