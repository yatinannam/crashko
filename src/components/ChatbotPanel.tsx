"use client";

import { useState } from "react";
import type { GroqAIResponse, BurnoutResult } from "@/types";
import type { GroqCallInput } from "@/lib/groqClient";

interface ChatbotPanelProps {
  ai: GroqAIResponse;
  context: BurnoutResult & {
    sleepHours: number;
    studyHours: number;
    stressLevel: number;
    deadlinesSoon: number;
    tasksPending: number;
  };
}

export default function ChatbotPanel({
  ai: initialAI,
  context,
}: ChatbotPanelProps) {
  const [ai, setAI] = useState<GroqAIResponse>(initialAI);
  const [regenerating, setRegenerating] = useState(false);
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());

  const toggleStep = (idx: number) => {
    setCheckedSteps((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const payload: GroqCallInput = { ...context };
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Regen failed");
      const { ai: newAI } = await res.json();
      setAI(newAI);
      setCheckedSteps(new Set());
    } catch {
      /* silent — keep previous result */
    } finally {
      setRegenerating(false);
    }
  };

  const recoveryPlan = Array.isArray(ai.recoveryPlan)
    ? ai.recoveryPlan
    : typeof ai.recoveryPlan === "string"
      ? [ai.recoveryPlan]
      : [];

  const tags = Array.isArray(ai.tags) ? ai.tags : [];

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🤖</span>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            AI Recovery Plan
          </h2>
        </div>
        <button
          onClick={handleRegenerate}
          disabled={regenerating}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <span className={regenerating ? "animate-spin" : ""}>🔄</span>
          {regenerating ? "Regenerating…" : "Regenerate"}
        </button>
      </div>

      {/* Diagnosis */}
      <div className="mb-4 rounded-xl bg-sky-50 px-4 py-3 dark:bg-sky-900/20">
        <p className="text-xs font-semibold uppercase tracking-widest text-sky-500">
          Diagnosis
        </p>
        <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
          {ai.shortDiagnosis || "No diagnosis available."}
        </p>
      </div>

      {/* Recovery Plan */}
      {recoveryPlan.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Next 24h Plan
          </p>
          <ul className="space-y-2">
            {recoveryPlan.map((step, i) => (
              <li
                key={i}
                onClick={() => toggleStep(i)}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-sm transition-all ${
                  checkedSteps.has(i)
                    ? "border-emerald-200 bg-emerald-50 text-slateald-400 line-through dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-slate-500"
                    : "border-slate-100 bg-slate-50 text-slate-700 hover:border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                    checkedSteps.has(i)
                      ? "border-emerald-400 bg-emerald-400"
                      : "border-slate-300 dark:border-slate-500"
                  }`}
                >
                  {checkedSteps.has(i) && (
                    <svg
                      className="h-2.5 w-2.5 text-white"
                      viewBox="0 0 10 10"
                      fill="currentColor"
                    >
                      <path
                        d="M2 5l2.5 2.5L8 3"
                        stroke="white"
                        strokeWidth="1.5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                <span className={checkedSteps.has(i) ? "line-through" : ""}>
                  {step}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Study Restructuring */}
      {ai.studyRestructuring && (
        <div className="mb-4 rounded-xl bg-violet-50 px-4 py-3 dark:bg-violet-900/20">
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-500">
            Study Restructuring
          </p>
          <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
            {ai.studyRestructuring}
          </p>
        </div>
      )}

      {/* Motivational line */}
      {ai.oneMotivationalLine && (
        <div className="mb-4 border-l-4 border-sky-300 pl-3">
          <p className="text-sm italic text-slate-500 dark:text-slate-400">
            "{ai.oneMotivationalLine}"
          </p>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
