"use client";

import { useState, useEffect, useRef } from "react";

interface FocusModeCardProps {
  minutes: number;
}

type TimerState = "idle" | "running" | "paused" | "done";

export default function FocusModeCard({ minutes }: FocusModeCardProps) {
  const [state, setState] = useState<TimerState>("idle");
  const [secondsLeft, setSecondsLeft] = useState(minutes * 60);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset when minutes prop changes
  useEffect(() => {
    clearInterval(intervalRef.current!);
    setState("idle");
    setSecondsLeft(minutes * 60);
  }, [minutes]);

  useEffect(() => {
    if (state === "running") {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setState("done");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current!);
    }
    return () => clearInterval(intervalRef.current!);
  }, [state]);

  const total = minutes * 60;
  // progress: 0 at start → 100 at end (used to DRAIN the circle)
  const progress = total > 0 ? ((total - secondsLeft) / total) * 100 : 0;

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  const circumference = 2 * Math.PI * 40;
  // dashoffset 0 = full circle (idle/start), circumference = empty (done)
  const strokeDashoffset = circumference * (progress / 100);

  const handleToggle = () => {
    if (state === "done") {
      setSecondsLeft(minutes * 60);
      setState("running");
    } else if (state === "running") {
      setState("paused");
    } else {
      setState("running");
    }
  };

  const handleReset = () => {
    clearInterval(intervalRef.current!);
    setState("idle");
    setSecondsLeft(minutes * 60);
  };

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xl">🎯</span>
        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            Focus Mode
          </h2>
          <p className="text-xs text-slate-400">
            {minutes}-minute Pomodoro session
          </p>
        </div>
      </div>

      {/* Circular Timer */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex h-28 w-28 items-center justify-center">
          <svg
            className="-rotate-90"
            width="112"
            height="112"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={state === "done" ? "#10b981" : "#0ea5e9"}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute text-center">
            <span className="text-2xl font-bold tabular-nums text-slate-800 dark:text-slate-100">
              {mm}:{ss}
            </span>
          </div>
        </div>

        {state === "done" && (
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
            🎉 Session complete! Take a 5-min break.
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleToggle}
            className="rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600"
          >
            {state === "running"
              ? "Pause"
              : state === "done"
                ? "Start Again"
                : "Start"}
          </button>
          {state !== "idle" && (
            <button
              onClick={handleReset}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
